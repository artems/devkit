import { sortBy, reverse } from 'lodash';

/**
 * Sort reviewers by rank in descending order.
 *
 * @param {Review} review
 *
 * @return {Promise.<Review>} review
 */
export function sort(review) {
  review.team = reverse(sortBy(review.team, 'rank'));

  return Promise.resolve(review);
}

/**
 * Create review `sort` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return sort;
}
