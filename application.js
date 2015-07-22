/* eslint-disable no-var, no-console */
'use strict';

require('babel/register');

var Application = require('./modules/application');

var basePath = __dirname;
var appConfig = require('./modules/config')(basePath);
var application = new Application(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application.execute().catch(function (error) {
  console.error(error && error.stack ? error.stack : error);
});
