import { forEach } from 'lodash';

/**
 * Add random rank to every team member.
 *
 * @param {Review} review
 * @param {Object} options
 * @param {Number} options.max - max random rank
 *
 * @return {Review} review
 */
function random(review, options) {
  const max = options.max;

  forEach(review.members, (member) => {
    member.rank += Math.floor(Math.random() * (max + 1));
  });

  return Promise.resolve(review);
}

/**
 * Create review `random` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return random;
}
