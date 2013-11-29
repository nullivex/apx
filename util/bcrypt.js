"use strict";
var _bcrypt = false
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
  if(!_bcrypt) _bcrypt = this.init()
  return _bcrypt
}

module.exports.init = function(factor){
  if(!_bcrypt){
    if(factor + 0 < 1) factor = DEFAULT_WORK_FACTOR
    _bcrypt = this
    _bcrypt.work_factor = factor
    _bcrypt.salt = false
  }
  _bcrypt.salt = _bcrypt.salt || BCRYPT.genSaltSync(_bcrypt.work_factor)
  return _bcrypt
}
/**
 * Encode a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
module.exports.encode = function(str,salt){
  _bcrypt.init()
  return BCRYPT.hashSync(str,salt || _bcrypt.salt)
}

/**
 * Compare a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
module.exports.compare = function(str,crypted,fn){
  return BCRYPT.compareSync(str,crypted,fn)
}
