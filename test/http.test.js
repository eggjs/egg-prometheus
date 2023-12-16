'use strict';

const mm = require('egg-mock');
const assert = require('assert');
const urllib = require('urllib');

describe('test/http.test.js', () => {
  let app;
  before(async function() {
    app = mm.app({
      baseDir: 'apps/http-app',
    });
    await app.ready();
  });
  after(async function() {
    await app.close();
  });

  it('should has ctx.prometheus', () => {
    const ctx = app.createAnonymousContext();
    assert(ctx.prometheus);
  });

  it('should record only http server metrics', async function() {
    await app.httpRequest()
      .get('/')
      .expect('ok');

    const res = await urllib.curl('http://127.0.0.1:3000/metrics');
    assert(res && res.status === 200);
    const metricsStr = res.data.toString();
    console.log(metricsStr);

    assert(metricsStr.includes('TYPE http_response_time_ms summary'));
    assert(metricsStr.includes('TYPE http_request_rate counter'));
    assert(metricsStr.includes('TYPE http_request_total counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_response_time_ms summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_request_rate counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_request_total counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_fail_response_time_ms summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_request_fail_rate counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_request_fail_total counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_request_size_bytes summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_consumer_response_size_bytes summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_response_time_ms summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_request_rate counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_request_total counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_fail_response_time_ms summary'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_request_fail_rate counter'));
    assert(!metricsStr.includes('TYPE sofa_rpc_provider_request_fail_total counter'));
  });

  it('should process restful path', async () => {
    await app.httpRequest()
      .get('/api/v1/users/123')
      .expect(200)
      .expect('user_123');

    const res = await urllib.curl('http://127.0.0.1:3000/metrics');
    assert(res && res.status === 200);
    const metricsStr = res.data.toString();
    console.log(metricsStr);

    // assert(metricsStr.includes('path="/api/v1/users/123"'));
    // assert(metricsStr.includes('routerName="user"'));
    // assert(metricsStr.includes('matchedRoute="/api/v1/users/:id"'));
  });
});
