'use strict';
var expect = require('chai').expect
  , File = require('../lib/File')
  , temp = require('temp')
  , fs = require('fs')

describe('APX File',function(){
  var tmpFile, file
  before(function(){
    //create a temp file
    tmpFile = temp.openSync()
    fs.writeSync(tmpFile.fd,'foo')
    //create a file object
    file = new File(tmpFile.path)
  })
  after(function(){
    temp.cleanup()
  })
  it('should set the path on construction',function(){
    expect(file.path).to.equal(tmpFile.path)
  })
  it('should have stats populated about the file',function(){
    expect(file.stats.size).to.equal(3)
  })
})
