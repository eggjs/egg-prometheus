# egg-prometheus

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-prometheus.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-prometheus
[travis-image]: https://img.shields.io/travis/eggjs/egg-prometheus.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-prometheus
[codecov-image]: https://codecov.io/gh/eggjs/egg-prometheus/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-prometheus
[david-image]: https://img.shields.io/david/eggjs/egg-prometheus.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-prometheus
[snyk-image]: https://snyk.io/test/npm/egg-prometheus/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-prometheus
[download-image]: https://img.shields.io/npm/dm/egg-prometheus.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-prometheus

为 egg 提供 [Prometheus](https://prometheus.io) 功能支持

## 安装

```bash
$ npm i egg-prometheus --save
```

## 用法

### 开启插件

通过 `${app_root}/config/plugin.js` 配置启动 Prometheus 插件:

```js
exports.prometheus = {
  enable: true,
  package: "egg-prometheus",
};
```

### 配置

```js
exports.prometheus = {
  timeout: 3000
  scrapePort: 3000,
  scrapePath: '/metrics',
  defaultHttpMetricsFilter: ({ method, status, routerName, path }) => true,
  defaultLabels: { ... },
};
```

- `timeout`: metrics 数据的拉取超时时间
- `scrapePort`: 监听的用于采集 metrics 的端口
- `scrapePath`: 监听的采集 metrics 的服务路径
- `defaultLabels`: 默认的 metrics 标签，全局生效
- `defaultHttpMetricsFilter`: 默认的 http metrics 的过滤函数，自定义过滤逻辑，返回 true 就是不过滤，返回 false 就是过滤

## 内置的 Metrics

- `http_response_time_ms summary`: http 请求耗时
- `http_request_rate counter`: http 请求数

当 egg-rpc-base 插件开启时，还会提供下面 metrics

- `rpc_consumer_response_time_ms summary`: rpc 客户端请求耗时
- `rpc_consumer_request_rate counter`: rpc 客户端请求数
- `rpc_consumer_fail_response_time_ms summary`: rpc 客户端失败的请求耗时
- `rpc_consumer_request_fail_rate counter`: rpc 客户端失败的请求数
- `rpc_consumer_request_size_bytes summary`: rpc 请求大小统计
- `rpc_consumer_response_size_bytes summary`: rpc 响应大小统计
- `rpc_provider_response_time_ms summary`: rpc 服务端处理时间
- `rpc_provider_request_rate counter`: rpc 服务端收到请求数
- `rpc_provider_fail_response_time_ms summary`: rpc 服务端失败的请求处理时间
- `rpc_provider_request_fail_rate counter`: rpc 服务端失败的请求数

## 自定义 Metrics

可以通过下面 API 自定义业务 metrics

```js
const counter = new app.prometheus.Counter({
  name: "xxx_total",
  help: "custom counter",
  labelNames: ["xxx"],
});

const gauge = new app.prometheus.Gauge({
  name: "xxx_gauge",
  help: "custom gauge",
  labelNames: ["xxx"],
});

const histogram = new app.prometheus.Histogram({
  name: "xxx_histogram",
  help: "custom histogram",
  labelNames: ["xxx"],
});

const summary = new app.prometheus.Summary({
  name: "xxx_summary",
  help: "custom summary",
  labelNames: ["xxx"],
});
```

## 如何贡献

请告知我们可以为你做些什么，不过在此之前，请检查一下是否有[已经存在的 Bug 或者意见](https://github.com/eggjs/egg/issues)。

如果你是一个代码贡献者，请参考[代码贡献规范](CONTRIBUTING.md)。

## License

[MIT](LICENSE)
