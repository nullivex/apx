var worker = function(){
  var fs = require("fs")
    , express = require("express")
    , MongoSession = require("express-session-mongo")
    , SocketIOStore = require("socket.io-clusterhub")
    , mongoose = require("mongoose")
    , passport = require("passport")
    , flash = require("connect-flash")
    , app = express()
    , apex = require("./apex")

  apex.util.load("bcrypt")
  //load the config
  app.config = require("./config")

  //-------------------------------------------------------
  //Database Setup
  //-------------------------------------------------------
  mongoose.connect("mongodb://" + app.config.get("db.host") + "/" + app.config.get("db.name"),{
    db: {native_parser: true},
    user: app.config.get("db.user"),
    pass: app.config.get("db.password")
  })
  //bootstrap model
  fs.readdirSync("./models").forEach(function(file){
    if((!~file.indexOf(".js")) || (~file.indexOf(".test.js"))) return
    require("./models/" + file)
  })

  //-------------------------------------------------------
  //App Setup
  //-------------------------------------------------------
  app.disable("x-powered-by")
  if(app.config.get("app.proxy")) app.enable("trust proxy")
  app.set("view engine","jade")
  app.set("views","view")
  //set tpl locals
  app.locals.app = app.config.get("app")
  app.locals.uri = app.url
  app.locals.routes = []
  app.locals.pretty = true
  if("production" !== process.env.NODE_ENV){
    app.io.set("log",true)
    app.io.set("log level",3)
  }

  //-------------------------------------------------------
  //Middleware stack
  //-------------------------------------------------------
  app.use(function(req,res,next){
    res.time_start = process.hrtime()
    next()
  })
  app.use(express.logger("dev"))
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser(app.config.get("session.secret")))
  app.use(express.session({
    secret: app.config.get("session.secret"),
    cookie: {
      secure: app.config.get("session.cookie.secure"),
      maxAge: app.config.get("session.cookie.life")
    },
    proxy: app.config.get("app.proxy"),
    key: app.config.get("session.key"),
    store: new MongoSession({
      db: app.config.get("session.collection")
    })
  }))
  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(function(req,res,next){
    app.locals.user = req.user
    next()
  })
  app.use(express.static("assets"))
  app.use(function(req,res,next){
    if(!req.isAuthenticated() && !req.url.match(/login/)) res.redirect("/login")
    else next()
  })

  app.get("/", function(req, res){
    res.send("ok")
  })

  app.authAuthorize = function(req, res){
    var rv = {auth: "fail"}
    if(req.body.form){
      if(
        (req.body.form.token === "123") &&
          (req.body.form.collection === "testauth") &&
          (req.body.form.id === "testauth") &&
          (req.body.form.secret === "testauth")
        ){
        var rv = {
          auth: "ok",
          user_token: "..l.."
        }
      }
    } else {
      rv.message = "POST data not found"
    }
    res.send(rv)
  }
  app.get("/auth/authorize", app.authAuthorize)
  app.post("/auth/authorize", app.authAuthorize)

  //use passport to authenticate our socket.io connections
  var ioAuthorization = app.io.get("authorization")
  app.io.set("authorization",function(data,accept){
    ioAuthorization(data,function(err,res){
      if(null !== err) accept(err,res)
      if(!data.session[passport._key][passport._userProperty]){
        accept(null,false)
      } else accept(null,true)
    })
  })

  //load routes
  fs.readdirSync("./routes").forEach(function(file){
    if(file.match(/\.js$/) && !file.match(/\.spec\.js$/))
      require("./routes/" + file)(app)
  })

  //load partials for angular
  app.get("/partials*",function(req,res){
    res.render(req.path.replace(/^\//,""))
  })

  //for the default route load the main skeleton page
  app.get("*",function(req,res){
    res.send(500,{request:"fail"})
  })

  //listen very last
  console.log("Worker starting to listen on port %d",app.config.get("port"))
  app.listen(app.config.get("port"))
}

//-------------------------------------------------------
//Cluster loading
//-------------------------------------------------------
var cluster = require("cluster")
  , os = require("os")
  , threads = os.cpus().length
if(cluster.isMaster && "production" === process.env.NODE_ENV){
  console.log("About to start %d workers",threads)
  for(var i=0; i<threads; i++) cluster.fork()
} else
  worker()
