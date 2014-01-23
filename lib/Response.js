'use strict';
var ObjectManage = require('object-manage')
  , util = require('util')
  , File = require('./File')
  , mmm = require('mmmagic')
  , magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)
  , sysLog = require('./SysLog')

/**
 * APX Response constructor
 *
 * Takes an arbitrary number of parameters that are passed to ObjectManage.load
 * @constructor
 */
var Response = function(){
  ObjectManage.apply(this,arguments)
  this.body = null
  this.mimeType = null
  this.file = null
}
util.inherits(Response,ObjectManage)

/**
 * Mime type of the body response
 * @type {string}
 */
Response.prototype.mimeType = null

/**
 * Charset of the response (will default to utf8)
 * @type {null}
 */
Response.prototype.charset = null

/**
 * String containing raw response data
 * @type {string}
 */
Response.prototype.body = null

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
  if('string' !== typeof this.body) this.body = ''
  this.body = this.body + content
}

/**
 * Convenience method to call success
 * @param [message]  message to send instead of success or an object containing additional params
 * @param [code]  Code to be sent defaults to 0
 * @param [obj]  Object to be sent with the response
 */
Response.prototype.success = function(message,code,obj){
  if('number' === typeof message){
    code = message
    message = undefined
  }
  if('number' !== typeof code && 'object' === typeof code){
    obj = code
    code = undefined
  }
  if('string' !== typeof message && 'object' === typeof message){
    obj = message
    message = undefined
  }
  if(!code) code = 0
  this.set('status','ok')
  this.set('code',code.toString())
  this.set('message','success')
  if('string' === typeof message)
    this.set('message',message)
  if('object' === typeof obj)
    this.load(obj)
}

/**
 * Convenience method to throw an error
 * @param [message]
 * @param [code]
 * @param [obj]
 */
Response.prototype.error = function(message,code,obj){
  if('number' === typeof message){
    code = message
    message = undefined
  }
  if('number' !== typeof message && 'string' !== typeof message){
    obj = message
    message = undefined
  }
  if(!message) message = 'error'
  if('string' !== typeof message) message = util.inspect(message)
  if(!code) code = 1
  if('number' !== typeof code && 'object' === typeof code){
    obj = code
    code = 1
  }
  this.set('status','error')
  this.set('message',message)
  this.set('code',code.toString())
  if(obj && 'object' === typeof obj)
    this.load(obj)
}

/**
 * Prepare response to send a file
 * @param path  Path to the file to be read
 * @param name  Name of file to be presented to the user
 * @param [opts]  Options to be passed to the file object
 */
Response.prototype.sendFile = function(path,name,opts){
  this.file = new File(path,name,opts)
}

/**
 * Render response to be prepared for translation
 * @param next  Callback function
 */
Response.prototype.render = function(next){
  var self = this
  //check for a file
  if(null !== self.file){
    self.file.populate(function(){
      next(null,{
        format: 'file',
        file: self.file,
        mimeType: self.file.mimeType,
        charset: null
      })
    })
  } else if(null === self.mimeType && null !== self.body){
    magic.detect(new Buffer(self.body),function(err,mimeType){
      if(err){
        sysLog.warn('Could not detect mime type of body: ' + err)
        mimeType = 'application/octet-stream'
      }
      self.mimeType = mimeType
      next(null,{
        format: 'raw',
        body: self.body,
        mimeType: mimeType,
        charset: self.charset || 'utf8'
      })
    })
  } else if(null !== self.mimeType && null !== self.body){
    next(null,{
      format: 'raw',
      body: self.body,
      mimeType: self.mimeType,
      charset: self.charset || 'utf8'
    })
  } else {
    next(null,{
      format: 'object',
      data: self.data,
      mimeType: self.mimeType || 'application/json',
      charset: self.charset || 'utf8'
    })
  }
}

module.exports = Response
