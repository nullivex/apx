'use strict';
var expect = require('chai').expect
  , Response = require('../lib/Response')
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
    it('should accept an object to add to the body',function(){
      res.add({mydata: 'val1'})
      expect(res.get('mydata')).to.equal('val1')
    })
    it('should accept an array of objects to add to the body',function(){
      res.add([{mydata: 'val1'},{mydata2: 'val2'}])
      expect(res.get('mydata')).to.equal('val1')
      expect(res.get('mydata2')).to.equal('val2')
    })
    it('should send and fire the callback',function(){
      res.send('foo')
      expect(res.rendered).to.equal('foo')
    })
    it('should send JSON of the data object',function(){
      res.send({mydata: 'val1'})
      var obj = JSON.parse(res.rendered)
      expect(obj.mydata).to.equal('val1')
    })
    it('should send body for a string response',function(){
      res.send('foo')
      expect(res.rendered).to.equal('foo')
    })
    it('should send JSON + body if both were set by throw a warning',function(){
      res.add({mydata: 'val1'})
      res.send('foo')
      expect(res.warnings[0]).to.equal('JSON and String body rendered')
      expect(res.rendered).to.equal('{"mydata":"val1"}foo')
    })
  })

})