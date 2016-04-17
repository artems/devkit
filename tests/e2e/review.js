import _ from 'lodash';
import { withApp } from './common';
import { MONGODB_HOST } from './mongoose';
import pullRequestHook from './data/pull_request_webhook';

export function withPullRequestReview(test, config, done) {

  config = _.merge({
    services: {
      events: {
        path: './src/services/events'
      },
      logger: {
        path: './src/services/logger',
        options: { handlers: {} }
      },
      mongoose: {
        path: './src/services/mongoose',
        options: { host: MONGODB_HOST },
        dependencies: ['logger']
      },
      model: {
        path: './src/services/model',
        options: {
          addons: {
            pull_request: [
              'pull-request-review-addon'
            ]
          }
        },
        dependencies: [
          'mongoose',
          'pull-request-review-addon'
        ]
      },
      team: {
        path: './src/services/team',
        options: {
          routes: [{ 'team-static': ['*/*'] }]
        },
        dependencies: ['team-static']
      },
      'team-static': {
        path: './src/services/team/static',
        options: {
          members: ['foo', 'bar']
        }
      },
      'pull-request-review-addon': {
        path: './src/services/pull-request-review/addon',
        options: { approveCount: 1 },
        dependencies: ['team', 'events', 'logger']
      }
    }
  }, config);

  withApp(imports => {
    const model = imports.model;
    const PullRequestModel = model('pull_request');

    const pullRequest = new PullRequestModel();
    pullRequestHook.pull_request.repository = pullRequestHook.repository;

    return PullRequestModel
      .remove({})
      .then(() => {
        pullRequest.set(pullRequestHook.pull_request);
        pullRequest.set('review.reviewers', [{ login: 'foo' }]);
        return pullRequest.save();
      })
      .then(() => {
        imports.pullRequest = pullRequest;
        imports.PullRequestModel = PullRequestModel;
        return imports;
      })
      .then(test);
  }, config, done);

}

describe('services/pull-request-review', function () {

  const afterSaveAndLoad = function (PullRequestModel, test) {
    return function (pullRequest) {
      return pullRequest
          .save()
          .then(() => PullRequestModel.findById(pullRequest.id))
          .then(test);
    };
  };

  describe('#startReview', function () {

    it('should change status of pull request to "inprogress"', function (done) {
      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;
        pullRequest.set('review.status', 'notstarted');

        return pullRequest.startReview()
          .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
            assert.equal(pullRequestLoaded.get('review.status'), 'inprogress');
          }));
      }, {}, done);
    });

  });

  describe('#stopReview', function () {

    it('should change status of pull request to "notstarted"', function (done) {
      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;
        pullRequest.set('review.status', 'inprogress');

        return pullRequest.stopReview()
          .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
            assert.equal(pullRequestLoaded.get('review.status'), 'notstarted');
          }));
      }, {}, done);
    });

  });

  describe('#approveReview', function () {

    it('should change status of pull request to "complete"', function (done) {
      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;
        pullRequest.set('review.status', 'inprogress');

        return pullRequest.approveReview('foo')
          .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
            assert.equal(pullRequestLoaded.get('review.status'), 'complete');
          }));
      }, {}, done);
    });

  });

  describe('#updateReviewers', function () {

    it('should change reviewers of pull request', function (done) {
      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;
        pullRequest.set('review.status', 'notstarted');

        return pullRequest.updateReviewers([{ login: 'bar' }])
          .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
            assert.deepEqual(pullRequestLoaded.get('review.reviewers'), [{ login: 'bar' }]);
          }));
      }, {}, done);

    });

  });

});
