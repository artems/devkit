import PullRequestReview from '../class';

import teamMock from '../../team/__mocks__/dispatcher';
import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import { pullRequestMock } from '../../model/collections/__mocks__/pull-request';

describe('services/pull-request-review', function () {

  describe('PullRequestReview', function () {
    let pullRequest, pullRequestReview, review;
    let team, logger, events;
    let options, imports;

    beforeEach(function () {
      team = teamMock();
      logger = loggerMock();
      events = eventsMock();

      pullRequest = pullRequestMock();

      options = { approveCount: 2 };
      imports = { team: team, events, logger };

      pullRequestReview = new PullRequestReview(options, imports);

      review = {
        status: 'notstarted',
        reviewers: [{ login: 'foo' }, { login: 'bar' }]
      };

      pullRequest.review = review;

    });

    describe('#startReview', function () {

      it('should emit event `review:started`', function (done) {
        review.status = 'notstarted';

        pullRequestReview.startReview(pullRequest)
          .then(() => {
            assert.calledWith(events.emit, 'review:started');
            done();
          })
          .catch(done);
      });

      it('should set status to "inprogress"', function (done) {
        review.status = 'notstarted';

        pullRequestReview.startReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match({ status: 'inprogress' }));
            done();
          })
          .catch(done);
      });

      it('should update property "updated_at"', function (done) {
        review.status = 'notstarted';

        pullRequestReview.startReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match.has('updated_at'));
            done();
          })
          .catch(done);
      });

      it('should set property "started_at" if the review is starting for the first time', function (done) {
        review.status = 'notstarted';

        pullRequestReview.startReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match.has('started_at'));
            done();
          })
          .catch(done);
      });

      it('should not update the property "started_at" if that property already exists', function (done) {
        const sometime = new Date();

        review.status = 'notstarted';
        review.started_at = sometime;

        pullRequestReview.startReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match.has('started_at', sometime));
            done();
          })
          .catch(done);
      });

      it('should reject a promise if pull request status is not "notstarted"', function (done) {
        review.status = 'inprogress';

        pullRequestReview.startReview(pullRequest)
          .catch(e => { assert.match(e.message, /is not opened/); done(); })
          .catch(done);
      });

      it('should reject promise if reviewers were not selected', function (done) {
        review.reviewers = [];

        pullRequestReview.startReview(pullRequest)
          .catch(e => { assert.match(e.message, /not selected/); done(); })
          .catch(done);
      });

    });

    describe('#stopReview', function () {

      it('should emit event `review:updated`', function (done) {
        review.status = 'inprogress';

        pullRequestReview.stopReview(pullRequest)
          .then(() => {
            assert.calledWith(events.emit, 'review:updated');
            done();
          })
          .catch(done);
      });

      it('should set status to "notstarted"', function (done) {
        review.status = 'inprogress';

        pullRequestReview.stopReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match({ status: 'notstarted' }));
            done();
          })
          .catch(done);
      });

      it('should update property "updated_at"', function (done) {
        review.status = 'inprogress';

        pullRequestReview.stopReview(pullRequest)
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match.has('updated_at'));
            done();
          })
          .catch(done);
      });

      it('should not reject promise when pull request status is not "inprogress"', function (done) {
        review.status = 'notstarted';

        pullRequestReview.stopReview(pullRequest)
          .then(() => done())
          .catch(done);
      });

      it('should reject promise if pull request status is not "notstarted"', function (done) {
        review.status = 'inprogress';

        pullRequestReview.startReview(pullRequest)
          .catch(e => { assert.match(e.message, /is not opened/); done(); })
          .catch(done);
      });

      it('should reject promise if reviewers were not selected', function (done) {
        review.status = 'notstarted';
        review.reviewers = [];

        pullRequestReview.startReview(pullRequest)
          .catch(e => { assert.match(e.message, /not selected/); done(); })
          .catch(done);
      });

    });

    describe('#approveReview', function () {

      it('should emit event `review:approved`', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => {
            assert.calledWith(events.emit, 'review:approved');
            done();
          })
          .catch(done);
      });

      it('should change reviewer status to "approved"', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match({
              reviewers: [{ login: 'foo', approved: true }, { login: 'bar' }]
            }));
            done();
          })
          .catch(done);
      });

      it('should update property "updated_at"', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => {
            assert.calledWith(pullRequest.set, 'review', sinon.match.has('updated_at'));
            done();
          })
          .catch(done);
      });

      describe('when review is complete', function () {

        beforeEach(function () {
          review.status = 'inprogress';
          review.reviewers = [{ login: 'foo' }, { login: 'bar', approved: true }];
        });

        it('should emit events `review:approve` and `review:complete`', function (done) {
          pullRequestReview.approveReview(pullRequest, 'foo')
            .then(() => {
              assert.calledWith(events.emit, 'review:approved');
              assert.calledWith(events.emit, 'review:complete');
              done();
            })
            .catch(done);
        });

        it('should set status to "complete"', function (done) {
          pullRequestReview.approveReview(pullRequest, 'foo')
            .then(() => {
              assert.calledWith(pullRequest.set, 'review', sinon.match.has('status', 'complete'));
              done();
            })
            .catch(done);
        });

        it('should set property "complete_at"', function (done) {
          pullRequestReview.approveReview(pullRequest, 'foo')
            .then(() => {
              assert.calledWith(pullRequest.set, 'review', sinon.match.has('completed_at'));
              done();
            })
            .catch(done);
        });
      });

    });

    describe('#updateReviewers', function () {

      it('should emit event `review:updated`', function (done) {
        pullRequestReview.updateReviewers(pullRequest, [{ login: 'baz' }])
          .then(() => {
            assert.calledWith(events.emit, 'review:updated');
            done();
          })
          .catch(done);
      });

      it('should update reviewers in pull request', function (done) {
        pullRequestReview.updateReviewers(pullRequest, [{ login: 'baz' }])
          .then(() => {
            assert.calledWith(pullRequest.set, 'review.reviewers', [{ login: 'baz' }]);
            done();
          })
          .catch(done);
      });

      it('should update property "updated_at"', function (done) {
        pullRequestReview.updateReviewers(pullRequest, [{ login: 'baz' }])
          .then(() => {
            assert.calledWith(pullRequest.set, 'review.updated_at');
            done();
          })
          .catch(done);
      });

      it('should reject promise if all reviewers were dropped', function (done) {
        pullRequestReview.updateReviewers(pullRequest, [])
          .catch(e => { assert.match(e.message, /cannot drop all/i); done(); })
          .catch(done);
      });

    });

  });

});
