import path from 'path';
import Application from '../../modules/application';
import projectConfig from '../../modules/config';

describe('model', function () {
  const basePath = path.resolve('.');
  const appConfig = projectConfig(basePath, 'testing');

  let application;

  beforeEach(function () {
    appConfig.services.model = appConfig.service_examples.model;
    appConfig.services.logger = appConfig.service_examples.logger;
    appConfig.services.mongoose = appConfig.service_examples.mongoose;

    application = new Application(appConfig, basePath);
  });

  it('should properly works with pre-save hooks and extenderes', function (done) {
    application
      .execute()
      .then(::application.shutdown)
      .then(done)
      .catch(done);
  });

});



