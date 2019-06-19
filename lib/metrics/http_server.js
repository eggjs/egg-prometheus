'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  const ResponseTime = new Summary({
    name: 'http_response_time_ms',
    help: 'ms to handle a request',
    labelNames: [ 'method', 'path', 'status' ],
  });

  /**
   * number of requests to a route
   *
   * @deprecated since version 1.1.1
   * will be deleted in version 1.2.0
   * prefer to use http_request_total
   */
  const RequestRate = new Counter({
    name: 'http_request_rate',
    help: 'number of requests to a route',
    labelNames: [ 'method', 'path', 'status' ],
  });
  const RequestTotal = new Counter({
    name: 'http_request_total',
    help: 'number of requests to a route',
    labelNames: [ 'method', 'path', 'status' ],
  });

  app.on('response', ctx => {
    const { method, path, status } = ctx;
    const rt = Date.now() - ctx.starttime;
    RequestRate.inc({ method, path, status }, 1);
    RequestTotal.inc({ method, path, status }, 1);
    ResponseTime.observe({ method, path, status }, rt);
  });
};
