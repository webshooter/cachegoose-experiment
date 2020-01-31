/*
  The code in this file was lifted directly from
  the excellent Cachegoose repoistory (https://github.com/boblauer/cachegoose)
  and has only been updated by me as an experiment to learn
  more about caching mongodb data
*/

import theCache from "./cache";
import extendQuery from "./extend-query";
import extendAggregate from "./extend-aggregate";

let hasRun = false;
let cache;

module.exports = function init(mongoose, cacheOptions = {}, cb = () => {}) {
  if (typeof mongoose.Model.hydrate !== "function") {
    throw new Error("Cachegoose is only compatible with versions of mongoose that implement the `model.hydrate` method");
  }

  if (hasRun) {
    return;
  }

  hasRun = true;

  cache = theCache(cacheOptions);

  // eslint-disable-next-line no-underscore-dangle
  init._cache = cache;

  extendQuery(mongoose, cache);
  extendAggregate(mongoose, cache);

  cb();
};

module.exports.close = (cb = () => {}) => cache.close(cb);

module.exports.clearCache = (customKey, cb = () => { }) => (
  customKey ? cache.del(customKey, cb) : cache.clear(cb)
);
