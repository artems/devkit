'use strict';

import GitHub from 'github';
import assign from 'object-assign';

export default function(options, imports, provide) {

  /**
   * @constructor
   */
  constructor(options) {
    this.api = new GitHub(options);
    this.api.authenticate(options.authenticate);

    this.topSeparator = options['top-separator'];
    this.bottomSeparator = options['bottom-separator'];
    this.replaceRegExp = options['replace-regexp'];

    if (!options.pullRequest) {
      throw new Error('model `pullRequest` is required');
    }

    this.pullRequestModel = options.pullRequest;
  }

  loadPullRequest(pullRequestLocal) {
    return new Promise((resolve, reject) => {
      const req = {
        user: pullRequestLocal.org,
        repo: pullRequestLocal.repo,
        number: pullRequestLocal.number
      };

      this.api.pullRequests.get(req, (error, pullRequestRemote) => {
        error
          ? reject(new Error('Can not receive the pull request from github: ' + error))
          : resolve(pullRequestRemote);
      });
    });
  }

  savePullRequest(pullRequestRemote) {
    return new Promise((resolve, reject) => {
      this.pullRequestModel
        .findById(pullRequestRemote.Id)
        .then(pullRequestLocal => {
          if (!pullRequestLocal) {
            return reject(
              new Error('Pull request `' + pullRequestRemote.Id + '` not found')
            );
          }

          pullRequestLocal = assign(pullRequestLocal, pullRequestRemote);
          this.pullRequestModel.save(pullRequestLocal, (error) => {
            error
              ? reject(new Error('Can not save the pull request from github: ' + error))
              : resolve(pullRequestLocal);
          });
        });
    });
  }

  updatePullRequestLocal(pullRequestLocal) {
    return this
      .loadPullRequest(pullRequestLocal)
      .then(this.savePullRequest.bind(this));
  }

  updatePullRequestRemote(pullRequestLocal) {
    return new Promise((resolve, reject) => {
      const req = {
        user: pullRequestLocal.org,
        repo: pullRequestLocal.repo,
        body: pullRequestLocal.body,
        title: pullRequestLocal.title,
        number: pullRequestLocal.number
      };

      this.api.pullRequests.update(req, error => {
        if (error) {
          reject(new Error('Can not update the pull request description: ' + error));
        }

        resolve(pullRequestLocal);
      });
    });
  }

  loadPullRequestFiles(pullRequestLocal) {
    return new Promise((resolve, reject) => {
      const req = {
        user: pullRequestLocal.org,
        repo: pullRequestLocal.repo,
        number: pullRequestLocal.number,
        per_page: 100
      };

      this.api.pullRequests.getFiles(req, (error, files) => {
        error
          ? reject(new Error('Can not receive files from the pull request: ' + error))
          : resolve(files.map(file => { file.patch = ''; return file; }));
      });
    });
  }

  setBodySection(pullRequestId, sectionId, content) {
    return this.pullRequestModel
      .findById(pullRequestId)
      .then(pullRequestLocal => {
        if (!pullRequestLocal) {
          return Promise.reject(new Error(
            'Pull request `' + pullRequestId + '` not found'
          ));
        }
        return this.updatePullRequestLocal(pullRequestLocal);
      })
      .then(pullRequestLocal => {
        pullRequestLocal.body_section[sectionId] = content;

        pullRequestLocal.body = this.joinBodySections(pullRequestLocal);

        return this.pullRequestModel.save(pullRequestLocal);
      })
      .then(this.updatePullRequestRemote.bind(this));
  }

  joinBodySections(pullRequestLocal) {

    const allSections = Object.keys(pullRequestLocal.body_section);
    const bodyContent = allSections.map(key =>
      '<div>' + pullRequestLocal.body_section[key] + '</div>'
    );

    const bodyExtra = this.topSeparator + content + this.bottomSeparator;
    return pullRequestLocal.body.replace(this.replaceRegExp, '') + bodyExtra;

  }

}
