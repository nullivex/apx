'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')
  , SysLog = require('./SysLog')

/**
 * APX Response constructor
 *
 * @param cb
 * @constructor
 */
var Response = function(cb){
  var that = this
  that.cb = cb || function(){}
  that.obj = new ObjectManage()
  that.data = that.obj.data
  that.body = ''
  that.rendered = ''
  that.warnings = []
}
/**
 * Callback function
 * @type {function}
 */
Response.prototype.cb = function(){}
/**
 * Object Manage instance
 * @type {null}
 */
Response.prototype.obj = null
/**
 * Object a reference to the object manage data object
 * @type {{}}
 */
Response.prototype.data = {}
/**
 * String containing raw response data
 * @type {string}
 */
Response.prototype.body = ''
/**
 * Rendered result of .send()
 * @type {string}
 */
Response.prototype.rendered = ''
/**
 * Warnings from rendering
 * @type {Array}
 */
Response.prototype.warnings = []

/**
 * Get a value by path from the data object
 * @param path
 * @returns {*|Object|Array|String}
 */
Response.prototype.get = function(path){
  return this.obj.get(path)
}

/**
 * Set a value by path to the data object
 * @param path
 * @param value
 */
Response.prototype.set = function(path,value){
  this.obj.set(path,value)
}

/**
 * Check if a data object exists
 * @param path
 * @returns {*|boolean}
 */
Response.prototype.exists = function(path){
  return this.obj.exists(path)
}

/**
 * Remove a path from the datta object
 * @param path
 */
Response.prototype.remove = function(path){
  this.obj.remove(path)
}

/**
 * Add content to response
 * @param content
 */
Response.prototype.add = function(content){
  if('object' === typeof content){
    this.obj.load(content)
  } else if('string' === typeof content){
    this.body = this.body + content
  }
}

/**
 * Send content to client
 * @param content Optional (will call .add(content) and then send())
 * @returns {*}
 */
Response.prototype.send = function(content){
  if(undefined === content){
    this.rendered = JSON.stringify(this.obj.data)
    if('{}' === this.rendered) this.rendered = ''
    //warn if sending a combo response
    if(this.body !== '' && this.rendered !== '')
      this.warn('JSON and String body rendered')
    this.rendered = this.rendered + this.body
    this.cb(this)
  } else {
    this.add(content)
    this.send()
  }
}

/**
 * Convenience method to call success
 */
Response.prototype.success = function(){
  this.send({status: 'ok', message: 'success'})
}

/**
 * Convenience method to throw an error
 * @param message
 */
Response.prototype.error = function(message){
  this.send({status: 'error', message: util.inspect(message)})
}

/**
 * Internal warnings about rendering and parsing
 * @param message
 */
Response.prototype.warn = function(message){
  SysLog.warn('Response: ' + message,2)
  this.warnings.push(message)
}

module.exports = Response