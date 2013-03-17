describe('evnet', function () {

  function rndPort() {
    return 9300 + Math.round(Math.random() * 1000)
  }

  function delayEmit(evnet, eventName, data) {
    setTimeout(function () {
      evnet.emit(eventName, data)
    }, 10)
  }

  describe('start()', function () {

    it('should start a server given two ports', function () {

      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)

      server.close()

    })

    it('should start a server given one port', function () {

      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port)

      server.ports.should.eql([port, port + 1])
      server.close()

    })

    it('should start a server on default port if none is given', function () {

      var evnet = require('../evnet')
        , server = evnet.start('0.0.0.0')

      server.ports.should.eql([9873, 9874])
      server.close()

    })

    it('should throw an error if ports are the same', function () {

      var evnet = require('../evnet')
        , port = rndPort();

      (function () {
        evnet.start('0.0.0.0', port, port)
      }).should.throwError('Must provide two different ports')

    })
  })

  it('should connect given two ports', function () {

    var evnet = require('../evnet')
      , port = rndPort()
      , server = evnet.start('0.0.0.0', port, port + 15)

    evnet('0.0.0.0', port, port + 15).ports.should.eql([port, port + 15])
    server.close()

  })

  it('should connect given one port', function () {

    var evnet = require('../evnet')
      , port = rndPort()
      , server = evnet.start('0.0.0.0', port)

    evnet('0.0.0.0', port).ports.should.eql([port, port + 1])
    server.close()

  })

  it('should connect on default port if none is given', function () {

    var evnet = require('../evnet')
      , server = evnet.start('0.0.0.0')

    evnet('0.0.0.0').ports.should.eql([9873, 9874])
    server.close()

  })

  it('should connect only once server has started', function (done) {

    var evnet = require('../evnet')
      , e = evnet('0.0.0.0')
      , server = evnet.start('0.0.0.0')

    e.on('hello', function(data) {
      data.should.equal('world')
      done()
      server.close()
    })

    e.emit('hello', 'world')
  })

  it('should throw an error if ports are the same', function () {

    var evnet = require('../evnet')
      , port = rndPort();

    (function () {
      evnet('0.0.0.0', port, port)
    }).should.throwError('Must provide two different ports')

  })

  describe('emit()', function () {

    it('should hear an emitted event', function (done) {

      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)
        , e = evnet('0.0.0.0', port, port + 15)

      e.on('HELLO', function (data) {
        data.should.equal('world')
        server.close()
        done()
      })

      delayEmit(e, 'HELLO', 'world')
    })

    it('should hear an multiple emitted event', function (done) {
      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)
        , e = evnet('0.0.0.0', port, port + 15)
      var recieved = []
      e.on('HELLO', function (data) {
        recieved.push(data)
        if (recieved.length === 2) {
          recieved.should.include('world').include('foo')
          server.close()
          done()
        }
      })

      delayEmit(e, 'HELLO', 'world')
      delayEmit(e, 'HELLO', 'foo')

    })


    it('should be able to pass JavaScript objects', function (done) {
      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)
        , e = evnet('0.0.0.0', port, port + 15)

      e.on('HELLO', function (data) {
        data.should.eql({ foo: 'bar' })
        server.close()
        done()
      })

      delayEmit(e, 'HELLO', { foo: 'bar' })

    })

    it('should throw error if JavaScript object has a circular reference', function () {
      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)
        , e = evnet('0.0.0.0', port, port + 15)

      var a = { foo: 1 }
        , b = { a: a }

      a.b = b;

      (function () {
        e.emit('HELLO', a)
      }).should.throwError('Converting circular structure to JSON', function () {
        server.close()
      })

    })
  })
  describe('on()', function () {
    it('should all receive emitted events', function (done) {
      var evnet = require('../evnet')
        , port = rndPort()
        , server = evnet.start('0.0.0.0', port, port + 15)
        , e = evnet('0.0.0.0', port, port + 15)

      var recieved = []

      function onMessage (data) {

        recieved.push(data)
        if (recieved.length === 2) {
          recieved.should.eql(['world', 'world'])
          server.close()
          done()
        }
      }

      e.on('HELLO', onMessage)
      e.on('HELLO', onMessage)

      delayEmit(e, 'HELLO', 'world')
    })
  })
})