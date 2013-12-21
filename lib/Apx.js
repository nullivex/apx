'use strict';
var path = require('path')
  , glob = require('glob')
  , winston = require('winston')
  , ObjectManage = require('object-manage')
  , async = require('async')
  , events = require('events')
  , emitter

/**
 * Setup Event Emitter
 * @type {EventEmitter}
 */
module.exports = emitter = new events.EventEmitter()

/**
 * Main constructor sets options
 * @param options
 */
var Apx = function(options){
  var that = this
  that.sysLog = require('./SysLog')
  //set syslog level now
  if('production' === process.env.NODE_ENV){
    that.sysLog.level = 1
  }
  if(options.sysLogLevel) that.sysLog.level = options.sysLogLevel
  that.sysLog.info('Welcome to APX')
  //freshen
  that.initializers = []
  that.log = null
  that.services = []
  that.tasks = []
  that.translators = []
  //load config
  that.sysLog.info('Loading configuration options')
  options = options || {}
  that.config = new ObjectManage(that.configSchema)
  //load runtime config first and last (config files in the middle)
  that.config.load(options)
  //load additional config
  that.loadItems(
    that.config.get('config'),
    function(config,next){
      that.config.load(config)
      next()
    },
    //finish init here so we know the config is loaded fully
    function(){
      //pass rest of the options to config
      //  so that runtime options are kept over all else
      that.config.load(options)
      that.sysLog.info('Config loading complete')
      //update ready state
      that.readyState = 2
      emitter.emit('readyStateChange',that.readyState)
    }
  )
}

/**
 * Ready state of APX
 *  0 - Dead
 *  1 - Ready
 *  2 - Configured
 *  3 - Starting
 *  4 - Stopping
 * @type {Number}
 */
Apx.prototype.readyState = 0

/**
 * Registered initializers
 * @type {Array}
 */
Apx.prototype.initializers = []

/**
 * Winston logging instance
 * @type {null}
 */
Apx.prototype.log = null

/**
 * Instantiated services
 * @type {Array}
 */
Apx.prototype.services = []

/**
 * Registered tasks
 * @type {Array}
 */
Apx.prototype.tasks = []

/**
 * Registered translators
 * @type {Array}
 */
Apx.prototype.translators = []

/**
 * Request object
 * @type {Function}
 */
Apx.prototype.Request = require('./Request')

/**
 * Response Object
 * @type {Function}
 */
Apx.prototype.Response = require('./Response')

/**
 * Initial config schema
 * @type {*}
 */
Apx.prototype.configSchema = {
  testing: false,
  cwd: '',
  tasks: [],
  translators: [],
  initializers: [],
  winston: {
    console: true,
    file: ''
  }
}

/**
 * Load additional config properties
 */
Apx.prototype.load = function(options){
  this.config.load(options)
}

/**
 * Worker init
 */
Apx.prototype.start = function(){
  var that = this
  //update ready state
  that.readyState = 3
  emitter.emit('readyStateChange',that.readyState)
  //send welcome message
  that.sysLog.info('Hi! Beginning APX initialization and startup')
  that.sysLog.info('Setting up log transports')
  //setup logging
  var logTransports = []
  if(that.config.get('winston.console')){
    logTransports.push(new (winston.transports.Console)())
  }
  if(that.config.get('winston.file')){
    logTransports.push(new (winston.transports.File)({
      filename: that.config.get('winston.file')
    }))
  }
  if(that.config.get('testing')){
    require('winston-memory').Memory()
    logTransports = [new (winston.transports.Memory)()]
  }
  that.log = new (winston.Logger)({
    transports: logTransports
  })
  that.sysLog.info('Winston logger now active, will continue to sysLog init messages')

  //setup loaders so we can run them async (which is async of async)
  var loaders = [
    //load initializers
    function(finish){
      if(that.config.get('initializers')){
        that.sysLog.info('Starting to load initializers')
        that.loadItems(
          that.config.get('initializers'),
          function(initializer,next){
            that.initializers[initializer.name] = initializer.start(that,next)
          },
          function(err){
            that.sysLog.info('Finished loading initializers')
            finish(err)
          }
        )
      }

    },
    //load translators
    function(finish){
      if(that.config.get('translators')){
        that.sysLog.info('Starting to load translators')
        that.loadItems(
          that.config.get('translators'),
          function(translator,next){
            that.translators[translator.name] = translator.start(that,next)
          },
          function(err){
            that.sysLog.info('Finished loading translators')
            finish(err)
          }
        )
      }

    }
  ]
  //fire the loaders
  async.eachSeries(
    loaders,
    function(loader,next){
      loader(next)
    },
    function(err){
      //emit error event if there are errors
      if(err){
        emitter.emit('error',err)
      }
      //call the ready function
      that.sysLog.info('APX system startup complete')
      //update ready state
      that.readyState = 1
      emitter.emit('readyStateChange',that.readyState)
      //fire ready event
      emitter.emit('ready',that)
    }
  )

}

/**
 * Destruct the APX instance and shutdown translators
 */
Apx.prototype.stop = function(){
  var that = this
  //update ready state
  that.readyState = 4
  emitter.emit('readyStateChange',that.readyState)
  //inform user of shutdown
  that.sysLog.info('Starting to shutdown APX')
  //setup loaders so we can run them async (which is async of async)
  var loaders = [
    //load initializers
    function(finish){
      if(that.config.get('initializers')){
        that.sysLog.info('Starting to shutdown initializers')
        that.loadItems(
          that.config.get('initializers'),
          function(initializer,next){
            that.initializers[initializer.name] = initializer.stop(that,next)
          },
          function(err){
            that.sysLog.info('Finished shutting down initializers')
            finish(err)
          }
        )
      }
    },
    //load translators
    function(finish){
      if(that.config.get('translators')){
        that.sysLog.info('Starting to shutdown translators')
        that.loadItems(
          that.config.get('translators'),
          function(translator,next){
            that.translators[translator.name] = translator.stop(that,next)
          },
          function(err){
            that.sysLog.info('Finished shutting down translators')
            finish(err)
          }
        )
      }

    }
  ]
  //fire the loaders
  async.eachSeries(
    loaders,
    function(loader,next){
      loader(next)
    },
    function(err){
      //emit error event if there are errors
      if(err){
        emitter.emit('error',err)
      }
      //call the ready function
      that.sysLog.info('APX system shutdown complete')
      //update ready stats
      that.readyState = 0
      emitter.emit('readyStateChange',that.readyState)
      //fire dead event
      emitter.emit('dead',that)
    }
  )
}

/**
 * Resolve path with CWD
 * @param file
 * @returns {*}
 */
Apx.prototype.resolvePath = function(file){
  var rv = file
    , cwd = this.config.get('cwd')
  if(cwd)
    rv = cwd + '/' + file
  return path.resolve(rv)
}

/**
 * Will take an array of items/globs and
 * load them against the environment and will
 * fire iterator with the item object on success
 * @param items
 * @param iterator
 * @param done
 */
Apx.prototype.loadItems = function(items,iterator,done){
  if(undefined === items) done()
  else {
    var that = this
      , cwd = path.resolve(that.config.get('cwd'))
    if('string' === typeof items) items = [items]
    //do all of this async
    async.each(
      items,
      function(item,finish){
        //try to load a package name natively
        if(-1 === item.indexOf('/') && -1 === item.indexOf('\\') && -1 === item.indexOf('.js')){
          that.sysLog.info('Loading package (' + item + ')')
          iterator(require(item),finish)
          //try to resolve the path with glob
        } else {
          glob(item,{cwd: cwd},function(err,files){
            if(err) throw err
            async.each(
              files,
              function(file,next){
                that.sysLog.info('Loading package from path (' + that.resolvePath(file) + ')')
                iterator(require(that.resolvePath(file)),next)
              },
              finish
            )
          })
        }
      },
      done
    )
  }
}

/**
 * Run APX action
 *  Should be called by a translator
 * @param action  Can be an action or a filename to require
 * @param req
 * @param method
 * @param fn
 */
Apx.prototype.runAction = function(action,req,method,fn){
  if('function' === typeof method){
    fn = method
    method = 'run'
  }
  if('string' === typeof action) action = require(this.resolvePath(action))
  if(false === (req instanceof this.Request))
    req = new this.Request(req)
  this.sysLog.info('Running action ' + action.name + ' : ' + method)
  //run action
  emitter.emit('runActionBefore',action)
  action[method](this,req,new this.Response(fn))
  emitter.emit('runActionAfter',action)
}

/**
 * Run APX task
 * @param task  Can be a task or a filename to require
 * @param req
 * @param done
 */
Apx.prototype.runTask = function(task,req,done){
  if('string' === typeof task) task = require(this.resolvePath(task))
  if(false === (req instanceof this.Request))
    req = new this.Request(req)
  this.sysLog.info('Running task ' + task.name)
  //run task
  emitter.emit('runTaskBefore',task)
  task.run(this,req,done)
  emitter.emit('runTaskAfter',task)
}

/**
 * Returns new service instance
 * @param service  Can be a service or a filename to require
 * @returns {service}
 */
Apx.prototype.newService = function(service){
  if('string' === typeof service) service = require(this.resolvePath(service))
  this.sysLog.info('Returning new service instance for ' + service.name)
  return new service.module()
}

/**
 * Obtain service instance
 *  manages singletons
 * @param service  Can be a service or a filename to require
 * @returns {*}
 */
Apx.prototype.service = function(service){
  if('string' === typeof service) service = require(this.resolvePath(service))
  if(!this.services[service.name]){
    this.services[service.name] = new service.module()
  }
  this.sysLog.info('Returning service instance for ' + service.name)
  return this.services[service.name]
}

/**
 * Operation of APX library
 *   Implements standard daemon operators (start/stop)
 */
var instance
module.exports.setup = function(opts){
  instance = new Apx(opts)
}
module.exports.start = function(){
  instance.start()
}
module.exports.stop = function(){
  instance.stop()
  emitter.on('stop',function(){
    instance = undefined
  })
}
module.exports.Apx = Apx
