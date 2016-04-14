import _ from 'lodash';

export default class PullRequestGitHub {

  /**
   * @constructor
   *
   * @param {Object} github
   * @param {Object} PullRequestModel
   * @param {Object} [options]
   * @param {String} [options.separator.top] - top body separator
   * @param {String} [options.separator.bottom] - bottom body separator
   */
  constructor(github, PullRequestModel, options) {
    this.github = github;
    this.PullRequestModel = PullRequestModel;

    this.separator = {
      top: options.separator && options.separator.top ||
        '<div id="devexp-top"></div><hr>',
      bottom: options.separator && options.separator.bottom ||
        '<div id="devexp-bottom"></div>'
    };
  }

  loadPullRequestFromGitHub(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.owner,
        repo: local.repository.name,
        number: local.number
      };

      this.github.pullRequests.get(req, (err, remote) => {
        if (err) {
          reject(new Error('Cannot receive a pull request from github:\n' + err));
          return;
        }

        resolve(remote);
      });
    });
  }

  savePullRequestToDatabase(remote) {
    return new Promise((resolve, reject) => {
      this.PullRequestModel
        .findById(remote.id)
        .then(local => {
          if (!local) {
            reject(new Error(`Pull request ${remote.id} not found`));
            return;
          }

          local.set(remote);
          local.save(err => {
            if (err) {
              reject(new Error('Cannot save a pull request from github:\n' + err));
              return;
            }

            resolve(local);
          });
        });
    });
  }

  updatePullRequestOnGitHub(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.owner,
        repo: local.repository.name,
        body: local.body,
        title: local.title,
        number: local.number
      };

      this.github.pullRequests.update(req, err => {
        if (err) {
          reject(new Error('Cannot update a pull request:\n' + err));
          return;
        }

        resolve(local);
      });
    });
  }

  loadPullRequestFiles(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.owner,
        repo: local.repository.name,
        number: local.number,
        per_page: 100
      };

      this.github.pullRequests.getFiles(req, (err, files) => {
        if (err) {
          reject(new Error('Cannot receive files from the pull request:\n' + err));
          return;
        }

        resolve(files.map(file => { delete file.patch; return file; }));
      });
    });
  }

  syncPullRequest(local) {
    return this
      .loadPullRequestFromGitHub(local)
      .then(::this.savePullRequestToDatabase);
  }

  setBodySection(id, sectionId, content, position = Infinity) {
    return new Promise((resolve, reject) => {
      this.PullRequestModel
        .findById(id)
        .then(local => {
          if (!local) {
            reject(new Error(`Pull request ${id} not found`));
            return;
          }

          return this.syncPullRequest(local);
        })
        .then(local => {
          const section = _.clone(local.get('section')) || {};
          section[sectionId] = { content, position };
          local.set('section', section);

          this.fillPullRequestBody(local);

          return local.save();
        })
        .then(::this.updatePullRequestOnGitHub)
        .then(resolve, reject);
    });
  }

  fillPullRequestBody(local) {
    const bodyContent = this.buildBodyContent(local.section);

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
        return [before.trim(), after.trim()].filter(Boolean).join('\n');
      }

      return body;
    }

    return body;
  }

  buildBodyContent(section) {
    return _
      .values(section)
      .map(section => {
        return _.isString(section)
          ? { position: Infinity, content: section }
          : section;
      })
      .sort((a, b) => {
        if (a.position > b.position) {
          return 1;
        } else if (a.position < b.position) {
          return -1;
        } else {
          return 0;
        }
      })
      .map(section => '<div>' + section.content + '</div>')
      .join('');
  }

}
