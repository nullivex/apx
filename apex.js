/*!
 * Module dependencies.
 */
//var BCRYPT = require("bcrypt")

/*!
 * "Constants"
 */
//var DEFAULT_WORK_FACTOR = 12

/**
 * Abstract Apex constructor
 *
 * This is the base class that drivers inherit from and implement.
 *
 * @api public
 */
var Apex = {}

/**
 * The current util subspace
 *
 * @api public
 * @property util
 */
Apex.prototype.util

/**
 * Initializer
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
Apex.prototype.init = function(mods){
  this.util = {}
  if("array" === typeof mods){
    if(mods.indexOf("bcrypt") > -1){
      this.util.bcrypt = require("util/bcrypt").init()
    }
  }
}

/*!
 * Module exports.
 */
module.exports = Apex
