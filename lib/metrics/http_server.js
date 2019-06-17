'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  const ResponseTime = new Summary({
    name: 'http_response_time_ms',
    help: 'ms to handle a request',
    labelNames: [ 'method', 'route', 'status' ],
  });
  const RequestRate = new Counter({
    name: 'http_request_rate',
    help: 'number of requests to a route',
    labelNames: [ 'method', 'route', 'status' ],
  });

  app.on('response', ctx => {
    const { method, _matchedRoute, status } = ctx;
    const rt = Date.now() - ctx.starttime;
    RequestRate.inc({ method, route: _matchedRoute, status }, 1);
    ResponseTime.observe({ method, route: _matchedRoute, status }, rt);
  });
};
