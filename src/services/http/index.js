import express from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import enableDestroy from 'server-destroy';
import responseJSON from './response';

export default function setup(options, imports) {

  const app = express();
  const port = options.port || 0; // if the port is `0` then a random port is used
  const events = imports.events;
  const logger = imports.logger.getLogger('http');

  app.use(bodyParser.json());
  app.use(responseTime());
  app.use(responseJSON());

  const http = {

    server: null,

    addRoute(path, router) {
      app.use(path, router);
    },

    listen() {

      app.get('/', function (req, res) {
        res.send('Review Service');
      });

      return new Promise(resolve => {
        http.server = app.listen(port, () => {
          enableDestroy(http.server);

          const address = http.server.address();
          logger.info('Listening at %s:%s', address.address, address.port);

          resolve(http.server);
        });
      });
    },

    shutdown(callback) {
      logger.info('Shutdown start');
      http.server.destroy(() => {
        logger.info('Shutdown finish');
        callback();
      });
    }

  };

  events.on('app:start', () => {
    http.listen()
      .catch(logger.error.bind(logger));
  });

  return http;

}
