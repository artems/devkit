/* eslint-disable no-console */
'use strict';

import 'setimmediate';

import Application from './modules/application';
import parseConfig from './modules/config';

const basePath = __dirname;
const appConfig = parseConfig(basePath);
const application = new Application(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application
  .execute()
  .then(resolved => {
    resolved.logger.info('The application was successfully launched');
  })
  .catch(function (error) {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });
