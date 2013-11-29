/* global apex:false */
"use strict";
apex.util.load("bcrypt")
var payload = "test-string.1.2.3.4_huehuehue", crypted

describe("SnailJS.Apex.Util.Bcrypt",function(){
  // load the app
  it("should return crypted string when encode(payload)",
    function(){
      crypted = apex.util.bcrypt.encode(payload)
      expect(crypted).to.be.a("string")
    }
  )
  it("should return true when compare(payload,crypted)",
    function(){
      expect(apex.util.bcrypt.compare(payload,crypted)).to.be.true
    }
  )
  it("should return known crypted for encode(payload,salt)",
    function(){
      expect(apex.util.bcrypt.encode("sunuvvabeech","$2a$10$LwTXB.cRbAyIheJelZGHru")).to.equal("$2a$10$LwTXB.cRbAyIheJelZGHruZZ2lfTMeQY5fOaXDw8x2x4246hEcL0u")
    }
  )
})
