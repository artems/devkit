import express from 'express';
import request from 'supertest';
import service from '../index';
import responseJSON from '../../../services/http/response';

describe('services/badges', function () {

  let options, imports, app, router;

  beforeEach(function () {
    app = express();

    options = {};
    imports = {};

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use('/badges', router);
  });

  it('should response `ok` on `/badges`', function (done) {
    request(app)
      .get('/badges/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('ok')
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
