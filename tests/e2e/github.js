import _ from 'lodash';
import { withApp } from './common';
import { MONGODB_HOST } from './mongoose';
import pullRequestHook from './data/pull_request_webhook';
import secret from '../../config/secret';

export function withGitHub(test, config, done) {

  config = _.merge({
    services: {
      logger: {
        path: './src/services/logger',
        options: { handlers: {} }
      },
      github: {
        path: './src/services/github',
        options: {
          host: 'api.github.com',
          debug: false,
          version: '3.0.0',
          timeout: 2000,
          protocol: 'https',
          headers: { 'user-agent': 'DevExp-App' }
        },
        dependencies: []
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
              'pull-request-github-addon'
            ]
          }
        },
        dependencies: ['mongoose', 'pull-request-github-addon']
      },
      'pull-request-model': {
        path: './src/services/pull-request-model',
        dependencies: ['model']
      },
      'pull-request-github': {
        path: './src/services/pull-request-github',
        options: {
          separator: {
            top: "<div id='devexp-content-top'></div><hr>",
            bottom: "<div id='devexp-content-bottom'></div>"
          }
        },
        dependencies: ['logger', 'github', 'pull-request-model']
      },
      'pull-request-github-addon': {
        path: './src/services/pull-request-github/addon'
      }
    }
  }, config);

  config.services.github = _.merge(config.services.github, secret.services.github);

  withApp(test, config, done);

}

export function withPullRequestGitHub(test, config, done) {

  withGitHub(imports => {
    const PullRequestModel = imports['pull-request-model'];

    const pullRequest = new PullRequestModel();
    pullRequestHook.pull_request.repository = pullRequestHook.repository;

    return PullRequestModel
      .remove({})
      .then(() => {
        pullRequest.set(pullRequestHook.pull_request);
        imports.pullRequest = pullRequest;

        return pullRequest.save();
      })
      .then(() => test(imports));
  }, config, done);

}

describe('services/pull-request-github', function () {

  this.timeout(5000);

  let date, time;
  beforeEach(function () {
    date = new Date();
    time = date.getFullYear() + '-' +
      (date.getMonth() + 1) + '-' +
      date.getDate() + ' ' +
      date.getHours() + ':' +
      date.getMinutes() + ':' +
      date.getSeconds() + '.' +
      date.getMilliseconds();
  });

  describe('#loadPullRequestFromGitHub', function () {

    it('should load pull request from github', function (done) {

      withPullRequestGitHub(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .loadPullRequestFromGitHub(pullRequest)
          .then(pullRequestLoaded => {
            assert.isObject(pullRequestLoaded);
          });
      }, {}, done);

    });

  });

  describe('#updatePullRequestOnGitHub', function () {

    it('should update pull request description on github', function (done) {

      withPullRequestGitHub(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        pullRequest.body = time;
        return pullRequestGitHub
          .updatePullRequestOnGitHub(pullRequest)
          .then(pullRequestSaved => {
            return pullRequestGitHub.loadPullRequestFromGitHub(pullRequest);
          })
          .then(pullRequestLoaded => {
            assert.equal(pullRequestLoaded.body, time);
          });
      }, {}, done);

    });

  });

  describe('#loadPullRequestFiles', function () {

    it('should load files from github and set them to pull request', function (done) {

      withPullRequestGitHub(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .loadPullRequestFiles(pullRequest)
          .then(files => {
            assert.isArray(files);
            assert.isAbove(files.length, 0);
            assert.property(files[0], 'filename');
            assert.property(files[0], 'status');
            assert.property(files[0], 'changes');
            assert.property(files[0], 'additions');
            assert.property(files[0], 'deletions');
          });
      }, {}, done);

    });

  });

  describe('#savePullRequestToDatabase', function () {

    it('should save pull request to mongodb', function (done) {

      withPullRequestGitHub(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestModel = imports['pull-request-model'];
        const pullRequestGitHub = imports['pull-request-github'];

        pullRequest.body = time;

        return pullRequestGitHub
          .savePullRequestToDatabase(pullRequest)
          .then(pullRequestSaved => {
            return pullRequestModel.findById(pullRequestSaved.id);
          })
          .then(pullRequestLoaded => {
            assert.equal(pullRequestLoaded.body, time);
          });
      }, {}, done);

    });

  });

  describe('#setBodySection', function () {

    it('should update body section, save it and then update pull request on github', function (done) {

      withPullRequestGitHub(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .setBodySection(pullRequest, 'time', time)
          .then(pullRequestSaved => {
            return pullRequestGitHub.loadPullRequestFromGitHub(pullRequest);
          })
          .then(pullRequestLoaded => {
            assert.include(pullRequestLoaded.body, time);
          });
      }, {}, done);

    });

  });

});
