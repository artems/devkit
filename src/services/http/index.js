import express from 'express';
import { forEach } from 'lodash';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import responseJSON from './response';

export default function setup(options, imports) {

  const app = express();
  const port = options.port;
  const logger = imports.logger.getLogger('http');

  app.use(bodyParser.json());
  app.use(responseTime());
  app.use(responseJSON());

  forEach(options.routes, (router, route) => {
    const routerModule = imports[router];
    if (!routerModule) {
      throw new Error(`Cannot find route module "${router}"`);
    }

    app.use(route, routerModule);
  });

  app.get('/', function (req, res) {
    res.send('Choose Reviewers Bot');
  });

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      const address = server.address();
      logger.info('Server listening at %s:%s', address.address, address.port);

      server.shutdown = (callback) => server.close(callback);

      resolve(server);
    });
  });

}
