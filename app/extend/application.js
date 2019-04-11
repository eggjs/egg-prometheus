'use strict';

const { Counter, Gauge, Histogram, Summary, register } = require('prom-client');
// Symbol
const _prometheus = Symbol.for('EggApplication#prometheus');

module.exports = {
  get prometheus() {
    if (!this[_prometheus]) {
      const { name, prometheus } = this.config;
      // set default labels
      register.setDefaultLabels(Object.assign({
        app: name,
        pid: process.pid,
      }, prometheus.defaultLabels));

      this[_prometheus] = {
        Counter,
        Gauge,
        Histogram,
        Summary,
        register,
      };
    }
    return this[_prometheus];
  },
};
