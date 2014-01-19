'use strict';
var expect = require('chai').expect
  , temp = require('temp')
  , fs = require('fs')
  , Request = require('../lib/Request')
describe('APX Request',function(){
  var data1 = {test1: 'val1', test2: 'val2'}
    , data2 = {test3: 'val3', test4: 'val4'}
    , data3 = {test5: {test6: 'val6'}}
  it('should accept data to the constructor',function(){
    var req = new Request(data1)
    expect(req.get('test1')).to.equal('val1')
    expect(req.get('test2')).to.equal('val2')
  })
  it('should be able to merge in data after constructing',function(){
    var req = new Request([data1,data2])
    expect(req.get('test3')).to.equal('val3')
    expect(req.get('test4')).to.equal('val4')
  })
  it('should be able to get a nested key',function(){
    var req = new Request([data1,data3])
    expect(req.get('test5.test6')).to.equal('val6')
  })
  it('should be able to set a nested key',function(){
    var req = new Request([data1,data3])
    req.set('test5.test6','val7')
    expect(req.get('test5.test6')).to.equal('val7')
  })
  it('should be ale to check if a key exists',function(){
    var req = new Request([data1,data3])
    expect(req.exists('test5.test6')).to.equal(true)
  })
  it('should be false if a key doesn\'t exist',function(){
    var req = new Request([data1,data3])
    expect(req.exists('test6.test6')).to.equal(false)
  })
  it('should be able to remove a key and children',function(){
    var req = new Request([data1,data3])
    req.remove('test5')
    expect(req.exists('test5.test6')).to.equal(false)
  })
  it('should allow adding of files from translator',function(){
    var tmpFile1 = temp.openSync()
      , tmpFile2 = temp.openSync()
    fs.writeSync(tmpFile1.fd,'foo')
    fs.writeSync(tmpFile2.fd,'bar')
    var req = new Request()
    req.addFile(tmpFile1.path)
    req.addFile(tmpFile2.path)
    expect(req.files[0].path).to.equal(tmpFile1.path)
    expect(req.files[1].path).to.equal(tmpFile2.path)
    temp.cleanup()
  })
})
