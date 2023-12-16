'use strict';

const assert = require('assert');
const pedding = require('pedding');
const awaitEvent = require('await-event');
const protocol = require('../lib/protocol');
const PassThrough = require('stream').PassThrough;

describe('test/protocol.test.js', () => {
  it('should writeRequest / writeResponse', async () => {
    const encoder = protocol.encoder();
    const decoder = protocol.decoder();
    const socket = new PassThrough();
    encoder.pipe(socket).pipe(decoder);

    setImmediate(() => {
      encoder.writeRequest(1, {
        args: [],
        method: 'test',
        timeout: 300000,
      });
    });
    const req = await awaitEvent(decoder, 'request');
    assert.deepEqual(req, {
      id: 1,
      isResponse: false,
      timeout: 300000,
      connObj: { type: 'request', method: 'test' },
      data: Buffer.from([ 0x5b, 0x5d ]),
      packetId: 1,
    });

    setImmediate(() => {
      encoder.writeResponse(req, {
        error: null,
        appResponse: 'hello world',
      });
    });
    const res = await awaitEvent(decoder, 'response');
    assert.deepEqual(res, {
      id: 1,
      isResponse: true,
      timeout: 0,
      connObj: { type: 'response', success: true },
      data: Buffer.from('"hello world"'),
      packetId: 1,
    });

    decoder.destroy();
    encoder.destroy();
    socket.destroy();
  });

  it('should process drain ok', done => {
    const encoder = protocol.encoder({ writableHighWaterMark: 100 });
    const decoder = protocol.decoder();
    const socket = new PassThrough();
    encoder.pipe(socket).pipe(decoder);

    setImmediate(() => {
      for (let i = 0; i < 1000; i++) {
        encoder.writeRequest(i, {
          args: [ '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789' ],
          method: 'test',
          timeout: 300000,
        });
      }
    });

    let counter = 0;
    decoder.on('request', req => {
      assert(req && req.connObj && req.connObj.type === 'request');
      counter++;
      if (counter === 1000) {
        decoder.destroy();
        encoder.destroy();
        socket.destroy();
        done();
      }
    });
  });

  it('should decoder support receive partial data', done => {
    done = pedding(done, 2);
    const decoder = protocol.decoder();
    const socket = new PassThrough();
    socket.pipe(decoder);

    decoder.on('request', req => {
      assert.deepEqual(req, {
        id: 1,
        isResponse: false,
        timeout: 3000,
        connObj: { type: 'request', method: 'test' },
        data: Buffer.from([ 0x5b, 0x31, 0x2c, 0x32, 0x5d ]),
        packetId: 1,
      });
      done();
    });

    const buf = Buffer.from('01000000000000000000000100000bb800000022000000057b2274797065223a2272657175657374222c226d6574686f64223a2274657374227d5b312c325d', 'hex');
    socket.write(buf.slice(0, 10));
    socket.write(buf.slice(10, 25));
    socket.write(Buffer.concat([ buf.slice(25), buf ]));
  });

  it.skip('should decoder handle error', done => {
    const decoder = protocol.decoder();
    const socket = new PassThrough();
    socket.pipe(decoder);

    decoder.once('error', err => {
      assert(err && err.name === 'PromeDecodeError');
      assert(err.data === 'AQAAAAAAAAAAAAABAAALuAAAACIAAAAFeyN0eXBlIjoicmVxdWVzdCIsIm1ldGhvZCI6InRlc3QifVsxLDJd');
      done();
    });

    const buf = Buffer.from('01000000000000000000000100000bb800000022000000057b2374797065223a2272657175657374222c226d6574686f64223a2274657374227d5b312c325d', 'hex');
    socket.write(buf);
  });
});
