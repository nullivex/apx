'use strict';
var expect = require('chai').expect
  , apx = require('../lib/Apx')
  , path = require('path')

describe('APX',function(){
  describe('setup',function(){
    it('should fire the ready event',function(done){
      apx.once('ready',function(apx){
        expect(apx.readyState).to.equal(1)
        apx.stop()
        done()
      })
      apx.start({
        sysLogLevel: 2,
        testing: true
      })
    })
    it('should resolve a relative path with cwd',function(done){
      apx.once('ready',function(apx){
        expect(apx.resolvePath('init.js')).to.equal(path.resolve(__dirname + '/init.js'))
        apx.stop()
        done()
      })
      apx.start({
        sysLogLevel: 2,
        testing: true,
        cwd: __dirname
      })
    })
  })
  describe('methods',function(){
    var instance
    beforeEach(function(done){
      apx.once('ready',function(apx){
        instance = apx
        done()
      })
      apx.start({
        sysLogLevel: 2,
        testing: true,
        cwd: __dirname
      })
    })
    afterEach(function(done){
      apx.once('dead',function(){
        done()
      })
      apx.stop()
    })
    it('should run an action',function(done){
      var action = {
        run: function(apx,req,res,next){
          expect(req.get('mydata')).to.equal('val1')
          res.success()
          next()
        }
      }
      instance.runAction(action,{mydata: 'val1'},function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        done()
      })
    })
    it('should run a task',function(done){
      var task = {
        run: function(apx,req,next){
          expect(req.get('mydata')).to.equal('val1')
          next()
        }
      }
      instance.runTask(task,{mydata: 'val1'},function(err){
        if(err) throw err
        done()
      })
    })
    it('should get a new instance of a service',function(){
      var service = {
        module: function(){
          this.mystuff = 'val1'
        }
      }
      var inst = instance.newService(service)
      expect(inst.mystuff).to.equal('val1')
      //set the value to something else and reinit
      inst.mystuff = 'foo'
      expect(inst.mystuff).to.equal('foo')
      inst = instance.newService(service)
      expect(inst.mystuff).to.equal('val1')
    })
    it('should get the same instance of a service',function(){
      var service = {
        module: function(){
          this.mystuff = 'val1'
        }
      }
      var inst = instance.service(service)
      expect(inst.mystuff).to.equal('val1')
      //set the value to something else and reinit
      inst.mystuff = 'foo'
      expect(inst.mystuff).to.equal('foo')
      inst = instance.service(service)
      expect(inst.mystuff).to.equal('foo')
    })
  })

})