var ObjectManage = require('object-manage')

/**
 * APX Response constructor
 *
 * @param cb
 * @constructor
 */
var Response = function(cb){
  this.cb = cb || function(){}
  this.obj = new ObjectManage()
  this.data = this.obj.data
  this.body = ''
  this.rendered = ''
  this.warnings = []
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
    this.rendered = JSON.stringify(this.data)
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
  this.send({status: 'error', message: message})
}

/**
 * Internal warnings about rendering and parsing
 * @param message
 */
Response.prototype.warn = function(message){
  console.log('[WARN] APX Response: ' + message)
  this.warnings.push(message)
}

module.exports = Response