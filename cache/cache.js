/*
  The code in this file was lifted directly from
  the excellent Cachegoose repoistory (https://github.com/boblauer/cachegoose)
  and has only been updated by me as an experiment to learn
  more about caching mongodb data
*/

/* eslint-disable no-underscore-dangle */
import Cacheman from "cacheman";

const noop = () => {};

function Cache(options) {
  this._cache = new Cacheman("cachegoose-cache", options);
  this._engineName = options.engine || "memory";
}

Cache.prototype.get = function get(key, cb = noop) {
  return this._cache.get(key, cb);
};

Cache.prototype.set = function set(key, value, ttl, cb = noop) {
  return this._cache.set(key, value, ttl === 0 ? -1 : ttl, cb);
};

Cache.prototype.del = function del(key, cb = noop) {
  return this._cache.del(key, cb);
};

Cache.prototype.clear = function clear(cb = noop) {
  return this._cache.clear(cb);
};

Cache.prototype.close = function close(cb = noop) {
  if (this._engineName === "redis") {
    return this._cache._engine.client.quit(cb);
  }
  return cb();
};

module.exports = function cache(options) {
  return new Cache(options);
};
