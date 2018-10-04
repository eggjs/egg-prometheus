'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  const ResponseTime = new Summary({
    name: 'http_response_time_ms',
    help: 'ms to handle a request',
    labelNames: [ 'method', 'path', 'status' ],
  });
  const RequestRate = new Counter({
    name: 'http_request_rate',
    help: 'number of requests to a route',
    labelNames: [ 'method', 'path', 'status' ],
  });

  app.on('request', ctx => {
    const { method, path, status } = ctx;
    RequestRate.inc({ method, path, status }, 1);
  });
  app.on('response', ctx => {
    const { method, path, status } = ctx;
    const rt = Date.now() - ctx.starttime;
    ResponseTime.observe({ method, path, status }, rt);
  });
};
