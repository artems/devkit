import { chain, find, forEach, isEmpty } from 'lodash';

/**
 * Create review `load` processor.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {

  const PullRequestModel = imports['pull-request-model'];

  /**
   * Subtract rank from reviewers which aleady has active review.
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} options.max - max rank which will be subtract for amount of active reviews.
   *
   * @return {Promise.<Review>}
   */
  function load(review, options) {

    const max = options.max;

    const promise = [];

    if (isEmpty(review.team)) {
      return Promise.resolve(review);
    }

    forEach(review.team, (member) => {
      promise.push(PullRequestModel.findInReviewByReviewer(member.login));
    });

    return Promise.all(promise)
      .then(openReviews => {
        chain(openReviews)
          .flatten()
          .uniq('id')
          .forEach(activeReview => {
            forEach(activeReview.review.reviewers, (reviewer) => {
              reviewer = find(review.team, { login: reviewer.login });

              if (reviewer) {
                reviewer.rank -= max;
              }
            });
          })
          .value();

        return review;
      });

  }

  return load;
}
