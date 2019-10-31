'use strict';

module.exports = app => {
  const { router, controller } = app;
  router.get('/', async function(ctx) {
    ctx.body = 'ok';
  });
  router.resources('users', '/api/v1/users', controller.users);
};
