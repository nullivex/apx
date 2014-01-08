'use strict';
var expect = require('chai').expect
  , File = require('../lib/File')
  , fs = require('fs')
describe('APX File',function(){
  var file
  before(function(){
    //create a file
    var file = new File('/tmp/path')
  })
  it('should set the path on construction',function(){

    expect(file.path).to.equal('/tmp/path')
  })
})
