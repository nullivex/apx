'use strict';
var fs = require('fs')
  , mime = require('mime')
  , mmm = require('mmmagic')
  , magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)
  , path = require('path')
  , ObjectManage = require('object-manage')

/**
 * Constructor of the file object
 * @param filePath  Path to the file
 * @param fileName  Name of the file as it was uploaded
 * @param fieldName Field name of the file from uploading
 * @param options  Options to control how the file is handled by translators
 * @constructor
 */
var File = function(filePath,fileName,fieldName,options){
  var self = this
  //check if the file exists first
  if(!fs.existsSync(filePath))
    throw new Error('File ' + filePath + 'does not exist')
  self.path = filePath
  //allow options to be passed in place of name
  if('string' !== typeof fileName && 'object' === typeof fileName){
    options = fileName
    fileName = undefined
  }
  if('string' !== typeof fieldName && 'object' === typeof fieldName){
    options = fieldName
    fieldName = undefined
  }
  //set the name handle explicitly or based on the filename
  if(fileName) self.name = fileName
  else self.name = path.basename(filePath)
  if(fieldName) self.fieldName = fieldName
  else self.fieldName = 'file'
  //set the options
  self.options = new ObjectManage()
  self.options.load(self.defaultOptions)
  self.options.load(options)
}

/**
 * Default Options for sending the file
 * @type {{}}
 */
File.prototype.defaultOptions = {
  tmpFile: false
}

/**
 * ObjectManage handle for managing options
 * @type {null}
 */
File.prototype.options = null

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
 * Name of the file as it was uploaded
 * @type {null}
 */
File.prototype.name = null

/**
 * Field name that was used to upload the file
 * @type {null}
 */
File.prototype.fieldName = null

/**
 * Mime type of the file
 * @type {null}
 */
File.prototype.mimeType = null

/**
 * File extension based on the mime type
 * @type {null}
 */
File.prototype.mimeExtension = null

/**
 * Populate mime type and file stats and call the next function on completion
 * @param next
 */
File.prototype.populate = function(next){
  var self = this
  if(null !== self.stats && null !== self.mimeType && null !== self.mimeExtension){
    next()
  } else {
    //get file stats
    fs.stat(self.path,function(err,stats){
      if(err) next(err)
      else {
        self.stats = stats
        //detect the mime type
        magic.detectFile(self.path,function(err,mimeType){
          if(err) mimeType = 'application/octet-stream'
          self.mimeType = mimeType
          self.mimeExtension = mime.extension(mimeType)
          next(null)
        })
      }
    })
  }
}

/**
 * Clear stats and mime type to be repopulated
 */
File.prototype.clear = function(){
  this.stats = null
  this.mimeType = null
  this.mimeExtension = null
}

module.exports = File