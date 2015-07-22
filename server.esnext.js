'use strict';

import Application from './modules/application';

import http from './services/http';
import logger from './services/logger';

const appConfig = {
  services: {
    logger: {
      module: logger,
      options: {
        transports: [
          { name: 'console', timestamp: true, colorize: true },
          { name: 'file', filename: 'main.log' }
        ]
      }
    },
    http: {
      module: http,
      options: {
        port: process.env.PORT
      },
      dependencies: [
        'logger'
      ]
    }
  }
};

const app = new Application(appConfig);
app.execute()
  .catch(function (error) {
    console.error(error); // eslint-disable-line no-console
  });
