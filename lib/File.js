'use strict';
var fs = require('fs')

var File = function(path){
  this.path = path
  this.stats = fs.statSync(path)
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

module.exports = File