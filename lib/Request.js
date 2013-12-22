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

module.exports = Request