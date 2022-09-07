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

module.exports = {
  formatMessage,
};
