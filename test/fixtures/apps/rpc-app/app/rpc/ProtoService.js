'use strict';

exports.echoObj = async function(req) {
  if (req.name === 'error') {
    throw new Error('mock error');
  }

  return {
    code: 200,
    message: 'Hello ' + req.name,
  };
};
