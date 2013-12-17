var util = require('util')
  , path = require('path')
  , glob = require('glob')
  , kue = require('kue')
  , winston = require('winston')
  , redisMock = require('fakeredis')
  , ObjectManage = require('object-manage')

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
  this.config = new ObjectManage(this.configSchema)
  //load additional config
  var that = this
  this.loadItems(options.config,function(config){
    that.config.load(config)
  })
  //pass rest of the options to config
  //  so that runtime options are kept over all else
  this.config.load(options)
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
Apx.prototype.configSchema = {
  testing: false,
  cwd: '',
  kue: {
    port: 3001,
    title: 'APX Job Status'
  },
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
  that.loadItems(that.config.get('initializers'),function(initializer){
    that.initializers[initializer.name] = initializer.init(that)
  })
  //load and register tasks
  that.loadItems(that.config.get('tasks'),function(task){
    that.tasks[task.name] = that.jobs.process(task.name,function(job,done){
      that.runTask(task,new that.Request(job),done)
    })
  })
  //load translators
  that.loadItems(that.config.get('translators'),function(translator){
    that.translators[translator.name] = translator.translator(that)
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
 * Will take an array of items/globs and
 * load them against the environment and will
 * fire iterator with the item object on success
 * @param items
 * @param iterator
 */
Apx.prototype.loadItems = function(items,iterator){
  if(undefined !== items && null !== items){
    var that = this
    //when items is an array iterate it and call our self
    if(util.isArray(items)){
      items.forEach(function(v){
        that.loadItems(v,iterator)
      })
    } else {
      //literal filenames should be passed to glob
      if('string' === typeof items) items = glob.sync(items,{cwd: that.config.get('cwd')})
      //literal objects should be wrapped in an array
      else if('object' === typeof items) items = items[items]
      //iterate items and fire the calback
      items.forEach(function(item){
        var obj
        //literal objects are already good
        if('object' === typeof item) obj = item
        //otherwise load objects from file
        else obj = require(that.resolvePath(item))
        //fire callback
        iterator(obj)
      })
    }
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
  action[method](this,req,new this.Response(fn))
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