import _ from 'lodash';
import { withApp } from './common';
import pullRequestHook from './data/pull_request_webhook';

const MONGODB_HOST = 'mongodb://localhost/devexp_test';

export function withModel(test, config, done) {

  config = _.merge({
    services: {
      logger: {
        path: './src/services/logger',
        options: { transports: [] }
      },
      mongoose: {
        path: './src/services/mongoose',
        options: { host: MONGODB_HOST },
        dependencies: ['logger']
      },
      model: {
        path: './src/services/model',
        dependencies: ['logger', 'mongoose']
      }
    }
  }, config);

  withApp(test, config, done);

}

export function withUser(test, config, done) {

  withModel(imports => {
    const model = imports.model;
    const UserModel = model('user');

    const user = new UserModel();

    return UserModel
      .remove({})
      .then(() => {
        user.set({
          login: 'd4rkr00t',
          html_url: 'https://github.com/d4rkr00t',
          avatar_url: 'https://avatars.githubusercontent.com/u/11798476?v=3'
        });

        return user.save();
      })
      .then(() => {
        imports.user = user;
        imports.UserModel = UserModel;

        return imports;
      })
      .then(test);
  }, config, done);

}

export function withPullRequest(test, config, done) {

  withModel(imports => {
    const model = imports.model;
    const PullRequestModel = model('pull_request');

    const pullRequest = new PullRequestModel();
    pullRequestHook.pull_request.repository = pullRequestHook.repository;

    return PullRequestModel
      .remove({})
      .then(() => {
        pullRequest.set(pullRequestHook.pull_request);

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

describe('services/model', function () {

  it('should apply save hooks and extenderes', function (done) {

    const addon = function (options, imports) {
      return {
        extender: function () {
          return {
            newProperty: { type: Number, 'default': 0 }
          };
        },
        saveHook: function (model) {
          return new Promise((resolve) => {
            model.newProperty = 1;
            resolve();
          });
        }
      };
    };

    const config = {
      services: {
        model: {
          options: {
            addons: { user: ['simple-addon'] }
          },
          dependencies: ['logger', 'mongoose', 'simple-addon']
        },
        'simple-addon': { module: addon }
      }
    };

    withUser(imports => {
      const user = imports.user;
      assert.equal(user.newProperty, 1);
    }, config, done);

  });

  describe('services/model/items/user', function () {

    it('should setup user', function (done) {

      withUser(imports => {
        const user = imports.user;

        assert.equal(user._id, user.login);
      }, {}, done);

    });

    describe('#findByLogin', function () {

      it('should return user filtered by login', function (done) {

        withUser(imports => {
          const UserModel = imports.UserModel;

          return Promise.resolve()
            .then(() => UserModel.findByLogin('d4rkr00t'))
            .then(result => assert.equal(result.login, 'd4rkr00t'));
        }, {}, done);

      });

      it('should return null if user was not found', function (done) {

        withUser(imports => {
          const UserModel = imports.UserModel;

          return Promise.resolve()
            .then(() => UserModel.findByLogin('sbmaxx'))
            .then(result => assert.isNull(result));
        }, {}, done);

      });

    });

  });

  describe('services/model/items/pull_request', function () {

    it('should setup pull request', function (done) {

      withPullRequest(imports => {
        const pullRequest = imports.pullRequest;
        assert.equal(pullRequest.id, pullRequest._id);
      }, {}, done);

    });

    describe('#owner', function () {

      it('should return pullRequest repository owner', function (done) {

        withPullRequest(imports => {
          const pullRequest = imports.pullRequest;
          assert.equal(pullRequest.owner, 'devexp-org');
        }, {}, done);

      });

      it('should return an empty string if pullRequest broken', function (done) {

        withPullRequest(imports => {
          const pullRequest = imports.pullRequest;
          pullRequest.set('repository', {});
          assert.equal(pullRequest.owner, '');
        }, {}, done);

      });

    });

    describe('#toString', function () {

      it('should return text representation of pull request', function (done) {

        withPullRequest(imports => {
          const result = '[40503811 – Custom error] https://github.com/devexp-org/devexp/pull/49';
          const pullRequest = imports.pullRequest;

          assert.equal(pullRequest.toString(), result);
        }, {}, done);

      });

    });

    describe('#findByUser', function () {

      it('should return pull requests filtered by user', function (done) {

        withPullRequest(imports => {
          const PullRequestModel = imports.PullRequestModel;

          return Promise.resolve()
            .then(() => PullRequestModel.findByUser('d4rkr00t'))
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
              assert.equal(result[0].id, 40503811);
            });
        }, {}, done);

      });

      it('should return an empty array if pulls were not found', function (done) {

        withPullRequest(imports => {
          const PullRequestModel = imports.PullRequestModel;

          return Promise.resolve()
            .then(() => PullRequestModel.findByUser('sbmaxx'))
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 0);
            });
        }, {}, done);

      });

    });

    describe('#findByReviewer', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withPullRequest(imports => {
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

    describe('#findByNumberAndRepository', function () {

      it('should return pull requests filtered by number', function (done) {

        withPullRequest(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          return PullRequestModel
            .findByRepositoryAndNumber('devexp-org/devexp', 49)
            .then(result => {
              assert.equal(result.id, pullRequest.id);
            });
        }, {}, done);

      });

    });

    describe('#findInReview', function () {

      it('should return all opened pull requests', function (done) {

        withPullRequest(imports => {
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

        withPullRequest(imports => {
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

});
