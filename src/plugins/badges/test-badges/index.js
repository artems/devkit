import fs from 'fs';
import path from 'path';
import { pluck, flatten, forEach, map, zipObject, isEmpty } from 'lodash';

import TestBadgeBuilder, { TESTS_NOT_EXISTS, TESTS_EXISTS, TESTS_CHANGE } from '../class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('badges');
  const localRepo = imports.localRepo;
  const testFileResolvers = imports['test-file-resolver'];
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new TestBadgeBuilder(options.url);

  const service = {

    /**
     * Returns path for test file
     *
     * @param {String} filename
     * @param {String} project
     *
     * @return {String[]}
     */
    _getTestFilePath: function (filename, project) {
      const org = project.split('/')[0];
      const resolver = testFileResolvers[project] || testFileResolvers[`${org}/*`];

      if (resolver.isPriv(filename)) {
        return resolver.getPriv(filename);
      }

      if (resolver.isGemini(filename)) {
        return resolver.getGemini(filename);
      }

      if (resolver.isClient(filename)) {
        return resolver.getClient(filename);
      }

      // FIXME: не понятно как генерировать путь до e2e-тестов.

      return [];
    },

    /**
     * Check repo existance and clone it if necessary
     *
     * @param {String} project
     *
     * @return {Promise}
     */
    _getRepo: function (project) {
      return new Promise((resolve, reject) => {
        fs.lstat(localRepo.getRepoLocalPath(project), (err) => {
          if (err) {
            return localRepo.clone(project).then(resolve);
          }
          return resolve();
        });
      });
    },

    /**
     * Check file existance in repo
     *
     * @param {String} file
     * @param {String} project
     *
     * @return {Promise}
     */
    _checkTestFile: function (file, project) {
      return new Promise(resolve => {
        fs.lstat(path.join(localRepo.getRepoLocalPath(project), file), (err, stat) => {
          resolve(!err);
        });
      });
    },

    /**
     * Returns array of paths to tests
     *
     * @param {String} files
     * @param {String} project
     *
     * @return {String[]}
     */
    _getTests: function (files, project) {
      return flatten(files.map(file => {
        return this._getTestFilePath(file, project);
      }), this);
    },

    /**
     * Check exist tests
     *
     * @param {String[]} files
     * @param {String} project
     *
     * @return {Promise}
     */
    _checkExistsTests: function (files, project) {
      return new Promise(resolve => {
        this._getRepo(project)
          .then(() => {
            Promise
              .all(
                this._getTests(files, project)
                .map(checkPath => this._checkTestFile(checkPath, project))
              )
              .then(resolve);
          });
      });
    },

    /**
     * Check status for files from current PR
     *
     * @param {String} files
     * @param {String} project
     *
     * @return {Number}
     */
    _getStatus: function (files, project) {
      const tests = files.filter(filename => {
        return (/\.test\.js|\.test-priv\.js|gemini|e2e/).test(filename);
      });

      return new Promise(resolve => {
        if (tests.length) {
          return resolve(TESTS_CHANGE);
        }

        this._checkExistsTests(files, project)
          .then(result => {
            if (result.indexOf(false) === -1) {
              resolve(TESTS_EXISTS);
            } else {
              resolve(TESTS_NOT_EXISTS);
            }
          });
      });
    },

    /**
     * Call method for updating pull request body with test badges.
     *
     * @param {Object} payload
     *
     * @return {Promise}
     */
    updateTestBadges: function (payload) {
      const pr = payload.pullRequest;
      const repoName = pr.repository.full_name;
      const repoLocalPath = localRepo.getRepoLocalPath(repoName);
      const filesRaw = pluck(pr.files, 'filename');
      const files = filesRaw.map(file => {
        return path.join(repoLocalPath, file);
      });

      // TODO: do something with it
      // can be resolved on config refactoring
      const org = repoName.split('/')[0];
      const resolver = testFileResolvers[repoName] || testFileResolvers[`${org}/*`];

      if (!resolver) {
        logger.info(`Can't find resolver for ${repoName}.`);
        return Promise.reject();
      }

      let filesByTestType = {
        priv: [],
        client: [],
        gemini: []
      };

      // group tests by type
      forEach(files, item => {
        if (resolver.isPriv(item)) {
          return filesByTestType.priv.push(item);
        }

        if (resolver.isGemini(item)) {
          return filesByTestType.gemini.push(item);
        }

        if (resolver.isClient(item)) {
          return filesByTestType.client.push(item);
        }
      });

      // remove unnecessary badges
      filesByTestType = Object.keys(filesByTestType).reduce((result, key) => {
        if (!isEmpty(filesByTestType[key])) {
          result[key] = filesByTestType[key];
        }
        return result;
      }, {});

      return Promise.all(map(filesByTestType, item => {
        return this._getStatus(item, repoName)
          .catch(logger.info.bind(this));
      }))
      .then(statuses => {
        const results = zipObject(Object.keys(filesByTestType), statuses);

        return map(results, (status, type) => {
          return builder.buildTestBadge(type, status);
        }).join(' ');
      })
      .then(body => {
        const badgeContent = builder.build(body);
        return queue.dispatch('pull-request#' + pr.id, () => {
          pullRequestGitHub.setBodySection(
            pr, 'test:badge', badgeContent, 75
          );
          return pullRequestGitHub.syncPullRequestWithGitHub(pr);
        });
      })
      .catch(logger.info.bind(logger));
    }
  };

  const update = service.updateTestBadges.bind(service);

  events.on('review:updated', update);
  events.on('review:started', update);
  events.on('review:update_badges', update);
  events.on('github:pull_request:synchronize', update);

  return service;

}
