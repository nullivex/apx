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
      expect(res.get('code')).to.equal('0')
      expect(res.get('message')).to.equal('success')
      expect(res.get('id')).to.equal('foo')
    })
    it('should allow sending of success with a message',function(){
      res.success('foo')
      expect(res.get('status')).to.equal('ok')
      expect(res.get('code')).to.equal('0')
      expect(res.get('message')).to.equal('foo')
    })
    it('should allow sending of success with a message and code',function(){
      res.success('foo',2)
      expect(res.get('status')).to.equal('ok')
      expect(res.get('code')).to.equal('2')
      expect(res.get('message')).to.equal('foo')
    })
    it('should allow sending of success with a message, code, and object',function(){
      res.success('foo',2,{id: 'foo'})
      expect(res.get('status')).to.equal('ok')
      expect(res.get('code')).to.equal('2')
      expect(res.get('message')).to.equal('foo')
      expect(res.get('id')).to.equal('foo')
    })
    it('should allow sending of success with a message and object',function(){
      res.success('foo',{id: 'foo'})
      expect(res.get('status')).to.equal('ok')
      expect(res.get('code')).to.equal('0')
      expect(res.get('message')).to.equal('foo')
      expect(res.get('id')).to.equal('foo')
    })
    it('should allow sending of errors',function(){
      res.error()
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('error')
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
      expect(res.get('message')).to.equal('error')
      expect(res.get('code')).to.equal('4')
    })
    it('should allow sending of errors with only an object',function(){
      res.error({foo: 'bar'})
      expect(res.get('status')).to.equal('error')
      expect(res.get('message')).to.equal('error')
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
    it('should render with an object intended for json',function(done){
      res.success('foo')
      res.render(function(err,response){
        expect(response.format).to.equal('object')
        expect(response.data.status).to.equal('ok')
        expect(response.mimeType).to.equal('application/json')
        expect(response.charset).to.equal('utf8')
        done()
      })
    })
    it('should render with an object intended for xml by setting the mime type manually',function(done){
      res.success('foo')
      res.mimeType = 'text/xml'
      res.render(function(err,response){
        expect(response.format).to.equal('object')
        expect(response.data.status).to.equal('ok')
        expect(response.mimeType).to.equal('text/xml')
        expect(response.charset).to.equal('utf8')
        done()
      })
    })
    it('should render a raw response and auto detect the mime type with a user set charset',function(done){
      res.charset = 'ISO-8859-1'
      res.add('foo')
      res.render(function(err,response){
        expect(response.format).to.equal('raw')
        expect(response.body).to.equal('foo')
        expect(response.mimeType).to.equal('text/plain')
        expect(response.charset).to.equal('ISO-8859-1')
        done()
      })
    })
    it('should render a raw response with a manually set mime type',function(done){
      res.add('{"foo": "bar"}')
      res.mimeType = 'application/json'
      res.render(function(err,response){
        expect(response.format).to.equal('raw')
        expect(response.body).to.equal('{"foo": "bar"}')
        expect(response.mimeType).to.equal('application/json')
        expect(response.charset).to.equal('utf8')
        done()
      })
    })
    it('should render a file response and auto detect the mime type',function(done){
      var tmpFile = temp.openSync()
      fs.writeSync(tmpFile.fd,'foo')
      res.sendFile(tmpFile.path)
      res.render(function(err,response){
        expect(response.format).to.equal('file')
        expect(response.file).to.be.an('object')
        expect(response.mimeType).to.equal('text/plain')
        expect(response.charset).to.equal(null)
        temp.cleanup()
        done()
      })
    })
  })
})