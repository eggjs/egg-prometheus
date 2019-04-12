'use strict';

const Writable = require('stream').Writable;
const Packet = require('cluster-client/lib/protocol/packet');

const PROTOCOL_HEADER_LEN = 24;

class ProtocolDecoder extends Writable {
  constructor(opts) {
    super(opts);
    this._buf = null;
  }

  _write(chunk, encoding, callback) {
    // 合并 buf 中的数据
    this._buf = this._buf ? Buffer.concat([ this._buf, chunk ]) : chunk;
    try {
      let unfinish = false;
      do {
        unfinish = this._decode();
      } while (unfinish);
      callback();
    } catch (err) {
      err.name = 'PromeDecodeError';
      err.data = this._buf ? this._buf.toString('base64') : '';
      callback(err);
    }
  }

  _decode() {
    const bufLength = this._buf.length;
    if (bufLength < PROTOCOL_HEADER_LEN) return false;

    const packetLength = PROTOCOL_HEADER_LEN + this._buf.readInt32BE(16) + this._buf.readInt32BE(20);
    if (bufLength < packetLength) return false;

    const packet = this._buf.slice(0, packetLength);
    // 调用反序列化方法获取对象
    const obj = Packet.decode(packet);
    obj.packetId = obj.packetId || obj.id;
    this.emit(obj.connObj.type, obj);
    const restLen = bufLength - packetLength;
    if (restLen) {
      this._buf = this._buf.slice(packetLength);
      return true;
    }
    this._buf = null;
    return false;
  }

  _destroy() {
    this._buf = null;
    this.emit('close');
  }
}

module.exports = ProtocolDecoder;
