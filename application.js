/* eslint-disable no-var, no-console */
'use strict';

require('babel/register');

var Application = require('./modules/application');

var basePath = __dirname;
var appConfig = require('./modules/config')(basePath);
var application = new Application(appConfig, basePath);

application.execute().catch(console.error.bind(console));
