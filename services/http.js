'use strict';

import path from 'path';
import proxy from 'proxy-express';
import express from 'express';

import React from 'react';
import Router from 'react-router';

export default function (options, imports, provide) {

  const app = express();
  const port = options.port || 8080;
  const logger = imports.logger;

  const assetsPath = path.join(__dirname, '..', 'assets');

  app.get('/', function (req, res) {
    res.sendFile(path.join(assetsPath, 'index.html'));
  });

  // app.get('/api', require('./http/api'));

  if (process.env.WEBPACK) {
    app.use(proxy('localhost:8081', '/public'));
  } else {
    app.use('/public', express.static(assetsPath));
  }

  const server = app.listen(port, function () {
    logger.info(
      'Server listening at %s:%s',
      server.address().address,
      server.address().port
    );

    provide(server);
  });

}
