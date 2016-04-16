import service from '../index';

import teamMock from '../../team/__mocks__/dispatcher';
import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import { pullRequestMock, pullRequestModelMock } from '../../model/collections/__mocks__/pull-request';

describe('services/pull-request-action', function () {

  let options, imports;
  let team, logger, events, PullRequestModel;

  const promise = (x) => Promise.resolve(x);

  beforeEach(function () {
    options = {};

    team = teamMock();
    logger = loggerMock();
    events = eventsMock();
    PullRequestModel = pullRequestModelMock();

    imports = { team: team, events, logger, 'pull-request-model': PullRequestModel };

  });

  it('should be resolved to PullRequestAction', function () {

    const action = service(options, imports);

    assert.property(action, 'stopReview');
    assert.property(action, 'startReview');
    assert.property(action, 'approveReview');
    assert.property(action, 'updateReviewers');

  });

  describe('#approveReview', function () {

    let pullRequest;

    beforeEach(function () {
      options = { approveCount: 2 };

      pullRequest = pullRequestMock();

      PullRequestModel.findById.withArgs(42).returns(promise(pullRequest));
    });

    it('should emit event `review:approved`', function (done) {
      const review = {
        reviewers: [{ login: 'foo' }, { login: 'bar' }]
      };
      pullRequest.review = review;

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .then(() => {
          assert.called(pullRequest.save);
          assert.calledWith(pullRequest.set, 'review', sinon.match({
            reviewers: [{ login: 'foo', approved: true }, { login: 'bar' }]
          }));

          assert.calledWith(pullRequest.set, 'review', sinon.match.has('updated_at'));

          assert.calledWith(events.emit, 'review:approved');

          done();
        })
        .catch(done);

    });

    it('should emit event `review:complete` when review completed', function (done) {
      const review = {
        status: 'complete',
        reviewers: [{ login: 'foo' }, { login: 'bar', approved: true }]
      };

      pullRequest.review = review;

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .then(() => {
          assert.calledWith(events.emit, 'review:approved');
          assert.calledWith(events.emit, 'review:complete');

          assert.calledWith(pullRequest.set, 'review', sinon.match.has('status', 'complete'));
          assert.calledWith(pullRequest.set, 'review', sinon.match.has('completed_at'));

          done();
        })
        .catch(done);

    });

    it('should fail if pull request is not found', function (done) {
      PullRequestModel.findById.withArgs(42).returns(promise(null));

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .catch(e => {
          assert.match(e.message, /not found/);
          done();
        })
        .catch(done);
    });

  });

});
