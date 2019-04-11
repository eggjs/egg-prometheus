'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  if (!app.rpcServer) return;

  const ResponseTime = new Summary({
    name: 'rpc_provider_response_time_ms',
    help: 'ms of request processed time',
    labelNames: [ 'service', 'method', 'protocol', 'caller_app' ],
  });
  const RequestRate = new Counter({
    name: 'rpc_provider_request_rate',
    help: 'number of rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'caller_app' ],
  });
  const FailResponseTime = new Summary({
    name: 'rpc_provider_fail_response_time_ms',
    help: 'ms of fail request processed time',
    labelNames: [ 'service', 'method', 'protocol', 'caller_app' ],
  });
  const FailRequestRate = new Counter({
    name: 'rpc_provider_request_fail_rate',
    help: 'number of fail rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'caller_app' ],
  });

  app.rpcServer.on('response', ({ req, res }) => {
    const labels = {
      service: req.data.serverSignature,
      method: req.data.methodName,
      protocol: req.options.protocolType || 'bolt',
      caller_app: req.data.requestProps && req.data.requestProps.app,
    };
    // Record the number of calls and time consuming
    RequestRate.inc(labels, 1);

    const rt = res.meta.rt;
    if (rt != null) {
      ResponseTime.observe(labels, rt);
    }

    if (res.meta.resultCode !== '00') {
      FailRequestRate.inc(labels, 1);
      if (rt != null) {
        FailResponseTime.observe(labels, rt);
      }
    }
  });
};
