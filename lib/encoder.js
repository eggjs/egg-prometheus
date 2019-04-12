'use strict';

const Transform = require('stream').Transform;
const Request = require('cluster-client/lib/protocol/request');
const Response = require('cluster-client/lib/protocol/response');

const noop = () => {};

class ProtocolEncoder extends Transform {
  constructor(opts) {
    super(opts);

    this._limited = false;
    this._queue = [];
    this.once('close', () => { this._queue = []; });
    this.on('drain', () => {
      this._limited = false;
      do {
        const item = this._queue.shift();
        if (!item) break;

        const packet = item[0];
        const callback = item[1];
        this._writePacket(packet, callback);
      } while (!this._limited);
    });
  }

  writeRequest(id, req, callback) {
    this._writePacket({
      packetId: id,
      packetType: 'request',
      req,
    }, callback);
  }

  writeResponse(req, res, callback) {
    this._writePacket({
      packetId: req.packetId,
      packetType: 'response',
      req,
      res,
    }, callback);
  }

  _writePacket(packet, callback = noop) {
    if (this._limited) {
      this._queue.push([ packet, callback ]);
    } else {
      let buf;
      try {
        buf = this['_' + packet.packetType + 'Encode'](packet);
      } catch (err) {
        return callback(err, packet);
      }
      // @refer: https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
      // The return value is true if the internal buffer is less than the highWaterMark configured
      // when the stream was created after admitting chunk. If false is returned, further attempts to
      // write data to the stream should stop until the 'drain' event is emitted.
      this._limited = !this.write(buf, err => {
        callback(err, packet);
      });
    }
  }

  _requestEncode(packet) {
    const id = packet.packetId;
    const { method, args, timeout = 1000 } = packet.req;

    const req = new Request({
      id,
      connObj: {
        type: 'request',
        method,
      },
      data: Buffer.from(JSON.stringify(args)),
      timeout,
    });
    return req.encode();
  }

  _responseEncode(packet) {
    const id = packet.packetId;
    const { error, appResponse } = packet.res;
    const res = new Response({
      id,
      connObj: {
        type: 'response',
        success: !error,
      },
      data: Buffer.from(JSON.stringify(appResponse)),
    });
    return res.encode();
  }

  _transform(buf, encoding, callback) {
    callback(null, buf);
  }
}

module.exports = ProtocolEncoder;
