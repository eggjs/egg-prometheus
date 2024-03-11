import {
  Counter,
  Gauge,
  Histogram,
  Summary,
  register,
} from 'prom-client';

type HttpMetricsFilterOpt = {
  method: string;
  status: number;
  routerName: string;
  path: string;
};

interface EggPrometheusConfig {
  scrapePort: number;
  scrapePath: string;
  aggregatorPort: number;
  enableDefaultMetrics: boolean,
  timeout: number,
  defaultLabels: Object,
  defaultHttpMetricsFilter: (opt: HttpMetricsFilterOpt) => boolean;
}

interface EggPrometheus {
  Counter: typeof Counter;
  Gauge: typeof Gauge;
  Histogram: typeof Histogram;
  Summary: typeof Summary;
  register: typeof register;
}

declare module 'egg' {
  interface Application {
    prometheus: EggPrometheus;
  }

  interface Context {
    prometheus: EggPrometheus;
  }

  interface EggAppConfig {
    prometheus: EggPrometheusConfig;
  }
}
