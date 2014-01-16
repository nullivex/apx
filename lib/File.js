'use strict';
var fs = require('fs')
  , mime = require('mime')

var File = function(path,name){
  if(!fs.existsSync(path))
    throw new Error('File ' + path + 'does not exist')
  this.path = path
  if(name) this.name = name
  this.stats = fs.statSync(path)
  this.type = mime.lookup(path)
  this.extension = mime.extension(this.type)
}

/**
 * Path to the file
 * @type {null}
 */
File.prototype.path = null

/**
 * Stats about the file
 * @type {null}
 */
File.prototype.stats = null

/**
 * Name to reference the file by (usually a form input)
 * @type {null}
 */
File.prototype.name = null

/**
 * Mime type of the file
 * @type {null}
 */
File.prototype.type = null

/**
 * File extenstion based on the mime type
 * @type {null}
 */
File.prototype.extension = null

module.exports = File