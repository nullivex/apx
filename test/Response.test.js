'use strict';
var expect = require('chai').expect
  , Response = require('../lib/Response')
  , temp = require('temp')
  , fs = require('fs')
describe('APX Response',function(){
  describe('methods',function(){
    var res
    beforeEach(function(){
      res = new Response()
    })
    it('should accept a string to add to the body',function(){
      res.add('my string')
      expect(res.body).to.equal('my string')
    })
    it('should accept an object to add to the object',function(){
      res.load({mydata: 'val1'})
      expect(res.get('mydata')).to.equal('val1')
    })
    it('should accept an array of objects to add to the body',function(){
      res.load([{mydata: 'val1'},{mydata2: 'val2'}])
      expect(res.get('mydata')).to.equal('val1')
      expect(res.get('mydata2')).to.equal('val2')
    })
    it('should send JSON of the data object',function(){
      res.load({mydata: 'val1'})
      var obj = JSON.parse(JSON.stringify(res.get()))
      expect(obj.mydata).to.equal('val1')
    })
    it('should support sending of a file',function(){
      //create a temp file
      var tmpFile = temp.openSync()
      fs.writeSync(tmpFile.fd,'foo')
      res.sendFile(tmpFile.path)
      expect(res.file.path).to.equal(tmpFile.path)
      temp.cleanup()
    })
    it('should allow sending of success',function(){
      res.success()
      expect(res.get('status')).to.equal('ok')
      expect(res.get('message')).to.equal('success')
    })
    it('should allow sending of success with an object',function(){
      res.success({id: 'foo'})
      expect(res.get('status')).to.equal('ok')
      expect(res.get('message')).to.equal('success')
      expect(res.get('id')).to.equal('foo')
    })
    it('should allow sending of errors',function(){
      res.error()
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('An error has occurred')
      expect(res.get('code')).to.equal('1')
    })
    it('should allow sending of errors with a customer message',function(){
      res.error('foo')
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('foo')
      expect(res.get('code')).to.equal('1')
    })
    it('should allow sending of errors with only a code',function(){
      res.error(4)
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('An error has occurred')
      expect(res.get('code')).to.equal('4')
    })
    it('should allow sending of errors with only an object',function(){
      res.error({foo: 'bar'})
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('An error has occurred')
      expect(res.get('code')).to.equal('1')
      expect(res.get('foo')).to.equal('bar')
    })
    it('should allow sending of errors with a messages, code and object',function(){
      res.error('baz',2,{foo: 'bar'})
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('baz')
      expect(res.get('code')).to.equal('2')
      expect(res.get('foo')).to.equal('bar')
    })
    it('should allow sending of errors with a message and object',function(){
      res.error('baz',{foo: 'bar'})
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('baz')
      expect(res.get('code')).to.equal('1')
      expect(res.get('foo')).to.equal('bar')
    })

  })

})