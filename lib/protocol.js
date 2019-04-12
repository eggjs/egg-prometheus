'use strict';

const Encoder = require('./encoder');
const Decoder = require('./decoder');

module.exports = {
  name: 'PromethenusRpc',
  encoder: opts => new Encoder(opts),
  decoder: opts => new Decoder(opts),
};
