'use strict';

const net = require('net');
const http = require('http');
const Base = require('sdk-base');
const protocol = require('./protocol');
const Connection = require('connection');
const awaitFirst = require('await-first');
const { Registry, aggregators } = require('prom-client');
const { formatMessage } = require('./utils');

class Grouper extends Map {
  /**
   * Adds the `value` to the `key`'s array of values.
   * @param {*} key Key to set.
   * @param {*} value Value to add to `key`'s array.
   * @return {undefined} undefined.
   */
  add(key, value) {
    if (this.has(key)) {
      this.get(key).push(value);
    } else {
      this.set(key, [ value ]);
    }
  }
}

class PrometheusServer extends Base {
  constructor(agent) {
    super({ initMethod: '_init' });

    this.agent = agent;
    this.server = null;
    this.connections = new Map();
    this.metricsServer = null;
  }

  get logger() {
    return {
      ...this.agent.coreLogger,
      error: (...args) => {
        this.agent.coreLogger.error(formatMessage(args));
      },
    };
  }

  get config() {
    return this.agent.config.prometheus;
  }

  get register() {
    return this.agent.prometheus.register;
  }

  async _init() {
    const port = this.config.aggregatorPort || 6789;
    const timeout = this.config.timeout || 3000;
    const server = this.server = net.createServer();
    server.listen(port);
    await awaitFirst(server, [ 'listening', 'error' ]);
    server.on('connection', async socket => {
      const conn = new Connection({
        logger: this.logger,
        socket,
        protocol,
      });
      conn.on('request', req => {
        conn.writeResponse(req, {
          error: null,
          appResponse: '',
        });
      });
      await conn.ready();
      const key = conn.url;
      conn.once('close', () => {
        this.connections.delete(key);
      });
      conn.on('error', err => {
        this.logger.error(err);
      });
      this.connections.set(key, conn);
    });

    const metricsServer = this.metricsServer = http.createServer(async (req, res) => {
      if (req.url === this.config.scrapePath) {
        const tasks = [];

        try {
          for (const conn of this.connections.values()) {
            tasks.push(conn.writeRequest({
              method: 'getMetrics',
              args: [],
              timeout,
            }));
          }
          const arr = await Promise.all(tasks);
          const metricsArr = arr.map(item => JSON.parse(item.data));
          metricsArr.push(this.register.getMetricsAsJSON());

          const aggregatedRegistry = this.aggregate(metricsArr);
          res.setHeader('Content-Type', aggregatedRegistry.contentType);
          res.end(aggregatedRegistry.metrics());
        } catch (err) {
          this.logger.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('internal exception');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('not found');
      }
    });
    metricsServer.listen(this.config.scrapePort);
  }

  aggregate(metricsArr) {
    const aggregatedRegistry = new Registry();
    const metricsByName = new Grouper();

    // Gather by name
    metricsArr.forEach(metrics => {
      metrics.forEach(metric => {
        metricsByName.add(metric.name, metric);
      });
    });

    // Aggregate gathered metrics.
    metricsByName.forEach(metrics => {
      const aggregatorName = metrics[0].aggregator;
      const aggregatorFn = aggregators[aggregatorName];
      if (typeof aggregatorFn !== 'function') {
        throw new Error(`'${aggregatorName}' is not a defined aggregator.`);
      }
      const aggregatedMetric = aggregatorFn(metrics);
      // NB: The 'omit' aggregator returns undefined.
      if (aggregatedMetric) {
        const aggregatedMetricWrapper = Object.assign({
          get: () => aggregatedMetric,
        },
        aggregatedMetric
        );
        aggregatedRegistry.registerMetric(aggregatedMetricWrapper);
      }
    });

    return aggregatedRegistry;
  }

  async close() {
    if (this.metricsServer) {
      this.metricsServer.close();
    }
    if (this.server) {
      this.server.close();
    }
    for (const conn of this.connections.values()) {
      await conn.close();
    }
    this.register.clear();
  }
}

module.exports = PrometheusServer;
