var Apx = require('../lib/Apx')
describe('APX',function(){
  describe('setup',function(){
    it('should fire the ready event',function(done){
      new Apx({
        testing: true,
        onReady: function(inst){
          expect(inst.isReady).to.equal(true)
          done()
        }
      })
    })
    it('should resolve a relative path with cwd',function(){
      var inst = new Apx({
        testing: true,
        cwd: __dirname
      })
      expect(inst.resolvePath('init.js')).to.equal(__dirname + '\\init.js')
    })
  })
  describe('methods',function(){
    var apx
    beforeEach(function(){
      apx = new Apx({
        testing: true,
        cwd: __dirname
      })
    })
    it('should run an action',function(done){
      var action = {
        run: function(apx,req,res){
          expect(req.get('mydata')).to.equal('val1')
          res.success()
        }
      }
      apx.runAction(action,{mydata: 'val1'},function(res){
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
      apx.runTask(task,{mydata: 'val1'},function(err){
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
      var inst = apx.newService(service)
      expect(inst.mystuff).to.equal('val1')
      //set the value to something else and reinit
      inst.mystuff = 'foo'
      expect(inst.mystuff).to.equal('foo')
      inst = apx.newService(service)
      expect(inst.mystuff).to.equal('val1')
    })
    it('should get the same instance of a service',function(){
      var service = {
        service: function(){
          this.mystuff = 'val1'
        }
      }
      var inst = apx.service(service)
      expect(inst.mystuff).to.equal('val1')
      //set the value to something else and reinit
      inst.mystuff = 'foo'
      expect(inst.mystuff).to.equal('foo')
      inst = apx.service(service)
      expect(inst.mystuff).to.equal('foo')
    })
  })

})