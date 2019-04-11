'use strict';

const PrometheusWorker = require('./lib/worker');
const rpcClientMetrics = require('./lib/metrics/rpc_client');
const rpcServerMetrics = require('./lib/metrics/rpc_server');
const httpServerMetrics = require('./lib/metrics/http_server');

module.exports = app => {
  rpcClientMetrics(app);
  rpcServerMetrics(app);
  httpServerMetrics(app);

  const worker = new PrometheusWorker(app);
  app.beforeStart(async () => {
    await worker.ready();
  });
  app.beforeClose(async () => {
    await worker.close();
  });
};
