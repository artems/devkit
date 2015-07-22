'use strict';

import path from 'path';
import express from 'express';

import proxy from 'proxy-express';
import responseTime from 'response-time';

export default function (options, imports, provide) {

  const app = express();
  const port = options.port || 8080;
  const badge = imports.badge;
  const logger = imports.logger;

  const assetsPath = path.join(__dirname, '..', 'assets');

  app.use(responseTime());

  app.get('/', function (req, res) {
    res.sendFile(path.join(assetsPath, 'index.html'));
  });

  app.get('/badge/*', require('./http/badge')('/badge/', badge));

  if (process.env.WEBPACK) {
    app.use(proxy('localhost:8081', '/public'));
  } else {
    app.use('/public', express.static(assetsPath));
  }

  const server = app.listen(port, () => {
    logger.info(
      'Server listening at %s:%s',
      server.address().address,
      server.address().port
    );

    provide(server);
  });

}
