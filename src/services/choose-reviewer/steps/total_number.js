/**
 * Create review total number processor.
 *
 * @return {Function}
 */
export default function totalNumberService() {

  /**
   * Take defined amount of team member for review.
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} options.max - how many reviewers should be suggested.
   *
   * @return {Review} review
   */
  function totalNumber(review, options) {
    const max = options.max;

    review.team = review.team.slice(0, max);

    return Promise.resolve(review);
  }

  return totalNumber;
}
