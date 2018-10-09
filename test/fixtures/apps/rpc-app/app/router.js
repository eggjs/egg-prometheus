'use strict';

module.exports = app => {
  app.get('/rpc', async function(ctx) {
    const result = await ctx.proxy.protoService.echoObj({
      name: ctx.query.name || 'world',
      group: 'B',
    });
    ctx.body = result;
  });
};
