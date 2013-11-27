var PORT = 3000
  , SSL_PORT = 3443
  , API_URL = "/api"
// mongodb://user:pass@host:port/db?options...
  , CONNECTION_STRING = "mongodb://localhost/apex"

var fs = require("fs")
  , http = require("http")
  , https = require("https")
  , mongoose = require("mongoose")
  , express = require("express")

var ssl_options = false
// var ssl_options = {
//  key: fs.readFileSync("server-key.pem"),
//  cert: fs.readFileSync("server-crt.pem")
// }

mongoose.connect(CONNECTION_STRING)
var db = mongoose.connect

var app = express()

app.configure(function() {
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
})

// All options return the same thing
app.options("*", function(req, res) {
  res.send(200)
})

var buildRoutesForModel = function(app, model, modelName, modelPlural){
  app.get(API_URL + "/" + modelPlural, function(req, res) {
    var ormQuery = req.query
    for (key in ormQuery) {
      if (ormQuery.hasOwnProperty(key)) {
        ormQuery[key] = new RegExp(req.query[key], "i")
      }
    }
    model.find(ormQuery ? ormQuery : {}, function(err, items) {
      if (err) {
        res.send(500, err)
      } else {
        var obj = {}
        obj[modelPlural] = items
        res.send(obj)
      }
    })
  })

  app.get(API_URL + "/" + modelPlural + "/:id", function(req, res) {
    model.findById(req.params.id, function(err, item) {
      if (err) {
        res.send(500, err)
      } else {
        var obj = {}
        obj[modelName] = item
        res.send(obj)
      }
    })
  })

  app.post(API_URL + "/" + modelPlural, function(req, res) {
    var newModel = new model(req.body[modelName])
    newModel.save(function(err, item) {
      if (err) {
        res.send(500, err)
      } else {
        var obj = {}
        obj[modelName] = item
        res.send(obj)
      }
    })
  })

  app.put(API_URL + "/" + modelPlural + "/:id", function(req, res) {
    model.update({
      _id: req.params.id
    }, req.body[modelName], function(err, item) {
      if (err) {
        res.send(500, err)
      } else {
        var obj = {}
        obj[modelName] = item
        res.send(obj)
      }
    })
  })

  app.delete(API_URL + "/" + modelPlural + "/:id", function(req, res) {
    model.remove({
      _id: req.params.id
    }, function(err) {
      if (err) {
        res.send(500, err)
      } else {
        res.send(200)
      }
    })
  })
}

/*
  ADD YOUR MODELS HERE
*/
buildRoutesForModel(app, require("./models/.example")(mongoose), "message", "messages")

http.createServer(app).listen(PORT)
if (ssl_options) {
  https.createServer(ssl_options, app).listen(SSL_PORT)
}
