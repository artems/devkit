import path from 'path';
import request from 'supertest';

import service from '../';
import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import indexRoute from '../routes/index';
import staticRoute from '../routes/static';

describe('services/http', function () {

  let options, imports, logger, events, localAssets;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    options = {};
    imports = { events, logger };

    localAssets = path.resolve(__dirname, './assets');

  });

  it('should setup http-server', function (done) {

    options.routes = {};

    const http = service(options, imports);

    http.listen()
      .then(app => {
        request(app)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect('Review Service')
          .expect(200)
          .end(err => http.shutdown(() => done(err)));
      });

  });

  it('should serve index.html', function (done) {

    const http = service(options, imports);

    http.addRoute('/', indexRoute({ assets: localAssets }, {}));

    http.listen()
      .then(app => {
        request(app)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect('Content-Length', '96')
          .expect(200)
          .end(err => http.shutdown(() => done(err)));
      })
      .catch(done);

  });

  it('should serve static from /public', function (done) {

    const http = service(options, imports);

    http.addRoute('/public', staticRoute({ assets: localAssets }, {}));

    http.listen()
      .then(app => {
        request(app)
          .get('/public/1.txt')
          .expect('1.txt\n')
          .end(err => http.shutdown(() => done(err)));
      })
      .catch(done);

  });

  it('should return status 404 if the file is not found in /public', function (done) {

    const http = service(options, imports);

    http.addRoute('/public', staticRoute({ assets: localAssets }, {}));

    http.listen()
      .then(app => {
        request(app)
          .get('/public/file-does-not-exist')
          .expect(404)
          .end(err => http.shutdown(() => done(err)));
      })
      .catch(done);

  });

  it('should start listening after the application starts', function () {
    const http = service(options, imports);

    sinon.stub(http, 'listen').returns(Promise.resolve());

    events.on.withArgs('app:start').callArg(1);
    assert.called(http.listen);
  });
});
