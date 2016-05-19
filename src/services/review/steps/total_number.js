import { take } from 'lodash';

/**
 * Takes defined number from team members for review.
 *
 * @param {Review} review
 * @param {Object} options
 * @param {Number} options.max - number of reviewers
 *
 * @return {Promise.<Review>} review
 */
function totalNumber(review, options) {
  const max = options.max;

  const result = take(review.members, max)
    .map(member => {
      return {
        login: member.login,
        rank: Infinity
      };
    });

  return Promise.resolve(result);
}

/**
 * Create review `total_number` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return totalNumber;
}
