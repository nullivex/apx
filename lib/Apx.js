var convict = require('convict')
  , path = require('path')
  , glob = require('glob')
  , kue = require('kue')
  , winston = require('winston')
  , redisMock = require('fakeredis')

/**
 * Main constructor sets options
 * @param options
 */
var Apx = function(options){
  //freshen
  this.kue = null
  this.jobs = null
  this.initializers = []
  this.log = null
  this.services = []
  this.tasks = []
  this.translators = []
  //load config
  options = options || {}
  //load additional config
  if(options.config){
    this.config.loadFile(options.config)
  }
  //pass rest of the options to config
  //  so that runtime options are kept over all else
  this.config.load(options)
  //validate config
  this.config.validate()
  //set ready callback
  this.ready = options.onReady || function(){}
  //start the server
  this.init()
}

/**
 * Function to call when init has completed
 */
Apx.prototype.ready = function(){}

/**
 * Ready state of APX
 * @type {boolean}
 */
Apx.prototype.isReady = false

/**
 * Stores the Kue instance
 * @type {null}
 */
Apx.prototype.kue = null

/**
 * Stores Kue jobs instance
 * @type {null}
 */
Apx.prototype.jobs = null

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
Apx.prototype.config = convict({
  testing: {
    doc: 'Toggle testing mode (logs to internal buffer and uses redis-mock)',
    format: Boolean,
    default: false
  },
  cwd: {
    doc: 'Current working directory',
    format: String,
    default: ''
  },
  express: {
    port: {
      doc: 'Port for express HTTP to listen on',
      format: Number,
      default: 3000
    },
    routes: {
      doc: 'Routes to actions',
      format: Array,
      default: []
    }
  },
  'socket-io': {
    routes: {
      doc: 'Socket.io routes to actions',
      format: Array,
      default: []
    }
  },
  kue: {
    port: {
      doc: 'Port to run the Kue UI',
      format: Number,
      default: 3001
    },
    title: {
      doc: 'Title of the Kue UI',
      format: String,
      default: 'APX Job Status'
    }
  },
  tasks: {
    doc: 'Tasks to be loaded',
    format: Array,
    default: []
  },
  translators: {
    doc: 'Translators to be loaded',
    format: Array,
    default: []
  },
  initializers: {
    doc: 'Initializers to be loaded',
    format: Array,
    default: []
  },
  winston: {
    console: {
      doc: 'Toggle Winston logging to console',
      format: Boolean,
      default: true
    },
    file: {
      doc: 'File to log to',
      format: String,
      default: ''
    }
  }
})

/**
 * Load additional config properties
 */
Apx.prototype.load = function(options){
  this.config.load(options)
}

/**
 * Worker init
 */
Apx.prototype.init = function(){
  var that = this
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
  if(true !== this.config.get('testing')){
    //start kue
    that.kue = kue
    if(that.config.get('testing')){
      that.kue.redis.createClient = function(){
        return redisMock.createClient()
      }
    }
    that.jobs = kue.createQueue()
    that.jobs.promote(1000)
    //setup kue web interface
    that.kue.app.listen(that.config.get('kue.port'))
    that.kue.app.set('title',that.config.get('kue.title'))
  }
  //load initializers
  that.config.get('initializers').forEach(function(v){
    that.loadInitializers(glob.sync(v,{cwd: that.config.get('cwd')}))
  })
  //load and register tasks
  that.config.get('tasks').forEach(function(v){
    that.loadTasks(glob.sync(v,{cwd: that.config.get('cwd')}))
  })
  //load translators
  that.config.get('translators').forEach(function(v){
    that.loadTranslators(glob.sync(v,{cwd: that.config.get('cwd')}))
  })
  //call the ready function
  that.isReady = true
  that.ready(that)
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
 * Load intializers and run them
 * @param files  Must be an Array of files to load
 */
Apx.prototype.loadInitializers = function(files){
  if('string' === typeof files) files = [files]
  var that = this
  files.forEach(function(f){
    var initializer
    if('object' === typeof f) initializer = f
    else initializer = require(that.resolvePath(f))
    that.initializers[initializer.name] = initializer.init(that)
  })
}

/**
 * Load translators and init them
 * @param files  Must be an Array of files to load
 */
Apx.prototype.loadTranslators = function(files){
  if('string' === typeof files) files = [files]
  var that = this
  files.forEach(function(f){
    var translator
    if('object' === typeof f) translator = f
    else translator = require(that.resolvePath(f))
    that.translators[translator.name] = translator.translator(that)
  })
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
  action[method](this,req,new this.Response(fn))
}

/**
 * Load tasks and init them
 * @param files  Must be an Array of files to load
 */
Apx.prototype.loadTasks = function(files){
  var that = this
  files.forEach(function(f){
    var task = require(that.resolvePath(f))
    that.tasks[task.name] = that.jobs.process(task.name,function(job,done){
      that.runTask(task,new that.Request(job),done)
    })
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
  task.run(this,req,done)
}

/**
 * Returns new service instance
 * @param service  Can be a service or a filename to require
 * @returns {service}
 */
Apx.prototype.newService = function(service){
  if('string' === typeof service) service = require(this.resolvePath(service))
  return new service.service()
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
    this.services[service.name] = new service.service()
  }
  return this.services[service.name]
}

module.exports = Apx