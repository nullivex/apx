'use strict';
var expect = require('chai').expect
  , File = require('../lib/File')
  , temp = require('temp')
  , fs = require('fs')

describe('Apx File Constructor',function(){
  var tmpFile
  before(function(){
    tmpFile = temp.openSync()
  })
  after(function(){
    temp.cleanup()
  })
  it('should take only the path as an argument',function(){
    var file = new File(tmpFile.path)
    expect(file.path).to.not.equal(null)
  })
  it('should take a path and a filename',function(){
    var file = new File(tmpFile.path,'foo.txt')
    expect(file.name).to.equal('foo.txt')
  })
  it('should take a path and an options object',function(){
    var file = new File(tmpFile.path,{tmpFile: true})
    expect(file.options.get('tmpFile')).to.equal(true)
  })
  it('should take a path, fileName, and fieldName',function(){
    var file = new File(tmpFile.path,'foo.txt','attachment')
    expect(file.name).to.equal('foo.txt')
    expect(file.fieldName).to.equal('attachment')
  })
  it('should take a path, fileName, and options object',function(){
    var file = new File(tmpFile.path,'foo.txt',{tmpFile: true})
    expect(file.name).to.equal('foo.txt')
    expect(file.options.get('tmpFile')).to.equal(true)
  })
  it('should take a path, fileName, fieldName and options object',function(){
    var file = new File(tmpFile.path,'foo.txt','attachment',{tmpFile: true})
    expect(file.name).to.equal('foo.txt')
    expect(file.fieldName).to.equal('attachment')
    expect(file.options.get('tmpFile')).to.equal(true)
  })
})

describe('APX File',function(){
  var tmpFile, file
  before(function(done){
    //create a temp file
    tmpFile = temp.openSync()
    fs.writeSync(tmpFile.fd,'foo')
    //create a file object
    file = new File(tmpFile.path,'foo.txt','attachment')
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
  it('should support fileName and fieldName being passed',function(){
    expect(file.name).to.equal('foo.txt')
    expect(file.fieldName).to.equal('attachment')
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
