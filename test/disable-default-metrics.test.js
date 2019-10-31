'use strict';

const mm = require('egg-mock');
const assert = require('assert');
const urllib = require('urllib');

describe('test/disable-default-metrics.test.js', () => {
  let app;
  before(async function() {
    app = mm.app({
      baseDir: 'apps/disable-default-metrics',
    });
    await app.ready();
  });
  after(async function() {
    await app.close();
  });

  it('should do not record', async function() {
    await app.httpRequest()
      .get('/')
      .expect('ok');

    const res = await urllib.curl('http://127.0.0.1:3000/metrics');
    assert(res && res.status === 200);
    const metricsStr = res.data.toString();
    console.log(metricsStr);

    assert(!metricsStr.includes('TYPE http_response_time_ms summary'));
  });

});
