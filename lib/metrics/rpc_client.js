'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  if (!app.rpcClient) return;

  const ResponseTime = new Summary({
    name: 'rpc_consumer_response_time_ms',
    help: 'ms of rpc time consuming',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });

  /**
   * number of prc calls
   *
   * @deprecated since version 1.1.1
   * will be deleted in version 1.2.0
   * prefer to use rpc_consumer_request_total
   */
  const RequestRate = new Counter({
    name: 'rpc_consumer_request_rate',
    help: 'number of rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });
  const RequestTotal = new Counter({
    name: 'rpc_consumer_request_total',
    help: 'number of rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });
  const FailResponseTime = new Summary({
    name: 'rpc_consumer_fail_response_time_ms',
    help: 'ms of fail rpc time consuming',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });

  /**
   * number of fail rpc calls
   *
   * @deprecated since version 1.1.1
   * will be deleted in version 1.2.0
   * prefer to use rpc_consumer_request_fail_total
   */
  const FailRequestRate = new Counter({
    name: 'rpc_consumer_request_fail_rate',
    help: 'number of fail rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });
  const FailRequestTotal = new Counter({
    name: 'rpc_consumer_request_fail_total',
    help: 'number of fail rpc calls',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });
  const RequestSize = new Summary({
    name: 'rpc_consumer_request_size_bytes',
    help: 'rpc request size in bytes',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });
  const ResponseSize = new Summary({
    name: 'rpc_consumer_response_size_bytes',
    help: 'rpc response size in bytes',
    labelNames: [ 'service', 'method', 'protocol', 'target_app' ],
  });

  app.rpcClient.on('request', req => {
    if (req.requestProps && !req.requestProps.app) {
      req.requestProps.app = app.name;
    }

    const labels = {
      service: req.serverSignature,
      method: req.methodName,
      protocol: req.meta.protocol || 'bolt',
      target_app: req.targetAppName,
    };
    RequestRate.inc(labels, 1);
    RequestTotal.inc(labels, 1);
  });

  app.rpcClient.on('response', ({ req }) => {
    const labels = {
      service: req.serverSignature,
      method: req.methodName,
      protocol: req.meta.protocol || 'bolt',
      target_app: req.targetAppName,
    };

    const rt = req.meta.rt;
    if (rt != null) {
      ResponseTime.observe(labels, rt);
    }

    if (req.meta.resultCode !== '00') {
      FailRequestRate.inc(labels, 1);
      FailRequestTotal.inc(labels, 1);
      if (rt != null) {
        FailResponseTime.observe(labels, rt);
      }
    }

    // Record request size and response size
    const requestSize = req.meta.reqSize;
    const responseSize = req.meta.resSize;

    if (requestSize != null) {
      RequestSize.observe(labels, requestSize);
    }

    if (responseSize != null) {
      ResponseSize.observe(labels, responseSize);
    }
  });
};
