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

  review.members = take(review.members, max);

  return Promise.resolve(review);
}

/**
 * Create review `total_number` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return totalNumber;
}
