import { filter, forEach, isEmpty } from 'lodash';

/**
 * Remove members which are already reviewers.
 *
 * @param {Review} review
 *
 * @return {Promise.<Review>} review
 */
function removeAlreadyReviewers(review) {
  const reviewers = review.pullRequest.get('review.reviewers');

  if (isEmpty(reviewers)) {
    return Promise.resolve(review);
  }

  review.members = filter(review.members, (member) => {
    let keep = true;

    forEach(reviewers, (reviewer) => {
      if (reviewer.login === member.login) {
        keep = false;
      }
    });

    return keep;
  });

  return Promise.resolve(review);
}

/**
 * Create review `remove_already_reviewers` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return removeAlreadyReviewers;
}
