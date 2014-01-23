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
        name: 'foo',
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
    it('should run an action and accept an array as the argument',function(done){
      var action = {
        name: 'foo',
        run: function(apx,req,res,next){
          expect(req.get()).to.include.members(['foo','bar','baz'])
          expect(req.get('0')).to.equal('foo')
          expect(req.get('1')).to.equal('bar')
          expect(req.get('2')).to.equal('baz')
          res.success()
          next()
        }
      }
      instance.runAction(action,['foo','bar','baz'],function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        done()
      })
    })
    it('should run middleware before and after',function(done){
      var action = {
        name: 'foo',
        run: function(apx,req,res,next){
          expect(req.get('foo')).to.equal('yes')
          next()
        }
      }
      var middleware = {
        pre: function(apx,req,res,next){
          req.set('foo','yes')
          next()
        },
        post: function(apx,req,res,next){
          res.set('foo','no')
          next()
        }
      }
      instance.config.set('middleware',middleware)
      instance.runAction(action,{},function(err,res){
        expect(res.get('foo')).to.equal('no')
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
    it('should run a task and accept an array as the argument',function(done){
      var task = {
        name: 'foo',
        run: function(apx,req,next){
          expect(req.get()).to.include.members(['foo','bar','baz'])
          expect(req.get('0')).to.equal('foo')
          expect(req.get('1')).to.equal('bar')
          expect(req.get('2')).to.equal('baz')
          next()
        }
      }
      instance.runTask(task,['foo','bar','baz'],function(err){
        if(err) throw err
        done()
      })
    })
    it('should get a new instance of a service',function(){
      var service = {
        service: function(){
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
        service: function(){
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
  describe('Load Items',function(){
    var instance
    before(function(done){
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
    after(function(done){
      apx.once('dead',function(){
        done()
      })
      apx.stop()
    })
    it('should allow passing of plugins directly as objects',function(done){
      instance.loadItems({name: 'foo'},function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
    it('should load packages when no relative path is given',function(){
      var load = function(){
        instance.loadItems('foo',function(item,next){
          next()
        })
      }
      expect(load).to.throw('Cannot find module \'foo\'')
    })
    it('should load a glob when path ends with .js',function(done){
      instance.loadItems('foo.js',function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
    it('should load a glob when path ends with .json',function(done){
      instance.loadItems('foo.json',function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
    it('should load a glob when path ends with .node',function(done){
      instance.loadItems('foo.node',function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
    it('should load a glob when path starts with ./',function(done){
      instance.loadItems('./foo',function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
    it('should load a glob when path starts with ../',function(done){
      instance.loadItems('../foo',function(item,next){
        expect(item.name).to.equal('foo')
        next()
      },done)
    })
  })
})