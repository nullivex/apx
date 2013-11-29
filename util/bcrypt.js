"use strict";
/*!
 * Module dependencies.
 */
var BCRYPT = require("bcrypt")

/*!
 * "Constants"
 */
var DEFAULT_WORK_FACTOR = 12

/*!
 * Module exports.
 */
/**
 * Abstract Bcrypt constructor
 *
 * This is the base class that drivers inherit from and implement.
 *
 * @param {Number} workfactor Salt generation "work factor" (default: 12)
 * @api public
 */
module.exports = function(){
  this.initted = false
  this.work_factor = DEFAULT_WORK_FACTOR
  return this
}

module.exports.init = function(factor){
  if(!this.initted){
    if(factor + 0 < 1) factor = DEFAULT_WORK_FACTOR
    this.work_factor = factor
  }
  this.initted = true
  return this
}
/**
 * Encode a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
module.exports.encode = function(str){
  this.init()
  return BCRYPT.hashSync(str,BCRYPT.genSaltSync(this.work_factor))
}

/**
 * Compare a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
module.exports.compare = function(str,crypted,fn){
  BCRYPT.compare(str, crypted, fn)
}
