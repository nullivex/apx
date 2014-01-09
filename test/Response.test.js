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
  })

})