import _ from 'lodash';

export default class ReviewConveyor {

  /**
   * @constructor
   * @param {Function[]} stages — function which returns promise which resolve with { pull, team } object.
   */
  constructor(team, model, logger, options) {
    if (!options.stages) {
      throw new Error('No stages provided');
    }

    this.team = team;
    this.logger = logger;
    this.stages = options.stages || [];
  }

  /**
   * Return registred processors for futher using.
   *
   * @return {Function[]}
   */
  get() {
    return this.stages;
  }

  /**
   * Get team for pull request.
   *
   * @param {Review} review
   * @return {Promise}
   */
  getTeam(review) {
    return this.team
      findByPullRequest(review.pull)
      .then(team => {
        review.team = team;

        return review;
      });
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   * @return {Promise}
   */
  addZeroRank(review) {
    review.team.forEach(member => {
      member.rank = 0;
    });

    return Promise.resolve(review);
  }

  /**
   * Starts ranking queue.
   *
   * @param {Number} pullRequestId
   *
   * @returns {Promise}
   */
  start(pullRequestId) {
    return new Promise((resolve, reject) => {
      PullRequest
        .findById(pullRequestId)
        .then(pullRequest => {
          if (!pullRequest) {
            return reject(new Error('Pull request #' + pullRequestId + ' not found'));
          }

          resolve({ pull: pullRequest, team: [] });
        });
    });
  }

  /**
   * Main review suggestion method.
   * Creates queue of promises from processor and retruns suggested reviewers.
   *
   * @param {Number} pullRequestId
   * @return {Promise}
   */
  review(pullRequestId) {
    const rankers = this.get();

    let reviewQueue = this
      .start(pullRequestId)
      .then(::this.getTeam)
      .then(::this.addZeroRank);

    this.logger.info('Review started');
    rankers.reduce((queue, ranker) => {
      return queue.then(review => {
        this.logger.info('Choose reviewer stage is `%s`', ranker.name);

        return ranker(review);
      })
    });

    reviewQueue = reviewQueue
      .then(review => {
        this.logger.info(
          'Choosing reviewers complete for pull request: %s — %s',
          review.pull.title,
          review.pull.html_url
        );

        this.logger.info('Reviewers are: %s',
          review.team
              ? review.team.map(x => x.login + ' rank: ' + x.rank + ' ')
              : 'ooops no reviewers were selected...'
        );

        return review;
      });

    return reviewQueue;
  }
}

/**
 * Review.
 *
 * @typedef {Object} Review
 * @property {Array} team - Team members for review.
 * @property {Object} pull - Pull Request.
 */
