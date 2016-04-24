import service from '../start';

import teamMock from '../../../team-dispatcher/__mocks__/team';
import teamDispatcherMock from '../../../team-dispatcher/__mocks__/dispatcher';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { reviewersMock } from '../../__mocks__/index';
import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';

describe('services/command/start', function () {

  let team, events, logger, teamDispatcher, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamMock();
    team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamDispatcher = teamDispatcherMock();
    teamDispatcher.findTeamByPullRequest.returns(Promise.resolve(team));

    pullRequest = pullRequestMock();
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.status = 'open';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment };

    options = {};

    imports = {
      events,
      logger,
      'team-dispatcher': teamDispatcher,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports);

  });

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/start', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if triggered by not an author', function (done) {
    comment.user.login = 'Spider-Man';

    command('/start', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/))
      .then(done, done);
  });

  it('should return rejected promise if pull request review is not open', function (done) {
    pullRequest.review.status = 'inprogress';

    command('/start', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /open/))
      .then(done, done);
  });

  it('should emit review:command:start event', function (done) {
    command('/start', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:start'))
      .then(done, done);
  });

});
