/*
  The code in this file was lifted directly from
  the excellent Cachegoose repoistory (https://github.com/boblauer/cachegoose)
  and has only been updated by me as an experiment to learn
  more about caching mongodb data
*/

/* eslint-disable no-underscore-dangle */
import generateKey from "./generate-key";

const noop = () => {};
const hydrateWithoutPopulate = constructor => data => constructor.hydrate(data);
const isCacheCall = obj => (Object.prototype.hasOwnProperty.call(obj, "_ttl"));

const hydrateDocuments = ({
  hydrate,
  isLean,
  populate,
  mongooseHydrator,
}) => ({ documents, model }) => {
  let results = documents;

  // if we can and should hydrate then always
  // find/fill subdocs and return the model(s)
  if (hydrate) {
    results = Array.isArray(documents)
      ? documents.map(doc => model.hydrateMe({ json: doc, populate }))
      : model.hydrateMe({ json: documents, populate });
  }

  // if hydrate is false then just rehydrate
  // and return the model(s) without population as usual
  if (!isLean) {
    results = Array.isArray(documents)
      ? documents.map(mongooseHydrator)
      : mongooseHydrator(documents);
  }

  // otherwise just reurn the results unchanged
  return results;
};

module.exports = function extendQuery(mongoose, cache) {
  const { exec } = mongoose.Query.prototype;

  // eslint-disable-next-line no-param-reassign
  mongoose.Query.prototype.exec = function newExec(...args) {
    if (!isCacheCall(this)) {
      return exec.apply(this, args);
    }

    let op = args[0] || null;
    let callback = args[1] || noop;

    if (typeof op === "function") {
      callback = op;
      op = null;
    } else if (typeof op === "string") {
      this.op = op;
    }

    const { model, _ttl: ttl } = this;
    const key = this._key || this.getCacheKey();
    const { modelName } = model;
    const isCount = ["count", "countDocuments", "estimatedDocumentCount"].includes(this.op);
    const isLean = this._mongooseOptions.lean;
    const hydrate = (typeof model.hydrateMe === "function" && this._hydrate);

    const populate = this._populate || undefined;
    const mongooseHydrator = hydrateWithoutPopulate(mongoose.model(modelName));
    const hydrator = hydrateDocuments({ hydrate, isLean, populate, mongooseHydrator });

    return new Promise((resolve, reject) => {
      cache.get(key, (_err, results) => {
        if (results != null) {
          // eslint-disable-next-line no-console
          console.debug(`[debug] { model: "${modelName}", results: "cache", ttl: ${ttl || 0}, key: ${key} }`);

          if (isCount) {
            callback(null, results);
            return resolve(results);
          }

          const hydratedResults = hydrator({ documents: results, model });
          callback(null, hydratedResults);
          return resolve(hydratedResults);
        }

        // eslint-disable-next-line no-console
        console.debug(`[debug] { model: "${modelName}", results: "mongodb" }`);
        return exec
          .call(this)
          .then(dbResults => hydrator({ documents: dbResults, model }))
          .then(hydratedResults => {
            cache.set(key, hydratedResults, ttl, () => {
              callback(null, hydratedResults);
              return resolve(hydratedResults);
            });
          })
          .catch(err => {
            callback(err);
            reject(err);
          });
      });
    });
  };

  // eslint-disable-next-line no-param-reassign
  mongoose.Query.prototype.cache = function getCache({
    ttl = 60, customKey = "",
    hydrate = false,
    populate = null,
  } = {}) {
    this._ttl = ttl;
    this._key = customKey;
    this._hydrate = hydrate;
    this._populate = populate;
    return this;
  };

  // eslint-disable-next-line no-param-reassign
  mongoose.Query.prototype.getCacheKey = function getCacheKey() {
    const key = {
      model: this.model.modelName,
      op: this.op,
      skip: this.options.skip,
      limit: this.options.limit,
      sort: this.options.sort,
      _options: this._mongooseOptions,
      _conditions: this._conditions,
      _fields: this._fields,
      _path: this._path,
      _distinct: this._distinct,
    };

    return generateKey(key);
  };
};
