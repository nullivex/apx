"use strict";
describe("SnailJS.Apex Core",function(){
  var apex
  // load the app
  beforeEach(module("apex"))
  // get service
  beforeEach(inject(function(Apex){
    apex = new Apex(["server"])
  }))
  it("puts the lotion",function(){
    expect(apex.loaded).toBe(true)
  })
})
