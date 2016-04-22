import _ from 'lodash';
import minimatch from 'minimatch';

/**
 * Checks if files match any pattern.
 *
 * @param {String[]} files - list of files
 * @param {String[]} patterns - minimatch compitable pattern
 *
 * @return {Boolean}
 */
export function isMatchAny(files, patterns) {
  return _.some(_.map(patterns, (pattern) => {
    return !_.isEmpty(minimatch.match(files, pattern));
  }));
}

/**
 * Checks if files matches all patterns.
 *
 * @param {String[]} files - list of files
 * @param {String[]} patterns - minimatch compitable pattern
 *
 * @return {Boolean}
 */
export function isMatchAll(files, patterns) {
  return _.every(_.map(patterns, (pattern) => {
     return !_.isEmpty(minimatch.match(files, pattern));
  }));
}

/**
 * Gets files from pull request
 *
 * @param {Object} pullRequest
 *
 * @return {Promise.<Array>}
 */
export function getFiles(pullRequest) {
  const files = pullRequest.get('files');

  if (_.isEmpty(files)) {
    return Promise.reject(new Error('No files in pull request'));
  }

  return Promise.resolve(_.map(files, 'filename'));
}

/**
 * Increment rank for random member if files match the pattern
 *
 * @param {Object} options - inc options
 * @param {Object} review
 *
 * @return {Promise.<Array>}
 */
export function incRank(options, review) {

  return function (files) {
    const { max, pattern, members } = options;
    const membersCount = Math.floor(Math.random() * members.length) + 1;
    const isApplicable =
      !_.isEmpty(pattern) &&
      !_.isEmpty(review.team) &&
      isMatchAny(files, pattern);

    if (isApplicable) {
      let reviewers = [];

      while (_.isEmpty(reviewers)) {
        const selectedMembers = _.sample(members, membersCount);

        reviewers = _.filter(review.team, (reviewer) => {
          return selectedMembers.indexOf(reviewer.login) !== -1
        });
      }

      _.forEach(reviewers, (reviewer) => {
        reviewer.rank += Math.floor(Math.random() * max) + 1;
      });
    }

    return Promise.resolve(files);
  };

}

/**
 * Decrement rank for all members from options if pattern matches files
 *
 * @param {Object} options
 * @param {Object} review
 *
 * @return {Promise.<Array>}
 */
export function decRank(options, review) {

  return function (files) {
    const { max, pattern, members } = options;
    const rank = Math.floor(Math.random() * max) + 1;
    const pullRequest = review.pullRequest;
    const isApplicable = isMatchAll(files, pattern);

    if (isApplicable) {
      _.forEach(review.team, (reviewer) => {
        if (members.indexOf(reviewer.login) !== -1) {
          reviewer.rank -= rank;
        }
      });
    }

    return Promise.resolve(files);
  };

}

/**
 * Adds rank for members who are defined in `incPattern`.
 * Subtracts rank for members who are defined in `decPattern`.
 *
 * @return {Promise.<Review>}
 */
export function pathRelated(review, options) {
  // TODO log error
  const next = () => review;

  return getFiles(review.pullRequest)
    .then(incRank(_.assign({}, options, { pattern: options.incPattern }), review))
    .then(decRank(_.assign({}, options, { pattern: options.decPattern }), review))
    .then(next, next);
};

/**
 * Create review `path_related` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return pathRelated;
}
