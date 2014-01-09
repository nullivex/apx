'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')

/**
 * APX Response constructor
 *
 * @param data
 * @constructor
 */
var Response = function(data){
  ObjectManage.call(this,data)
  this.body = ''
}
util.inherits(Response,ObjectManage)

/**
 * String containing raw response data
 * @type {string}
 */
Response.prototype.body = ''

/**
 * Reference to an outgoing file object that the translator should consume
 * @type {null}
 */
Response.prototype.file = null

/**
 * Add content to response
 * @param content
 */
Response.prototype.add = function(content){
  if('string' !== typeof content){
    throw new Error('Add only works with strings')
  }
  this.body = this.body + content
}

/**
 * Convenience method to call success
 * @param [obj]  Object containing additional params
 */
Response.prototype.success = function(obj){
  this.load({status: 'ok', message: 'success'})
  if('object' === typeof obj)
    this.load(obj)
}

/**
 * Convenience method to throw an error
 * @param message
 */
Response.prototype.error = function(message){
  if('string' !== typeof message) message = util.inspect(message)
  this.set('status','error')
  this.set('message',message)
}

module.exports = Response
