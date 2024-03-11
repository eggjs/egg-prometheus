# egg-prometheus

Prometheus plugin for egg framework

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/eggjs/egg-prometheus/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eggjs/egg-prometheus/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-prometheus.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-prometheus
[codecov-image]: https://codecov.io/gh/eggjs/egg-prometheus/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-prometheus
[download-image]: https://img.shields.io/npm/dm/egg-prometheus.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-prometheus

[Prometheus](https://prometheus.io) plugin for egg framework

## Install

```bash
npm i egg-prometheus --save
```

## Usage

### Enable the plugin

Change `${app_root}/config/plugin.js` to enable Prometheus plugin:

```js
exports.prometheus = {
  enable: true,
  package: "egg-prometheus",
};
```

### Configuration

```js
exports.prometheus = {
  timeout: 5000,
  scrapePort: 3000,
  scrapePath: '/metrics',
  defaultHttpMetricsFilter: ({ method, status, routerName, path }) => true,
  defaultLabels: { ... },
};
```

- `timeout`: metrics pull timeout
- `scrapePort`: the port to scrape metrics from
- `scrapePath`: the path to scrape metrics from
- `defaultLabels`: static labels may be applied to every metric emitted by a registry
- `defaultHttpMetricsFilter`: can custom filter default http metrics, return false can prevent metrics

## Default Metrics

- `http_response_time_ms summary`: ms to handle a request
- `http_request_rate counter`: number of requests to a route

while egg-rpc-base is enabled

- `rpc_consumer_response_time_ms summary`: ms of rpc time consuming
- `rpc_consumer_request_rate counter`: number of rpc calls
- `rpc_consumer_fail_response_time_ms summary`: ms of fail rpc time consuming
- `rpc_consumer_request_fail_rate counter`: number of fail rpc calls
- `rpc_consumer_request_size_bytes summary`: rpc request size in bytes
- `rpc_consumer_response_size_bytes summary`: rpc response size in bytes
- `rpc_provider_response_time_ms summary`: ms of request processed time
- `rpc_provider_request_rate counter`: number of rpc calls
- `rpc_provider_fail_response_time_ms summary`: ms of fail request processed time
- `rpc_provider_request_fail_rate counter`: number of fail rpc calls

## Custom Metrics

```js
// Here's an example senario:
// Some metric called 'pv' stands for 'page view'
// We are going to know its total count.
// To ensure that we know the pv of each visit source
// We define a label called from.
const counter = new app.prometheus.Counter({
  name: "pv_total",
  help: "custom counter",
  labelNames: ["from"],
});
// To use the from label, we do as the following.
counter.labels(['google_com']).inc();
counter.labels(['facebook_com']).inc();

// Gauge
const gauge = new app.prometheus.Gauge({
  name: "xxx_gauge",
  help: "custom gauge",
  labelNames: ["xxx"],
});

// Histogram
const histogram = new app.prometheus.Histogram({
  name: "xxx_histogram",
  help: "custom histogram",
  labelNames: ["xxx"],
});

// Summary
const summary = new app.prometheus.Summary({
  name: "xxx_summary",
  help: "custom summary",
  labelNames: ["xxx"],
});
```

## How to Contribute

Please let us know how can we help. Do check out [issues](https://github.com/eggjs/egg/issues) for bug reports or suggestions first.

To become a contributor, please follow our [contributing guide](https://github.com/eggjs/egg/blob/master/CONTRIBUTING.md).

## License

[MIT](LICENSE)

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/1207064?v=4" width="100px;"/><br/><sub><b>gxcsoccer</b></sub>](https://github.com/gxcsoccer)<br/>|[<img src="https://avatars.githubusercontent.com/u/1619030?v=4" width="100px;"/><br/><sub><b>xujihui1985</b></sub>](https://github.com/xujihui1985)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/2972143?v=4" width="100px;"/><br/><sub><b>nightink</b></sub>](https://github.com/nightink)<br/>|[<img src="https://avatars.githubusercontent.com/u/7581901?v=4" width="100px;"/><br/><sub><b>sjfkai</b></sub>](https://github.com/sjfkai)<br/>|[<img src="https://avatars.githubusercontent.com/u/26036163?v=4" width="100px;"/><br/><sub><b>jgchenu</b></sub>](https://github.com/jgchenu)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Fri Dec 15 2023 17:58:23 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
