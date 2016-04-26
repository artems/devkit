import { filter } from 'lodash';

/**
 * Remove author from review.
 *
 * @param {Review} review
 *
 * @return {Promise.<Review>}
 */
function removeAuthor(review) {
  const author = review.pullRequest.get('user.login');

  review.members = filter(review.members, (member) => {
    return member.login !== author;
  });

  return Promise.resolve(review);
}

/**
 * Create review `remove_author` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return removeAuthor;
}
