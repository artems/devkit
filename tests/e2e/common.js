import _ from 'lodash';
import path from 'path';

import Architect from 'node-architect';
import pullRequestHook from './data/pull_request_webhook';

const MONGODB_HOST = 'mongodb://localhost/devexp_test';

export function withApp(test, config, done) {
  const application = new Architect(config, path.resolve('.'));

  application
    .execute()
    .then(test)
    .then(::application.shutdown)
    .then(done)
    .catch(done);
}

export function withModel(test, config, done) {

  config = _.merge({
    services: {
      events: { path: './src/services/events' },
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
