import fs from 'fs';
import _ from 'lodash';
import minimatch from 'minimatch';

export default function setup(options, imports) {
  const events = imports.events;
  const logger = imports.logger.getLogger('special');
  const teamDispatcher = imports['team-dispatcher'];

  const service = {

    /**
     * Request config from github
     *
     * @param {Object} pullRequest
     * @return {Promise}
     * @private
     */
    _getConfig: function (pullRequest) {
      const req = {
        user: pullRequest.owner,
        repo: pullRequest.repository.name,
        path: '.devexp.json'
      };

      return new Promise((resolve, reject) => {
        github.repos.getContent(req, (err, data) => {
          if (err) {
            return reject(`Config not found for ${pullRequest.repository.full_name}`);
          }

          const config = JSON.parse(new Buffer(data.content, 'base64').toString());

          resolve(config.specialReviewers);
        });
      });
    },

    /**
     * Check files with pattern
     *
     * @param {Array} files
     * @param {String|Regex} pattern
     * @return {Boolean}
     * @private
     */
    _matchSome: function (files, pattern) {
      for (let i = 0; i < files.length; i++) {
        if (minimatch(files[i], pattern)) {
          return true;
        }
      }

      return false;
    },

    /**
     * Up members rank
     *
     * @param {Array} team
     * @param {Array} members
     * @return {Array}
     * @private
     */
    _rankAndMarkSpecial: function (team, members) {
      if (!members.length) {
        return team;
      }

      team.forEach(user => {
        if (members.includes(user.login)) {
          user.rank += 1000;
          user.special = true;
        }
      });

      return team;
    },

    /**
     * Get unavilable users
     *
     * @param {Object} review
     * @param {Array} requiredMembers
     * @return {Promise}
     * @private
     */
    _getRequiredMembers: function (review, requiredMembers) {
      return Promise.all(map(requiredMembers, requiredUser => {
        return team
          .findTeamMemberByPullRequest(review.pullRequest, requiredUser)
          .then(user => {
            if (!user) {
              logger.info(`There are no user with the login "@${requiredUser.login}" in team`);
              return null;
            }

            return {
              login: user.login,
              work_email: user.work_email,
              avatar_url: user.avatar_url,
              rank: 0
            };
          });
      }))
        .then(users => {
          review.team = review.team.concat(compact(users));

          return review;
        });
    },

    /**
     * Check users and get unavilabe
     *
     * @param {Object} review
     * @param {Object} patch
     * @return {Promise} resolve review and patch
     * @private
     */
    _prepareReviewers: function (review, patch) {
      const members = pluck(patch.addMembers, 'login');

      if (!members || !members.length) {
        return Promise.resolve({ review, patch });
      }

      const requiredMembersLogins = members.filter(user => {
        return !pluck(review.members, 'login').includes(user);
      });

      if (requiredMembersLogins.length) {
        return this._getRequiredMembers(review, requiredMembersLogins)
          .then(review => {
            return { review, patch };
          });
      }

      return Promise.resolve({ review, patch });
    },

    /**
     * Apply all rules from config
     *
     * @param {Object} review
     * @param {Object} conf
     * @return {Promise}
     * @private
     */
    _applyRules: function (review, confing) {
      const patch = {
        addMembers: [],
        removeMembers: [],
        onlySpecial: false,
        totalCountEdited: false
      };

      const files = pluck(review.pullRequest.files, 'filename');

      // create patch from all rules
      forEach(confing, (rule) => {
        forEach(rule.pattern, pattern => {
          if (this._matchSome(files, pattern)) {

            const usersToAdd = filter(rule.addMembers, (login) => {
              // exclude author of pull request
              return login !== review.pullRequest.user.login
            });
            const usersToRemove = rule.removeMembers;
            const userAddCount = rule.membersToAdd || 1;
            const onlySpecial = Boolean(rule.doNotChooseOther);

            if (!isEmpty(usersToAdd)) {
              patch.addMembers = patch.addMembers.concat(
                _.map(_.sample(usersToAdd, userAddCount), (login) => {
                  return { login, pattern };
                })
              );
            }

            if (!isEmpty(usersToRemove)) {
              patch.removeMembers = patch.removeMembers.concat(usersToRemove);
            }

            if (onlySpecial) {
              patch.onlySpecial = true;
            }

            logger.info(`Match pattern: ${rule.pattern}`);

            // break for lodash forEach
            return false;

          }
        });
      });

      // remove unnecessary users
      patch.addMembers = _.uniq(_.filter(patch.addMembers, (user) => {
        return !patch.removeMembers.includes(user.login);
      }), 'login');

      // prepare unexists reviewers and apply rules
      return this._prepareReviewers(review, patch);
    },

    /**
     * Exclude reviewers
     *
     * @param {Array} team
     * @param {Array} members
     * @return {Promise}
     * @private
     */
    _excludeReviewers: function (team, members) {
      return team.filter(user => members.includes(user.login))
        .map(user => { login: user.login, rank: -Infinity });
    },

    checkConfigRules: function (review) {
      return this._getConfig(review.pullRequest)
        .then(conf => this._applyRules(review, conf));
    },

    /**
     * Add random rank to every team member.
     *
     * @param {Review} review
     *
     * @return {Promise}
     */
    specialReviewers: function (review) {
      return this.checkConfigRules(review)
        .then(reviewData => {
          const { review, patch } = reviewData;

          // set varibles for total step
          review.onlySpecial = patch.onlySpecial;

          review.specialCount = patch.addMembers.length;

          logger.info(`Add reviewers from config: ${patch.addMembers}`);
          review.team = this._rankAndMarkSpecial(review.team, pluck(patch.addMembers, 'login'));

          logger.info(`Remove reviewers from config: ${patch.removeMembers}`);
          review.team = this._excludeReviewers(review.team, patch.removeMembers);

          return review;
        });
    }
  };

  return service;
}
