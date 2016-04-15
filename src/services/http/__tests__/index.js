import path from 'path';
import request from 'supertest';
import service from '../../http';
import indexRoute from '../routes/index';
import staticRoute from '../routes/static';
import loggerMock from '../../logger/__mocks__/index';

describe('services/http', function () {

  let options, imports;

  beforeEach(function () {

    options = {
      port: 8080,
      routes: {
        '/': 'index',
        '/public': 'bundle'
      }
    };

    const localAssets = path.resolve(__dirname, './assets');

    imports = {
      index: indexRoute({ assets: localAssets }, {}),
      bundle: staticRoute({ assets: localAssets }, {}),
      logger: loggerMock()
    };

  });

  it('should setup http-server', function (done) {

    options.routes = {};

    service(options, imports)
      .then(app => {
        request(app)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect('Choose Reviewers Bot')
          .expect(200)
          .end(err => {
            app.shutdown(() => done(err));
          });
      });

  });

  it('should serve index.html', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect('Content-Length', '96')
          .expect(200)
          .end(err => {
            app.shutdown(() => done(err));
          });
      })
      .catch(done);

  });

  it('should serve static from /public', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/public/1.txt')
          .expect('1.txt\n')
          .end(err => {
            app.shutdown(() => done(err));
          });
      })
      .catch(done);

  });

  it('should return 404 if file not found in /public', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/public/file-not-exists')
          .expect(404)
          .end(err => {
            app.shutdown(() => done(err));
          });
      })
      .catch(done);

  });

});
