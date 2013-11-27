var mongoose = require("mongoose")
  , merge = require("mongoose-merge-plugin")
  , validate = require("mongoose-validator").validate
  , passport = require("passport")
  , LocalStrategy = require("passport-local").Strategy
  , bcrypt = require("bcrypt")
  , SALT_WORK_FACTOR = 12
  , schema, model

//load plugins
mongoose.plugin(merge)

//define schema
schema = new mongoose.Schema({
  email: {
    label: "Email",
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    index: true,
    validate: [
      validate("len","6","100"),validate("isEmail")
    ]
  },
  password: {
    label: "Password",
    type: String,
    required: true,
    select: false,
    get: function(){ return "********" },
    set: function(v){
      return bcrypt.hashSync(v,bcrypt.genSaltSync(SALT_WORK_FACTOR))
    }
  },
  name: {
    first: {
      label: "First Name",
      type: String,
      index: true,
      required: true
    },
    last: {
      label: "Last Name",
      type: String,
      index: true,
      required: true
    }
  },
  settings: {
    active: {
      label: "Active",
      type: Boolean,
      required: true,
      default: false
    },
    sort_order: {
      label: "Preferred Sort Order",
      type: String
    }
  },
  stats: {
    date_created: {
      label: "Creation Date",
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    date_modified: {
      label: "Last Modified",
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    date_seen: {
      label: "Last Successful Login",
      type: Date,
      index: true
    },
    date_fail: {
      label: "Last Failed Login",
      type: Date,
      index: true
    }
  },
  roles: [
  ]
})

// handling of created/modified
schema.pre("save",function(next){
  var now = new Date()
    ,_ref = this.get("stats.date_created")
  if((void 0) === _ref || null === _ref)
    this.stats.date_created = now
  this.stats.date_modified = now
  return next()
})

//virtual schema mapping
schema.virtual("name.full").get(function(){
  return (this.name.first + " " + this.name.last).trim()
})
schema.tree.name.full.label = "Full Name"

//setup the model
model = mongoose.model("Account",schema)

model.list = function(search,fn){
  search.start = search.start || 0
  search.limit = search.limit || 10
  search.sort = search.sort || "name.first name.last"
  if(search.find){
    var search_text = new RegExp(search.find,"i")
    search.find = {
      $or : [
        {"email": search_text},
        {"name.first": search_text},
        {"name.last": search_text}
      ]
    }
  } else search.find = {}
  model
    .find(search.find)
    .sort(search.sort)
    .skip(search.start)
    .limit(search.limit)
    .exec(function(err,res){
      if(err) fn(err)
      else {
        model.count(search.find,function(err,res_count){
          if(err) fn(err)
          else {
            fn(null,res_count,res)
          }
        })
      }
    })
}

model.updateLastLogin = function(id,obj){
  model.findByIdAndUpdate(id,obj,function(err){
    if(err) console.log(err)
  })
}

passport.serializeUser(function(user, done){
  done(null, user._id)
})

passport.deserializeUser(function(id, done){
  model.findById(id, function (err, user){
    done(err, user)
  })
})

// Password verification
passport.use(new LocalStrategy(
  {usernameField: "email", passwordField: "password"}
  ,function(email,password,done){
    var now = new Date()
      , error_message = "Invalid email address or password"
    model.collection.findOne({ email: email}, function(err, account){
      if(err || !account)
        done(err,false,{message: error_message})
      else {
        bcrypt.compare(password, account.password, function(err,is_match){
          if(err)
            done(err,false,{message: error_message})
          else if(!is_match){
            model.updateLastLogin(account._id,{"stats.date_fail":now})
            done(null,false,{message: error_message})
          } else {
            model.updateLastLogin(account._id,{"stats.date_seen":now})
            done(null,account)
          }
        })
      }
    })
  }
))

//export model
module.exports = exports = model
