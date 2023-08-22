'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  const defaultHttpMetricsFilter = app.config.prometheus.defaultHttpMetricsFilter || function() { return true; };

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
    const { method, status, _matchedRoute } = ctx;
    let path = ctx.path;
    const routerName = ctx.routerName || _matchedRoute || '';
    const rt = Date.now() - ctx.starttime;
    if (typeof defaultHttpMetricsFilter === 'function' && !defaultHttpMetricsFilter({ method, status, routerName, path })) {
      return false;
    }
    if (routerName !== '*') {
      path = routerName;
    }
    RequestRate.inc({ method, path, status }, 1);
    RequestTotal.inc({ method, path, status }, 1);
    ResponseTime.observe({ method, path, status }, rt);
  });
};
