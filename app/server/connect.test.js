var request = require("supertest")
describe("testing a simple application", function(){
  it("should return code 200", function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res){
        if(err){
          done(err)
        } else {
          done()
        }
      })
  })
  it("should return the same sent params concatenated", function(done) {
    request(app)
      .post("/auth/authorize")
      .send({
        "form": {
          "token": "123",
          "collection": "authtest",
          "id": "authtest",
          "secret": "authtest"
        }
      })
      .expect(201)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) {
          done(err)
        } else {
          auth_response = JSON.parse(body)
          if(auth_response.auth && auth_response.auth == "ok"){
            done(null,auth_response.user_token)
          } else {
            done("Could not authenticate")
          }
          done()
        }
      })
  })
})
