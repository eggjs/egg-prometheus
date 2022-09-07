'use strict';

exports.prometheus = {
  scrapePort: 3000,
  scrapePath: '/metrics',
  aggregatorPort: 6789,
  enableDefaultMetrics: true,
  timeout: 3000,
  defaultHttpMetricsFilter: () => true,
};
