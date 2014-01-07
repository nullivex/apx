'use strict';
var path = require('path')
  , glob = require('glob')
  , ObjectManage = require('object-manage')
  , async = require('async')
  , events = require('events')
  , util = require('util')
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
  var self = this
  self.sysLog = require('./SysLog')
  //set syslog level now
  if('production' === process.env.NODE_ENV){
    self.sysLog.level = 1
  }
  if(options.sysLogLevel) self.sysLog.level = options.sysLogLevel
  self.sysLog.info('Welcome to APX')
  //freshen
  self.initializers = []
  self.log = null
  self.middleware = []
  this.models = []
  self.services = []
  self.tasks = []
  self.translators = []
  self.options = options
}

/**
 * Options passed to the constructor
 * @type {{}}
 */
Apx.prototype.options = {}

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
  middleware: [],
  models: [],
  tasks: [],
  translators: [],
  initializers: []
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
  var self = this
  //send welcome message
  self.sysLog.info('Hi! Beginning APX initialization and startup')
  //setup loaders so we can run them async (which is async of async)
  var loaders = [
    //load configuration
    function(finish){
      self.sysLog.info('Loading configuration options')
      self.options = self.options || {}
      self.config = new ObjectManage(self.configSchema)
      //load runtime config first and last (config files in the middle)
      self.config.load(self.options)
      //load additional config
      self.loadItems(
        self.config.get('config'),
        function(config,next){
          self.config.load(config)
          next()
        },
        //finish init here so we know the config is loaded fully
        function(err){
          if(err) throw err
          //pass rest of the options to config
          //  so that runtime options are kept over all else
          self.config.load(self.options)
          self.sysLog.info('Config loading complete')
          //update ready state
          self.readyState = 2
          emitter.emit('readyStateChange',self.readyState)
          //update ready state
          self.readyState = 3
          emitter.emit('readyStateChange',self.readyState)
          finish()
        }
      )
    },
    //load initializers
    function(finish){
      if(self.config.get('initializers')){
        self.sysLog.info('Starting to load initializers')
        self.loadItems(
          self.config.get('initializers'),
          function(initializer,next){
            self.sysLog.info('Starting initializer: ' + initializer.name)
            self.initializers[initializer.name] = initializer.start(self,next)
          },
          function(err){
            self.sysLog.info('Finished loading initializers')
            finish(err)
          }
        )
      }

    },
    //load translators
    function(finish){
      if(self.config.get('translators')){
        self.sysLog.info('Starting to load translators')
        self.loadItems(
          self.config.get('translators'),
          function(translator,next){
            self.sysLog.info('Starting translator: ' + translator.name)
            self.translators[translator.name] = translator.start(self,next)
          },
          function(err){
            self.sysLog.info('Finished loading translators')
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
      self.sysLog.info('APX system startup complete')
      //update ready state
      self.readyState = 1
      emitter.emit('readyStateChange',self.readyState)
      //fire ready event
      emitter.emit('ready',self)
    }
  )

}

/**
 * Destruct the APX instance and shutdown translators
 */
Apx.prototype.stop = function(){
  var self = this
  //update ready state
  self.readyState = 4
  emitter.emit('readyStateChange',self.readyState)
  //inform user of shutdown
  self.sysLog.info('Starting to shutdown APX')
  //setup loaders so we can run them async (which is async of async)
  var loaders = [
    //load translators
    function(finish){
      if(self.config.get('translators')){
        self.sysLog.info('Starting to shutdown translators')
        self.loadItems(
          self.config.get('translators'),
          function(translator,next){
            self.sysLog.info('Stopping translator: ' + translator.name)
            self.translators[translator.name] = translator.stop(self,next)
          },
          function(err){
            self.sysLog.info('Finished shutting down translators')
            finish(err)
          }
        )
      }
    },
    //load initializers
    function(finish){
      if(self.config.get('initializers')){
        self.sysLog.info('Starting to shutdown initializers')
        self.loadItems(
          self.config.get('initializers'),
          function(initializer,next){
            self.sysLog.info('Stopping initializer: ' + initializer.name)
            self.initializers[initializer.name] = initializer.stop(self,next)
          },
          function(err){
            self.sysLog.info('Finished shutting down initializers')
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
      self.sysLog.info('APX system shutdown complete')
      //update ready stats
      self.readyState = 0
      emitter.emit('readyStateChange',self.readyState)
      //fire dead event
      emitter.emit('dead',self)
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
    var self = this
      , cwd = path.resolve(self.config.get('cwd'))
    if('string' === typeof items) items = [items]
    if('object' === typeof items && !util.isArray(items)) items = [items]
    //do all of this async
    async.each(
      items,
      function(item,finish){
        //objects should be passed directly
        if('object' === typeof item && !util.isArray(item) && 'string' !== typeof item){
          iterator(item,finish)
        /**
         * Try to load a package name natively
         *  this will check if the package is a file or should be loaded using the
         *  methods of the nodejs require() function see the documentation
         *  here: http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
         */
        } else if(
          0 !== item.indexOf('./') &&
          0 !== item.indexOf('../') &&
          0 !== item.indexOf('/') &&
          (item.length - 4) === item.indexOf('.js') &&
          (item.length - 6) === item.indexOf('.json') &&
          (item.length - 6) === item.indexOf('.node')
        ){
          self.sysLog.info('Loading package (' + item + ')')
          iterator(require(item),finish)
          //try to resolve the path with glob
        } else {
          glob(item,{cwd: cwd},function(err,files){
            if(err) throw err
            async.each(
              files,
              function(file,next){
                self.sysLog.info('Loading package from path (' + self.resolvePath(file) + ')')
                iterator(require(self.resolvePath(file)),next)
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
  var self = this
  if('function' === typeof method){
    fn = method
    method = 'run'
  }
  if('string' === typeof action) action = require(self.resolvePath(action))
  if(false === (req instanceof self.Request))
    req = new self.Request(req)
  var res = new self.Response()
  var runMiddleware = function(position,done){
    //make sure position is usable even if its not passed
    if('function' === typeof position){
      done = position
      position = 'pre'
    }
    if('pre' !== position && 'post' !== position){
      position = 'pre'
    }
    //run middleware
    if(self.config.exists('middleware')){
      self.sysLog.info('Running ' + position + ' middleware for action ' + action.name + ':' + method)
      self.loadItems(
        self.config.get('middleware'),
        function(middleware,next){
          var method = position
          if('pre' === position && 'function' === typeof middleware.run){
            method = 'run'
          }
          if('post' === position){
            method = 'post'
          }
          //only run the middleware if a method is defined
          if('function' === typeof middleware[method]){
            middleware[method](self,req,res,next,done)
          }

        },
        done
      )
    } else {
      done(null)
    }
  }
  var runAction = function(next){
    self.sysLog.info('Running action ' + action.name + ' : ' + method)
    emitter.emit('runActionBefore',action)
    action[method](self,req,res,function(err){
      emitter.emit('runActionAfter',action,err,res)
      next(err,res)
    })
  }
  //run the action and middleware before and after
  runMiddleware('pre',function(err){
    if(err){
      emitter.emit('error',err)
    } else {
      runAction(function(err,res){
        if(err){
          emitter.emit('error',err)
        } else {
          runMiddleware('post',function(err){
            if(err){
              emitter.emit('error',err)
            } else {
              fn(err,res)
            }
          })
        }
      })
    }
  })
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
  task.run(this,req,function(err){
    emitter.emit('runTaskAfter',task)
    done(err)
  })

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
module.exports.instance = null
module.exports.setup = function(opts){
  module.exports.instance = new Apx(opts)
}
module.exports.start = function(opts){
  if(opts){
    module.exports.setup(opts)
  }
  if(!module.exports.instance) throw new Error('Tried to start APX without setting it up')
  module.exports.instance.start()
}
module.exports.stop = function(){
  module.exports.instance.stop()
  emitter.on('dead',function(){
    module.exports.instance = null
  })
}
module.exports.restart = function(){
  module.exports.stop()
  module.exports.start()
}
module.exports.Apx = Apx
