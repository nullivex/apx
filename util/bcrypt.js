/*!
 * Module dependencies.
 */
var BCRYPT = require("bcrypt")

/*!
 * "Constants"
 */
var DEFAULT_WORK_FACTOR = 12

/**
 * Abstract Bcrypt constructor
 *
 * This is the base class that drivers inherit from and implement.
 *
 * @param {Number} workfactor Salt generation "work factor" (default: 12)
 * @api public
 */
function Bcrypt(factor){
  if(factor + 0 < 1) factor = DEFAULT_WORK_FACTOR
  this.work_factor = factor
}

/**
 * The current "work factor" (see bcrypt lib docs)
 *
 * @api public
 * @property work_factor
 */
Bcrypt.prototype.work_factor

/**
 * Encode a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
Bcrypt.prototype.encode = function(str){
  if(this.work_factor + 0 < 1) this.work_factor = DEFAULT_WORK_FACTOR
  return BCRYPT.hashSync(str,BCRYPT.genSaltSync(this.work_factor))
}

/**
 * Compare a string
 *
 * @param {String} payload Payload string to encode
 * @api public
 */
Bcrypt.prototype.compare = function(str,crypted,fn){
  BCRYPT.compare(str, crypted, fn)
}

/*!
 * Module exports.
 */
module.exports = Bcrypt
