import util from 'util';
import { get, forEach, isEmpty } from 'lodash';

export default class PullRequestReview {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, { events, logger, teamDispatcher }) {
    this.options = options;

    this.events = events;
    this.logger = logger;
    this.teamDispatcher = teamDispatcher;
  }

  /**
   * Start review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  startReview(pullRequest) {
    const review = pullRequest.get('review');

    return new Promise(resolve => {
      if (review.status !== 'notstarted') {
        throw new Error(util.format(
          'Try to start is not opened review. status=%s %s',
          review.status, pullRequest.toString()
        ));
      }

      if (isEmpty(review.reviewers)) {
        throw new Error(util.format(
          'Try to start review where reviewers were not selected %s',
          pullRequest.toString()
        ));
      }

      review.status = 'inprogress';

      if (!review.started_at) {
        review.started_at = new Date();
      }

      review.updated_at = new Date();

      pullRequest.set('review', review);

      resolve(pullRequest);
    })
    .then(pullRequest => {
      this.logger.info('Review started %s', pullRequest.toString());
      this.events.emit('review:started', { pullRequest });

      return pullRequest;
    });
  }

  /**
   * Stop review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  stopReview(pullRequest) {
    const review = pullRequest.get('review');

    return new Promise(resolve => {
      if (review.status !== 'inprogress') {
        this.logger.info(
          'Try to stop is not in progress review %s',
          pullRequest.toString()
        );
      }

      review.status = 'notstarted';
      review.updated_at = new Date();

      pullRequest.set('review', review);

      resolve(pullRequest);
    })
    .then(pullRequest => {
      this.logger.info('Review stopped %s', pullRequest.toString());
      this.events.emit('review:updated', { pullRequest });

      return pullRequest;
    });

  }

  /**
   * Approve and complete review if approved reviewers equal `approveCount`.
   *
   * @param {PullRequest} pullRequest
   * @param {String} login - user which approves pull.
   *
   * @return {Promise}
   */
  approveReview(pullRequest, login) {

    let approvedCount = 0;
    const review = pullRequest.get('review');

    return new Promise(resolve => {
      const requiredApprovedCount = this.getRequiredApproveCount(pullRequest);

      forEach(review.reviewers, (reviewer) => {
        if (reviewer.login === login) {
          reviewer.approved = true;
        }

        if (reviewer.approved) {
          approvedCount += 1;
        }

        if (approvedCount >= requiredApprovedCount) {
          review.status = 'complete';
        }
      });

      review.updated_at = new Date();

      if (review.status === 'complete') {
        review.completed_at = new Date();
      }

      pullRequest.set('review', review);

      resolve(pullRequest);
    })
    .then(pullRequest => {
      this.logger.info('Review approved by %s %s', login, pullRequest.toString());
      this.events.emit('review:approved', { pullRequest, login });

      if (pullRequest.get('review.status') === 'complete') {
        this.logger.info('Review complete %s', pullRequest.toString());
        this.events.emit('review:complete', { pullRequest });
      }

      return pullRequest;
    });

  }

  /**
   * Update reviewers list.
   *
   * @param {PullRequest} pullRequest
   * @param {Object} reviewers
   *
   * @return {Promise}
   */
  updateReviewers(pullRequest, reviewers) {
    return new Promise(resolve => {
      if (isEmpty(reviewers)) {
        throw new Error(util.format(
          'Cannot drop all reviewers from pull request %s',
          pullRequest.toString()
        ));
      }

      pullRequest.set('review.reviewers', reviewers);
      pullRequest.set('review.updated_at', new Date());

      resolve(pullRequest);
    })
    .then(pullRequest => {
      this.logger.info('Reviewers updated %s', pullRequest.toString());
      this.events.emit('review:updated', { pullRequest });

      return pullRequest;
    });

  }

  /**
   * Returns number of approved reviews after which review will be marked as completed.
   *
   * @param {Object} pullRequest
   *
   * @return {Number}
   */
  getRequiredApproveCount(pullRequest) {
    const teamName = this.teamDispatcher.findTeamNameByPullRequest(pullRequest);

    return get(
      this.options,
      ['teamOverrides', teamName, 'approveCount'],
      this.options.approveCount
    );
  }

}
