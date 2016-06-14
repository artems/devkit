import service from '../';
import express from 'express';
import request from 'supertest';
import httpMock from '../../../services/http/__mocks__/';
import responseJSON from '../../../services/http/response';

describe('plugins/badges-http', function () {

  let app, http, options, imports;

  beforeEach(function () {
    app = express();

    http = httpMock();

    options = {};
    imports = { http };

    http.addRoute = function (path, router) {
      app.use(path, router);
    };

    app.use(responseJSON());

    service(options, imports);
  });

  it('should response `ok` on `/badges`', function (done) {
    request(app)
      .get('/badges')
      .expect('Content-Type', /text\/html/)
      .expect('ok')
      .expect(200)
      .end(done);
  });

  it('should response with svg image', function (done) {
    request(app)
      .get('/badges/user-text-red.svg')
      .expect('Content-Type', /image\/svg\+xml/)
      .expect(200)
      .end(done);
  });

});
