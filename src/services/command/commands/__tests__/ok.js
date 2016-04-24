import service from '../ok';

import teamMock from '../../../team-dispatcher/__mocks__/team';
import teamDispatcherMock from '../../../team-dispatcher/__mocks__/dispatcher';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { reviewersMock } from '../../__mocks__/index';
import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';

describe('services/command/ok', function () {

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
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Hulk' } };

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

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if author tried to `ok` to himself', function (done) {
    comment.user.login = 'Black Widow';

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /himself/))
      .then(done, done);
  });

  it('should return rejected promise if there is no such user in team', function (done) {
    comment.user.login = 'Spider-Man';

    team.findTeamMember
      .withArgs(pullRequest, 'Spider-Man')
      .returns(Promise.resolve(null));

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /no user/i))
      .then(done, done);
  });

  it('should add a new reviewer to pull request', function (done) {
    comment.user.login = 'Spider-Man';

    team.findTeamMember
      .withArgs(pullRequest, 'Spider-Man')
      .returns(Promise.resolve({ login: 'Spider-Man' }));

    command('/ok', payload)
      .then(pullRequest => {
        assert.calledWith(
          pullRequestReview.updateReviewers,
          sinon.match.object,
          sinon.match(reviewers => {
            assert.sameDeepMembers(
              reviewers,
              [
                { login: 'Hulk' },
                { login: 'Thor' },
                { login: 'Spider-Man' }
              ]
            );

            return true;
          })
        );
      })
      .then(done, done);
  });

  it('should emit review:command:ok event', function (done) {
    command('/ok', payload)
      .then(pullRequest => assert.calledWith(events.emit, 'review:command:ok'))
      .then(done, done);
  });
});
