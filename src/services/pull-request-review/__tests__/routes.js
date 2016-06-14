import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';

import httpMock from '../../http/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/pull-request/__mocks__/';

describe('services/pull-request-review/routes', function () {

  let app, options, imports;
  let http, logger, pullRequest, pullRequestModel;

  beforeEach(function () {
    app = express();

    http = httpMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestModel = pullRequestModelMock();

    options = {};
    imports = {
      http,
      logger,
      'pull-request-model': pullRequestModel
    };

    http.addRoute = function (path, router) {
      app.use(path, router);
    };

    app.use(responseJSON());

    service(options, imports);
  });

  describe('/:id', function () {

    it('should return pull request', function (done) {
      pullRequestModel.findById
        .withArgs('1')
        .returns(Promise.resolve(pullRequest));

      request(app)
        .get('/pull/1')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(/"id":1/)
        .end(done);
    });

  });

  describe('/pulls-by/:username', function () {

    it('should return pull request by user', function (done) {
      pullRequestModel.findByUser
        .withArgs('foo')
        .returns(Promise.resolve([pullRequest]));

      request(app)
        .get('/pull/pulls-by/foo')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(/"id":1/)
        .end(done);
    });

  });

  describe('/reviews-by/:username', function () {

    it('should return reviews by user', function (done) {
      pullRequestModel.findByReviewer
        .withArgs('foo')
        .returns(Promise.resolve([pullRequest]));

      request(app)
        .get('/pull/reviews-by/foo')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect(/"id":1/)
        .end(done);
    });

  });

  it('should return error when error', function (done) {

    pullRequestModel.findById
      .withArgs('1')
      .returns(Promise.reject(new Error('just error')));

    request(app)
      .get('/pull/1')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect('{"error":"just error"}')
      .end(done);
  });

});
