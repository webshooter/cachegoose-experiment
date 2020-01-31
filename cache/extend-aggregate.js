/*
  The code in this file was lifted directly from
  the excellent Cachegoose repoistory (https://github.com/boblauer/cachegoose)
  and has only been updated by me as an experiment to learn
  more about caching mongodb data
*/

/* eslint-disable no-underscore-dangle */
import generateKey from "./generate-key";

let hasBeenExtended = false;

const noop = () => {};
const isCacheCall = obj => (Object.prototype.hasOwnProperty.call(obj, "_ttl"));

module.exports = function extendAggregate(mongoose, cache) {
  const { aggregate } = mongoose.Model;

  function extend(Aggregate) {
    const { exec } = Aggregate.prototype;

    // eslint-disable-next-line no-param-reassign
    Aggregate.prototype.exec = function newExec(...args) {
      if (!isCacheCall(this)) {
        return exec.apply(this, args);
      }

      const key = this._key || this.getCacheKey();
      const ttl = this._ttl;
      const cb = args[0] || noop;

      return new Promise((resolve, reject) => {
        cache.get(key, (_err, cachedResults) => {
          if (cachedResults) {
            cb(null, cachedResults);
            return resolve(cachedResults);
          }

          return exec
            .call(this)
            .then(results => {
              cache.set(key, results, ttl, () => {
                cb(null, results);
                resolve(results);
              });
            })
            .catch(error => {
              cb(error);
              reject(error);
            });
        });
      });
    };

    // eslint-disable-next-line no-param-reassign
    Aggregate.prototype.cache = function getCache({ ttl = 60, customKey = "" }) {
      this._ttl = ttl;
      this._key = customKey;
      return this;
    };

    // eslint-disable-next-line no-param-reassign
    Aggregate.prototype.getCacheKey = function getCacheKey() {
      return generateKey(this._pipeline);
    };
  }

  // eslint-disable-next-line no-param-reassign
  mongoose.Model.aggregate = function newAggregate() {
    // eslint-disable-next-line prefer-rest-params
    const res = aggregate.apply(this, arguments);

    if (!hasBeenExtended && res.constructor && res.constructor.name === "Aggregate") {
      extend(res.constructor);
      hasBeenExtended = true;
    }

    return res;
  };
};
