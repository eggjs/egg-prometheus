'use strict';

const http = require('http');
const { Counter, Gauge, Histogram, Summary, register } = require('prom-client');

const httpServerMetrics = require('./lib/http_server');
const sofaRpcClientMetrics = require('./lib/sofa_rpc_client');
const sofaRpcServerMetrics = require('./lib/sofa_rpc_server');

module.exports = app => {
  const config = app.config.prometheus;
  // set default labels
  register.setDefaultLabels(Object.assign({
    app: app.config.name,
    pid: process.pid,
  }, config.defaultLabels));

  // expose api
  app.prometheus = {
    Counter,
    Gauge,
    Histogram,
    Summary,
    register,
  };

  // default metrics
  httpServerMetrics(app);
  sofaRpcClientMetrics(app);
  sofaRpcServerMetrics(app);

  const server = http.createServer((req, res) => {
    if (req.url === config.scrapePath) {
      res.setHeader('Content-Type', register.contentType);
      res.end(register.metrics());
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
    }
  });
  app.ready(err => {
    if (!err) {
      server.listen(config.scrapePort);
    }
  });
  app.beforeClose(() => {
    register.clear();
    server.close();
  });
};
