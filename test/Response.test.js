'use strict';
var expect = require('chai').expect
  , Response = require('../lib/Response')
describe('APX Response',function(){
  describe('constructor',function(){
    it('should accept a callback to the constructor',function(){
      var res = new Response(function(){})
      expect(typeof res.cb).to.equal('function')
    })
    it('should not require a callback to the constructor',function(){
      var res = new Response()
      expect(typeof res.cb).to.equal('function')
    })
  })
  describe('methods',function(){
    var res
    beforeEach(function(){
      res = new Response()
    })
    it('should accept a string to add to the body',function(){
      res.add('my string')
      expect(res.body).to.equal('my string')
    })
    it('should accept an object to add to the body',function(){
      res.add({mydata: 'val1'})
      expect(res.get('mydata')).to.equal('val1')
    })
    it('should accept an array of objects to add to the body',function(){
      res.add([{mydata: 'val1'},{mydata2: 'val2'}])
      expect(res.get('mydata')).to.equal('val1')
      expect(res.get('mydata2')).to.equal('val2')
    })
    it('should send and fire the callback',function(done){
      res.cb = function(response){
        expect(response.rendered).to.equal('foo')
        done()
      }
      res.send('foo')
    })
    it('should send JSON of the data object',function(done){
      res.cb = function(response){
        var obj = JSON.parse(response.rendered)
        expect(obj.mydata).to.equal('val1')
        done()
      }
      res.send({mydata: 'val1'})
    })
    it('should send body for a string response',function(done){
      res.cb = function(response){
        expect(response.rendered).to.equal('foo')
        done()
      }
      res.send('foo')
    })
    it('should send JSON + body if both were set by throw a warning',function(done){
      res.cb = function(response){
        expect(response.warnings[0]).to.equal('JSON and String body rendered')
        expect(response.rendered).to.equal('{"mydata":"val1"}foo')
        done()
      }
      res.add({mydata: 'val1'})
      res.send('foo')
    })
  })

})