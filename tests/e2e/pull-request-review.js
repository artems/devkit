import _ from 'lodash';
import { withPullRequest } from './mongoose';

export function withPullRequestReview(test, config, done) {

  config = _.merge({
    services: {
      model: {
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

      'pull-request-review-addon': {
        path: './src/services/pull-request-review/addon'
      }
    }
  }, config);

  withPullRequest(test, config, done);

}

describe('services/pull-request-review', function () {

  describe('#findByReviewer', function () {

    it('should return pull requests filtered by reviewer', function (done) {

      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;

        pullRequest.set('review', {
          reviewers: [
            { login: 'sbmaxx' },
            { login: 'mishanga' }
          ]
        });

        return pullRequest
        .save()
        .then(() => {
          return PullRequestModel
          .findByReviewer('sbmaxx')
          .then(result => {
            assert.isArray(result);
            assert.lengthOf(result, 1);
          });
        });
      }, {}, done);

    });

  });

  describe('#findInReview', function () {

    it('should return all opened pull requests', function (done) {

      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;

        pullRequest.set('review', {
          status: 'inprogress',
          reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
        });

        return pullRequest
        .save()
        .then(() => {
          return PullRequestModel
          .findInReview()
          .then(result => {
            assert.isArray(result);
            assert.lengthOf(result, 1);
          });
        });
      }, {}, done);

    });

  });

  describe('#findInReviewByReviewer', function () {

    it('should return opened pull requests filtered by reviewer', function (done) {

      withPullRequestReview(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;

        pullRequest.set('review', {
          status: 'inprogress',
          reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
        });

        return pullRequest
        .save()
        .then(() => {
          return PullRequestModel
          .findInReviewByReviewer('sbmaxx')
          .then(result => {
            assert.isArray(result);
            assert.lengthOf(result, 1);
          });
        });
      }, {}, done);

    });

  });

});
