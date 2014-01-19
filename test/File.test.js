'use strict';
var expect = require('chai').expect
  , File = require('../lib/File')
  , temp = require('temp')
  , fs = require('fs')

describe('APX File',function(){
  var tmpFile, file
  before(function(done){
    //create a temp file
    tmpFile = temp.openSync()
    fs.writeSync(tmpFile.fd,'foo')
    //create a file object
    file = new File(tmpFile.path)
    file.populate(done)
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
  it('should have a mime type',function(){
    expect(file.mimeType).to.equal('text/plain')
  })
  it('should have an extension based on the mime type',function(){
    expect(file.mimeExtension).to.equal('txt')
  })
  it('should support clearing and repopulating file info',function(){
    expect(file.mimeType).to.equal('text/plain')
    file.clear()
    expect(file.stats).to.equal(null)
    expect(file.mimeType).to.equal(null)
    expect(file.mimeExtension).to.equal(null)
    file.populate(function(){
      expect(file.mimeType).to.equal('text/plain')
      expect(file.mimeExtension).to.equal('txt')
      expect(file.stats.size).to.equal(3)
    })
  })
})
