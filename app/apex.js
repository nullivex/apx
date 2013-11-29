"use strict";
var _apex = false
/*!
 * Module dependencies.
 */
var async = require("async")

/*!
 * "Constants"
 */
//var DEFAULT_WORK_FACTOR = 12

/*!
 * Module exports.
 */
module.exports = function(){
  if(!_apex) _apex = this.init()
  return _apex
}

module.exports.util = {"bcrypt": null}
/**
 * Util module loader
 *
 * @param {String} mod Modules to load and link under util
 * @api public
 */
module.exports.util.load = function(mod){
  if("bcrypt" === mod){
    this.bcrypt = require("../util/bcrypt").init()
  }
  return _apex
}

/**
 * Initializer
 *
 * @param {Array} mods List of modules to preload
 * @api public
 */
module.exports.init = function(mods){
  if("array" === typeof mods){
    async.each(mods, _apex.util.load, function(err){
      return _apex
    })
  } else return _apex
}
