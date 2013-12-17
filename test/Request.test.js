var Request = require('../lib/Request')
describe('APX Request',function(){
  var data1 = {test1: 'val1', test2: 'val2'}
    , data2 = {test3: 'val3', test4: 'val4'}
    , data3 = {test5: {test6: 'val6'}}
  it('should accept data to the constructor',function(){
    var req = new Request(data1)
    expect(req.data.test1).to.equal('val1')
    expect(req.data.test2).to.equal('val2')
  })
  it('should be able to merge in data after constructing',function(){
    var req = new Request([data1,data2])
    expect(req.data.test3).to.equal('val3')
    expect(req.data.test4).to.equal('val4')
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
  it('should be false if a key doesnt exist',function(){
    var req = new Request([data1,data3])
    expect(req.exists('test6.test6')).to.equal(false)
  })
  it('should be ale to remove a key and children',function(){
    var req = new Request([data1,data3])
    req.remove('test5')
    expect(req.exists('test5.test6')).to.equal(false)
  })
})