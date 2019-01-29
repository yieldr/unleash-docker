'use strict';

const unleash = require('unleash-server');
const auth = require('./auth');

unleash
  .start({
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    host: process.env.HTTP_HOST || 'localhost',
    secret: process.env.SECRET,
    enableLegacyRoutes: false,
    adminAuthentication: 'custom',
    preRouterHook: auth.preRouterHook,
  })
  .then(unleash => {
    console.log(
      `Unleash started on http://${unleash.app.get('host')}:${unleash.app.get('port')}`,
    );
  });
