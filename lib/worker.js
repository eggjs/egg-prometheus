'use strict';

const net = require('net');
const Base = require('sdk-base');
const cluster = require('cluster');
const protocol = require('./protocol');
const Connection = require('connection');
const awaitFirst = require('await-first');
const sleep = require('mz-modules/sleep');

class PrometheusWorker extends Base {
  constructor(app) {
    super({ initMethod: '_init' });

    this.app = app;
    this.conn = null;
    this.lastReqTime = 0;
    this.isClosed = false;
  }

  get logger() {
    return this.app.coreLogger;
  }

  get config() {
    return this.app.config.prometheus;
  }

  get register() {
    return this.app.prometheus.register;
  }

  async _createConnection() {
    const port = this.config.aggregatorPort || 6789;
    const socket = net.connect(port, '127.0.0.1');
    await awaitFirst(socket, [ 'connect', 'error' ]);
    const conn = new Connection({
      logger: this.logger,
      socket,
      protocol,
    });
    conn.on('request', req => {
      this.lastReqTime = Date.now();
      conn.writeResponse(req, {
        error: null,
        appResponse: this.register.getMetricsAsJSON(),
      });
    });
    conn.once('close', () => {
      if (this.isClosed) return;

      this._createConnection().catch(err => {
        this.logger.error(err);
      });
    });
    await conn.ready();
    return conn;
  }

  async _init() {
    // 只在 cluster 模式下才向 agent 注册
    if (!cluster.isWorker) return;

    this.conn = await this._createConnection();
    this.startHeartbeat();
  }

  async startHeartbeat() {
    while (!this.isClosed) {
      const now = Date.now();
      const gap = now - this.lastReqTime;

      if (gap > 60 * 1000) {
        this.lastReqTime = now;
        try {
          await this.conn.writeRequest({ method: 'heartbeat', args: [], timeout: 1000 });
        } catch (err) {
          this.logger.warn(err);
        }
      }
      await sleep(30 * 1000);
    }
  }

  async close() {
    this.isClosed = true;
    this.register.clear();
    if (this.conn) {
      await this.conn.close();
    }
  }
}

module.exports = PrometheusWorker;
