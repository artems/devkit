'use strict';

import path from 'path';
import express from 'express';

import proxy from 'proxy-express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';

import responseJSON from './http/response';

import badgeRouter from './badge/routes';
import githubRouter from './github/routes';

export default function (options, imports, provide) {

  const app = express();
  const port = options.port || 8080;
  const logger = imports.logger;

  const assetsPath = path.join(__dirname, '..', 'assets');

  app.use(responseTime());
  app.use(bodyParser.json());

  app.use(responseJSON());

  app.get('/', function (req, res) {
    res.sendFile(path.join(assetsPath, 'index.html'));
  });

  app.use('/badge', badgeRouter(imports));
  app.use('/github', githubRouter(imports));

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
