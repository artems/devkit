import _ from 'lodash';
import moment from 'moment';
import minimatch from 'minimatch';

/**
 * Return pull request files.
 *
 * @param {Object} pullRequest
 * @param {Array}  ignorePatterns - patterns to ignore.
 * @param {Number} filesToCheck - number of files to keep for futher processing.
 *
 * @return {Promise.<Array.<GitHubFile>>}
 */
export function getFiles(pullRequest, ignorePatterns, filesToCheck) {
  let files = pullRequest.get('files');

  if (_.isEmpty(files)) {
    return Promise.resolve([]);
  }

  files = _(files)
    .filter(file => {
      let keep = true;

      _.forEach(ignorePatterns, pattern => {
        if (minimatch(file.filename, pattern)) {
          keep = false;
        }
      });

      return keep;
    })
    .sampleSize(filesToCheck || 5)
    .value();

  return Promise.resolve(files);
}

/**
 * Get last commits of files.
 *
 * @param {Object} github
 * @param {Object} pullRequest
 * @param {String} since - get commits which newer then since date.
 * @param {Number} commitsCount - number of commits to get.
 *
 * @return {Promise.<Array>} [commit]
 */
export function getCommits(github, pullRequest, since, commitsCount) {

  return function (files) {
    const promise = [];

    const options = {
      user: pullRequest.owner,
      repo: pullRequest.repository.name,
      per_page: commitsCount || 10
    };

    if (since) {
      options.since = since;
    }

    _.forEach(files, file => {
      const req = _.assign({}, { path: file.filename }, options);

      promise.push(new Promise(resolve => {
        github.repos.getCommits(req, (error, commits) => {
          // TODO error log
          error ? resolve([]) : resolve(commits);
        });
      }));
    });

    return Promise.all(promise).then(result => _.flatten(result));
  };

}

/**
 * Process commits and find the most commiters for changed files.
 *
 * @param {Array} commits
 *
 * @return {Promise.<Array>} [{ author: number_of_commits }]
 */
export function getCommiters(commits) {
  const members = {};

  _.forEach(commits, (commit) => {
    const author = commit.author;

    if (author) {
      members[author.login] = (members[author.login] || 0) + 1;
    }
  });

  return Promise.resolve(members);
}

/**
 * Add rank to the most commiters.
 *
 * @param {Number} maxRank
 * @param {Array}  team
 *
 * @return {Array} team
 */
export function addRank(maxRank, team) {

  return function (members) {
    let max = 0;

    _.forIn(members, (rank) => {
      if (rank > max) {
        max = rank;
      }
    });

    _.forEach(team, (member) => {
      member.rank += members[member.login] ?
        maxRank / (max / members[member.login]) :
        0;
    });

    return team;
  };

}

/**
 * Return since date for github api.
 *
 * @param {Array<String>} date - [2, 'days']
 *
 * @return {String} [description]
 */
export function getSinceDate(date) {
  if (!date) return '';

  return moment()
    .subtract(date[0], date[1] || 'days')
    .format('YYYY-MM-DDTHH:mm:ssZZ');
}

/**
 * Create review `commiters` processor.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {

  const github = imports.github;

  /**
   * Add rank for commiters in same files as current pull request.
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Array}  [options.since] - how old commits need to retrieve
   * @param {Array}  [options.ignore] - list of patterns to ignore.
   * @param {Number} [options.commitsCount] - number of commits to inspect.
   * @param {Number} [options.filesToCheck] - number files to get commits in.
   *
   * @return {Promise.<Review>}
   */
  function commiters(review, options) {
    const max = options.max;

    if (_.isEmpty(review.team)) {
      return Promise.resolve(review);
    }

    const sinceDate = getSinceDate(options.since);

    const pullRequest = review.pullRequest;

    return getFiles(pullRequest, options.ignore, options.filesToCheck)
      .then(getCommits(github, pullRequest, sinceDate, options.commitsCount))
      .then(getCommiters)
      .then(addRank(max, review.team))
      .then(team => {
        review.team = team;

        return review;
      });

  }

  return commiters;
}
