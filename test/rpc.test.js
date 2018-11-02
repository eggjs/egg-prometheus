'use strict';

const mm = require('egg-mock');
const assert = require('assert');
const urllib = require('urllib');
const sleep = require('mz-modules/sleep');

describe('test/rpc.test.js', () => {
  let app;
  before(async function() {
    app = mm.app({
      baseDir: 'apps/rpc-app',
    });
    await app.ready();
    await sleep(1000);
  });
  after(async function() {
    await app.close();
  });

  it('should record metrics ok', async function() {
    await app.httpRequest()
      .get('/rpc')
      .expect({
        code: 200,
        message: 'Hello world',
      });

    let res = await urllib.curl('http://127.0.0.1:3000/metrics');
    assert(res && res.status === 200);
    const metricsStr = res.data.toString();
    console.log(metricsStr);

    assert(metricsStr.includes('TYPE http_response_time_ms summary'));
    assert(metricsStr.includes('TYPE http_request_rate counter'));
    assert(metricsStr.includes('TYPE rpc_consumer_response_time_ms summary'));
    assert(metricsStr.includes('TYPE rpc_consumer_request_rate counter'));
    assert(metricsStr.includes('TYPE rpc_consumer_fail_response_time_ms summary'));
    assert(metricsStr.includes('TYPE rpc_consumer_request_fail_rate counter'));
    assert(metricsStr.includes('TYPE rpc_consumer_request_size_bytes summary'));
    assert(metricsStr.includes('TYPE rpc_consumer_response_size_bytes summary'));
    assert(metricsStr.includes('TYPE rpc_provider_response_time_ms summary'));
    assert(metricsStr.includes('TYPE rpc_provider_request_rate counter'));
    assert(metricsStr.includes('TYPE rpc_provider_fail_response_time_ms summary'));
    assert(metricsStr.includes('TYPE rpc_provider_request_fail_rate counter'));

    res = await urllib.curl('http://127.0.0.1:3000/metric');
    assert(res && res.status === 404);
  });

  it('should record failed metrics ok', async function() {
    await app.httpRequest()
      .get('/rpc?name=error')
      .expect(500, err => {
        assert(err.message.includes('mock error'));
      });

    const res = await urllib.curl('http://127.0.0.1:3000/metrics');
    assert(res && res.status === 200);
    const metricsStr = res.data.toString();
    console.log(metricsStr);

    assert(metricsStr.includes(`rpc_provider_request_fail_rate{service="com.alipay.sofa.rpc.protobuf.ProtoService:1.0",method="echoObj",protocol="bolt",caller_app="rpc-app",app="rpc-app",pid="${process.pid}"} 1`));

    assert(metricsStr.includes('http_response_time_ms_count{method="GET",path="/rpc",status="200"'));
    assert(metricsStr.includes('http_response_time_ms_count{method="GET",path="/rpc",status="500"'));
  });
});
