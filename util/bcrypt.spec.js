"use strict";

describe("SnailJS.Apex.Util.Bcrypt",function(){
  // load the app
  it("should return proper output when encode(payload)",
    function(){
      var apex = require("../app/apex")
      apex.util.load("bcrypt")
      expect(apex.util.bcrypt.encode("test-string.1.2.3.4_huehuehue")).toEqual("shit")
    }
  )
})
