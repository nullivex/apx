'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')
  , File = require('./File')

/**
 * APX Request Constructor
 *
 * Takes an arbitrary number of parameters that get loaded data
 * @constructor
 */
var Request = function(){
  ObjectManage.apply(this,arguments)
}
util.inherits(Request,ObjectManage)

/**
 * Reference to an incoming file object should be set by the translator
 * @type {Array}
 */
Request.prototype.files = []

/**
 * Add file to the request by path
 * @param path
 */
Request.prototype.addFile = function(path){
  this.files.push(new File(path))
}

module.exports = Request