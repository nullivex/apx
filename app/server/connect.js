var request = require("request")

/**
 * Connect object constructor
 * @constructor
 */
var Connect = function Connect(server, secret){
  //constructor

  /**
   * Apex server hostname
   * @type {null}
   */
  this.server = server

  /**
   * Secret used to connect to the Apex server
   * @type {null}
   */
  this.secret = secret

  /**
  * Auth token received from Apex
  * @type {null}
  */
  this.auth_token = null

  /**
   * User token received
   * @type {null}
   */
  this.user_token = null
}


/**
 * Initial connect call that establishes the auth
 * session with the apex server
 *
 * Fires fn on completion with fn(err,auth_token)
 *
 * @param fn
 */
Connect.prototype.connect = function(fn){

  var self = this
  request.post( this.server + "/auth/connect",
    {form:{ secret:this.secret }},
    function(error, response, body){
      if (response.statusCode == 201) {
        auth_response = JSON.parse(body)
        if (auth_response.auth && auth_response.auth == "ok") {
          self.auth_token = auth_response.token
          fn(null, auth_response.token)
        }else{
          self.auth_token = null
          fn("Could not authenticate", null)
        }
      }else{
        self.auth_token = null
        fn("Could not contact server : " + response.statusCode , null)
      }
    }
  )

  //fn(null, this.auth_token)
}

/**
 * Authorization function to receive a user_token
 *
 * Fires fn on completion with fn(err,user_token)
 *
 * @param collection
 * @param id
 * @param secret
 * @param fn
 */
Connect.prototype.authorize = function(collection, id, secret, fn){
  var self = this

  if (!self.auth_token) {
    fn("Not connected to the server", null)
    return
  }

  request.post( this.server + "/auth/authorize",
    {
      form:{
        token : self.auth_token,
        collection : collection,
        id: id,
        secret : secret
      }
    },
    function(error, response, body){
      if (response.statusCode == 201) {
        auth_response = JSON.parse(body)
        if (auth_response.auth && auth_response.auth == "ok") {
          fn(null, auth_response.user_token)
        }else{
          fn("Could not authenticate", null)
        }
      }else{
        self.auth_token = null
        fn("Could not contact server : " + response.statusCode , null)
      }
    }
  )
}

//export module
module.exports = exports = Connect