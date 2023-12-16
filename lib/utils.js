'use strict';

const MAX_LEN = 100;

function formatMessage(message) {
  return message
    .map(message => {
      if (Buffer.isBuffer(message)) {
        message = message.toString();
      }
      return String(message).slice(0, MAX_LEN);
    })
    .join(';');
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  formatMessage,
  sleep,
};
