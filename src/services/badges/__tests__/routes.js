import service from '../routes';
import express from 'express';
import request from 'supertest';
import httpMock from '../../../services/http/__mocks__';
import responseJSON from '../../../services/http/response';

import eventsMock from '../../../services/events/__mocks__/';
import loggerMock from '../../../services/logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../services/model/model-pull-request/__mocks__/';

describe('services/badges', function () {

  let app, options, imports, http, router;
  let events, logger, pullRequest, pullRequestModel;

  beforeEach(function () {

    app = express();

    http = httpMock();
    events = eventsMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestModel = pullRequestModelMock();

    options = {};
    imports = { http, events, logger, 'pull-request-model': pullRequestModel };

    pullRequestModel.findByRepositoryAndNumber
      .withArgs('org/repo', '1')
      .returns(Promise.resolve(pullRequest));

    router = service(options, imports);

    app.use(responseJSON());
    app.use('/', router);

  });

  it('should emit event `review:update_badges` on `/pull/:org/:repo/:number`', function (done) {
    request(app)
      .get('/pull/org/repo/1')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('ok')
      .end(() => {
        assert.calledWith(events.emit, 'review:update_badges');
        done();
      });
  });

  it('should return an error if pull request not found', function (done) {
    pullRequestModel.findByRepositoryAndNumber
      .withArgs('org/repo', '1')
      .returns(Promise.resolve(null));

    request(app)
      .get('/pull/org/repo/1')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect('{"error":"Pull request org/repo#1 is not found"}')
      .end(done);
  });

  it('should log errors', function (done) {
    pullRequestModel.findByRepositoryAndNumber
      .withArgs('org/repo', '1')
      .returns(Promise.reject(new Error('just error')));

    request(app)
      .get('/pull/org/repo/1')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect('{"error":"just error"}')
      .end(done);
  });

});
