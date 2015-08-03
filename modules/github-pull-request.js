'use strict';

export default class GitHubPullRequest {

  /**
   * @constructor
   * @param {Object} model - pull request model
   * @param {Object} github - github module
   * @param {Object} options
   */
  constructor(model, github, options) {
    this.model = model;
    this.github = github;

    this.separator = {
      top: options.separator && options.separator.top ||
        '<span id="devkit-top"></span><hr>',
      bottom: options.separator && options.separator.bottom ||
        '<span id="devkit-bottom"></span>'
    };
  }

  loadPullRequest(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.organization.login,
        repo: local.repository.full_name,
        number: local.number
      };

      this.github.pullRequests.get(req, (error, remote) => {
        error
          ? reject(new Error('Can not receive the pull request from github: ' + error))
          : resolve(remote);
      });
    });
  }

  savePullRequest(remote) {
    return new Promise((resolve, reject) => {
      this.model
        .findById(remote.id)
        .then(local => {
          if (!local) {
            return reject(new Error('Pull request `' + remote.id + '` not found'));
          }

          this.model.set(local, remote);
          this.model.save(local, (error) => {
            error
              ? reject(new Error('Can not save the pull request from github: ' + error))
              : resolve(local);
          });
        });
    });
  }

  updatePullRequest(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.org,
        repo: local.repo,
        body: local.body,
        title: local.title,
        number: local.number
      };

      this.github.pullRequests.update(req, error => {
        if (error) {
          reject(new Error('Can not update the pull request description: ' + error));
        }

        resolve(local);
      });
    });
  }

  loadPullRequestFiles(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.organization.login,
        repo: local.repository.name,
        number: local.number,
        per_page: 100
      };

      this.github.pullRequests.getFiles(req, (error, files) => {
        error
          ? reject(new Error('Can not receive files from the pull request: ' + error))
          : resolve(files.map(file => { delete file.patch; return file; }));
      });
    });
  }

  syncPullRequest(local) {
    return this
      .loadPullRequest(local)
      .then(remote => this.savePullRequest(remote));
  }

  setBodySection(id, sectionId, content) {
    return this.model
      .findById(id)
      .then(local => {
        if (!local) {
          return Promise.reject(new Error(
            'Pull request `' + id + '` not found'
          ));
        }
        return this.syncPullRequest(local);
      })
      .then(local => {
        local.section[sectionId] = content;

        this.fillPullRequstBody(local);

        return this.model.save(local);
      })
      .then(this.updatePullRequest.bind(this));
  }

  fillPullRequestBody(local) {
    const allSections = Object.keys(local.section);
    const bodyContent = allSections
      .map(key =>
        '<div>' + local.section[key] + '</div>'
      )
      .join('');
    const bodyContentWithSeparators =
      this.separator.top + bodyContent + this.separator.bottom;

    local.body = this.cleanPullRequestBody(local.body) +
      bodyContentWithSeparators;
  }

  cleanPullRequestBody(body) {
    const start = body.indexOf(this.separator.top);

    if (start !== -1) {
      const before = body.substr(0, start);
      const end = body.indexOf(this.separator.bottom, start + 1);

      if (end !== -1) {
        const after = body.substr(end + this.separator.bottom.length);
        return before.trim() + after.trim();
      }

      return before.trim();
    }

    return body;
  }

}
