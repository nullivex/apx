'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')
  , SysLog = require('./SysLog')

/**
 * APX Response constructor
 *
 * @param data
 * @constructor
 */
var Response = function(data){
  var self = this
  ObjectManage.call(this,data)
  self.body = ''
  self.rendered = ''
  self.warnings = []
}
util.inherits(Response,ObjectManage)

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
 * Add content to response
 * @param content
 */
Response.prototype.add = function(content){
  if('object' === typeof content){
    this.load(content)
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
    this.rendered = JSON.stringify(this.data)
    if('{}' === this.rendered) this.rendered = ''
    //warn if sending a combo response
    if(this.body !== '' && this.rendered !== '')
      this.warn('JSON and String body rendered')
    this.rendered = this.rendered + this.body
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
  if('string' !== typeof message) message = util.inspect(message)
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
