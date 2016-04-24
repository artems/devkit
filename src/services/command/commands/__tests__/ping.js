import service from '../ping';

import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { reviewersMock } from '../../__mocks__/index';
import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';

describe('services/command/ping', function () {

  let events, logger, pullRequest;
  let options, imports, command, comment, payload;

  beforeEach(function () {
    events = eventsMock();
    logger = loggerMock();

    pullRequest = pullRequestMock();
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.reviewers = reviewersMock();

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment };

    options = {};

    imports = { logger, events };

    command = service(options, imports);

  });

  it('should return rejected promise if pull request is closed', function (done) {
    payload.pullRequest.state = 'closed';

    command('/ping', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if triggered by not an author', function (done) {
    comment.user.login = 'Spider-Man';

    command('/ping', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/))
      .then(done, done);
  });

  it('should emit review:command:ping event', function (done) {
    command('/ping', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:ping'))
      .then(done, done);
  });

});
