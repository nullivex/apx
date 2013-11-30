//define convict style conf opts here
//  these get merged (bottom) by config_<group>.js
//  each group should be handling the conf_schema and
//  inheriting these
module.exports = require("convict")(
  {port:
    {doc: "Port to listen on"
    ,format: "port"
    ,default: 9000
    }
  ,prefix:
    {doc: "The group prefix"
    ,format: String
    ,default: ""
    }
  ,app:
    {name:
      {doc: "Short concise app name"
      ,format: String
      ,default: "MyApp"
      }
    ,title:
      {doc: "Suffix to website title bar"
      ,format: String
      ,default: "MyApp"
      }
    ,description:
      {doc: "Description of the app (shows in meta tags)"
      ,format: String
      ,default: "My App is awesome"
      }
    ,author:
      {doc: "Name of the author (shows in meta tags)"
      ,format: String
      ,default: "Rager Dude"
      }
    ,proxy:
      {doc: "Turn this on if the app is behind a proxy like nginx"
      ,format: Boolean
      ,default: false
      }
    }
  ,db:
    {host:
      {doc: "MongoDB server hostname"
      ,format: "ipaddress"
      ,default: "127.0.0.1"
      }
    ,user:
      {doc: "MongoDB username"
      ,format: String
      ,default: ""
      }
    ,password:
      {doc: "MongoDB password"
      ,format: String
      ,default: ""
      }
    ,name:
      {doc: "MongoDB database name"
      ,format: String
      ,default: null
      }
    }
  ,session:
    {secret:
      {doc: "Session secret"
      ,format: String
      ,default: null
      }
    ,key:
      {doc: "Session key (cookie name)"
      ,format: String
      ,default: "session.sid"
      }
    ,collection:
      {doc: "Redis collection to store sessions in"
      ,format: String
      ,default: "sessions"
      }
    ,cookie:
      {life:
        {doc: "Max cookie age in ms"
        ,format: Number
        ,default: 2628000000
        }
      ,secure:
        {doc: "Use secure cookies, requires SSL"
        ,format: Boolean
        ,default: false
        }
      }
    ,collection_name:
      {doc: "Redis collection name for sessions"
      ,format: String
      ,default: "sessions"
      }
    }
  }
)
