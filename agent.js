'use strict';

const PrometheusServer = require('./lib/server');

module.exports = agent => {
  const server = new PrometheusServer(agent);
  agent.beforeStart(async () => {
    await server.ready();
  });
  agent.beforeClose(async () => {
    await server.close();
  });
};
