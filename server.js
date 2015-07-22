/* eslint-disable no-var */
'use strict';

require('babel/register');

var path = require('path');
var basePath = __dirname;
var appConfig = require('./modules/config')(basePath);
var recluster = require('recluster');

var cluster = recluster(path.join(basePath, 'application.js'), {
  workers: appConfig.cluster.workers
});

cluster.run();

process.on('SIGUSR2', function () {
  cluster.reload();
});
