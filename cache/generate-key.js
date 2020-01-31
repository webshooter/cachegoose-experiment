/*
  The code in this file was lifted directly from
  the excellent Cachegoose repoistory (https://github.com/boblauer/cachegoose)
  and has only been updated by me as an experiment to learn
  more about caching mongodb data
*/

import jsosort from "jsosort";
import sha1 from "sha1";

const transcode = (key, val) => (val instanceof RegExp ? String(val) : val);
const init = obj => sha1(JSON.stringify(jsosort(obj), transcode));

module.exports = init;
