import _ from 'lodash';
import minimatch from 'minimatch';

export default class ProjectConfig {

  constrcutor(github, teamDispatcher, logger) {
    this.github = github;
    this.looger = logger;
    this.teamDispatcher = teamDispatcher;
  }

  _fromBase64(content) {
    return new Buffer(content, 'base64').toString('utf-8');
  }

  /**
   * Get config from github
   *
   * @param {Object} pullRequest
   *
   * @return {Promise}
   */
  _getConfig(pullRequest) {
    const req = {
      user: pullRequest.owner,
      repo: pullRequest.repository.name,
      path: '.devexp.json'
    };

    return new Promise((resolve, reject) => {
      this.github.repos.getContent(req, (err, data) => {
        if (err) {
          const repo = pullRequest.repository.full_name;
          return reject(`Config not found for ${repo}`);
        }

        const config = JSON.parse(this._fromBase64(data.content));

        resolve(config);
      });
    });
  }

  /**
   * Check files with pattern
   *
   * @param {Array} files
   * @param {String|Regex} pattern
   *
   * @return {Boolean}
   */
  _matchSome(files, pattern) {
    for (let i = 0; i < files.length; i++) {
      if (minimatch(files[i], pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get unavilable users
   *
   * @param {Object} review
   * @param {Array} members
   *
   * @return {Promise}
   */
  _getRequiredMembers(review, members) {
    return Promise.all(_.map(members, (user) => {
      return this.teamDispatcher.findTeamByPullRequest(review.pullRequest)
        .then(team => team.findTeamMember(user))
        .then(user => {
          if (!user) {
            this.logger.info(`There are no user with the login "@${user.login}" in team`);
            return;
          }

          return {
            rank: 0,
            login: user.login,
            work_email: user.work_email,
            avatar_url: user.avatar_url
          };
        });
    }))
    .then(users => {
      review.team = review.team.concat(_.compact(users));

      return review;
    });
  }

}
