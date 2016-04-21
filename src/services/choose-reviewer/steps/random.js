/**
 * Create review random processor.
 *
 * @return {Function}
 */
export default function randomService() {

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

    review.team.forEach(member => {
      member.rank += Math.floor(Math.random() * (max + 1));
    });

    return Promise.resolve(review);
  }

  return random;
}
