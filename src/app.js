/* eslint-disable no-console, no-process-exit */

import path from 'path';
import Architect from 'node-architect';
import parseConfig from './modules/config/index';

const basePath = path.join(__dirname, '..');
const appConfig = parseConfig(basePath);
const application = new Architect(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application
  .execute()
  .then(resolved => {
    resolved.logger.info('Application fully started');
  })
  .catch(error => {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });

process.on('SIGINT', () => {
  application
    .shutdown()
    .then(() => {
      console.log('');
    })
    .catch(error => {
      console.error(error.stack ? error.stack : error);
      process.exit(1);
    });
});
