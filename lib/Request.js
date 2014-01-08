'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')

/**
 * APX Request Constructor
 *
 * @param data
 * @constructor
 */
var Request = function(data){
  ObjectManage.call(this,data)
}
util.inherits(Request,ObjectManage)

/**
 * Reference to an incoming file object should be set by the translator
 * @type {null}
 */
Request.prototype.file = null

module.exports = Request