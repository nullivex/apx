'use strict';
var util = require('util')

/**
 * Early logger for init messages before
 * winston is started logs to console only
 * @param msg
 * @param [level]
 */
var log = function(msg,level){
  if(undefined === level) level = 3
  var levels = {
    0: 'ERROR',
    1: 'WARN',
    2: 'NOTICE',
    3: 'INFO',
    4: 'DEBUG'
  }
  if(level <= exports.level){
    if('string' !== typeof msg) msg = util.inspect(msg)
    var date = new Date()
    console.log('[' + date.getTime() + '] [APX-'+ levels[level] +']: ' + msg)
  }
}

/**
 * Current log level for sysLogger (not winston)
 * defaults to 4 when NODE_ENV != production and 1
 * when int production mode
 * @type {number}
 */
exports.level = 3

/**
 * Log Macro functions
 * @type {{error: Function, warn: Function, notice: Function, info: Function, debug: Function}}
 */
exports.error = function(msg){log(msg,0)}
exports.warn = function(msg){log(msg,1)}
exports.notice = function(msg){log(msg,2)}
exports.info = function(msg){log(msg,3)}
exports.debug = function(msg){log(msg,4)}