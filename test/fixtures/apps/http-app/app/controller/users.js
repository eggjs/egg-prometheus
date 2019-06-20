'use strict';

exports.show = async ctx => {
  ctx.body = 'user_' + ctx.params.id;
};
