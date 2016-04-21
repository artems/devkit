import { cloneDeep } from 'lodash';

import service from '../not_ok';
import teamMock from '../../../team-dispatcher/__mocks__/dispatcher';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { mockReviewers } from '../../__mocks__/index';
import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';


describe.skip('services/command/not_ok', () => {

  describe('#command', () => {
    let command;
    let action, events, logger, team, review;
    let options, imports, comment, payload, pullRequest, reviewResult;

    const promise = (x) => Promise.resolve(x);

    beforeEach(() => {

      team = teamMock();
      team.findTeamMemberByPullRequest.returns(promise({ login: 'Hawkeye' }));

      events = eventsMock();
      logger = loggerMock();

      reviewResult = {
        team: [{ login: 'Thor' }]
      };

      review = {
        review: sinon.stub().returns(promise(reviewResult))
      };

      comment = {
        user: {
          login: 'Hulk'
        }
      };

      pullRequest = pullRequestMock();
      pullRequest.id = 42;
      pullRequest.state = 'open';
      pullRequest.review = {
        status: 'notstarted',
        reviewers: cloneDeep(mockReviewers)
      };
      pullRequest.get.withArgs('review.reviewers').returns(cloneDeep(mockReviewers));

      action = pullRequestReviewMock(pullRequest);

      options = {};
      imports = { team, action, logger, events, review };

      payload = { pullRequest, comment };
      command = service(options, imports);

    });

    it('should emit `review:command:not_ok` event', function (done) {
      command('/not_ok', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:not_ok');

        done();
      }, done);
    });

    it('should change status from `complete` to `notstarted`', function (done) {
      pullRequest.review.status = 'complete';

      command('/not_ok', payload)
        .then(() => {
          assert.called(action.stopReview);

          done();
        })
        .catch(done);
    });

    it('should be rejected if author not in reviewers list', function (done) {
      payload.comment.user.login = 'Spider-Man';

      pullRequest.review.reviewers = [
        { login: 'Hulk' },
        { login: 'Thor' }
      ];

      command('/not_ok', payload)
        .catch(() => done());
    });

  });

});
