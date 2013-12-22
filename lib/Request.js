'use strict';
var ObjectManage = require('object-manage')

/**
 * APX Request Constructor
 *
 * @param data
 * @constructor
 */
var Request = function(data){
  var self = this
  self.obj = new ObjectManage(data)
  self.obj.on('load',function(data){
    self.data = data
  })
}

/**
 * Object management instance
 * @type {null}
 */
Request.prototype.obj = null

/**
 * Reference to managed data object
 * @type {{}}
 */
Request.prototype.data = {}

/**
 * Load extra data and merge it into the data object
 * @param data
 */
Request.prototype.load = function(data){
  this.obj.load(data)
}

/**
 * Get data value by key
 * @param path
 * @returns {*}
 */
Request.prototype.get = function(path){
  return this.obj.get(path)
}

/**
 * Set key value to the data object
 * @param path
 * @param value
 * @returns {*}
 */
Request.prototype.set = function(path,value){
  return this.obj.set(path,value)
}

/**
 * Check if request value exists
 * @param path
 * @returns {*|*|boolean|boolean}
 */
Request.prototype.exists = function(path){
  return this.obj.exists(path)
}

/**
 * Remove portion of request by path
 * @param path
 */
Request.prototype.remove = function(path){
  this.obj.remove(path)
}

module.exports = Request