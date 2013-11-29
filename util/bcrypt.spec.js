"use strict";
var should = require('should')
describe("SnailJS.Apex.Util.Bcrypt",function(){
  // load the app
  beforeEach(apex.util.bcrypt.init(12))
  it("should return proper output when encode(payload)",function(){
    (apex.util.bcrypt.encode("test-string.1.2.3.4_huehuehue")).toEqual("shit")
  })
})
