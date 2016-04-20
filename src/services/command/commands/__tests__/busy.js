import service from '../busy';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';
import teamMock from '../../../team/__mocks__/team';
import teamDispatcherMock from '../../../team/__mocks__/dispatcher';

describe.skip('services/command/busy', () => {

  describe('#command', () => {
    let command;
    let action, events, logger, team, _team, review;
    let options, imports, comment, payload, pullRequest, reviewResult;

    const promise = (x) => Promise.resolve(x);

    beforeEach(() => {

      team = teamDispatcherMock();
      _team = teamMock();
      team.findTeamByPullRequest.returns(_team);
      _team.findTeamMember.returns(promise({ login: 'Hawkeye' }));

      events = eventsMock();
      logger = loggerMock();

      reviewResult = {
        team: [{ login: 'Thor' }]
      };

      review = {
        review: sinon.stub().returns(promise(reviewResult))
      };

      action = pullRequestReviewMock(pullRequest);

      comment = {
        user: {
          login: 'Hulk'
        }
      };

      pullRequest = pullRequestMock();
      pullRequest.id = 42;
      pullRequest.state = 'open';
      pullRequest.review = {};
      pullRequest.review.reviewers = [{ login: 'Hulk' }, { login: 'Spider-Man' }];

      options = {};
      imports = { team, action, logger, events, review };

      payload = { pullRequest, comment };
      command = service(options, imports);

    });

    it('should emit `review:command:busy` event', function (done) {
      command('/busy', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:busy');

        done();
      }, done);
    });

    it('should save pullRequest with new reviewer', function (done) {
      command('/busy', payload)
        .then(() => {
          assert.calledWithMatch(action.updateReviewers, sinon.match(function (reviewers) {

            assert.sameDeepMembers(
              reviewers,
              [{ login: 'Thor' }, { login: 'Spider-Man' }]
            );

            return true;

          }));

          done();
        })
        .catch(done);
    });

    it('should be rejected if author not in reviewers list', function (done) {
      payload.comment.user.login = 'Thor';

      pullRequest.review.reviewers = [
        { login: 'Hulk' },
        { login: 'Spider-Man' }
      ];

      command('/busy', payload)
        .catch(() => done());
    });

    it('should be rejected if pull is closed', function (done) {
      pullRequest.state = 'closed';

      command('/busy', payload)
        .catch(() => done());
    });

  });

});
