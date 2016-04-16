import util from 'util';
import { get, forEach, isEmpty } from 'lodash';

export default class PullRequestAction {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, { team, events, logger, PullRequestModel }) {
    this.options = options;

    this.team = team;
    this.events = events;
    this.logger = logger;
    this.PullRequestModel = PullRequestModel;
  }

  getReview(pullId) {

    return new Promise((resolve, reject) => {

      this.PullRequestModel
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) throw new Error('Pull request `${pullId}` not found');

          const review = pullRequest.get('review');

          return { pullRequest, review };
        })
        .then(resolve, reject);

    });

  }

  /**
   * Start review.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  startReview(pullId) {

    return this.getReview(pullId)
      .then(({ pullRequest, review }) => {
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
        review.started_at = new Date();

        pullRequest.set('review', review);

        return pullRequest.save();
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
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  stopReview(pullId) {

    return this.getReview(pullId)
      .then(({ pullRequest, review }) => {
        if (review.status !== 'inprogress') {
          this.logger.info(
            'Try to stop is not in progress review %s',
            pullRequest.toString()
          );
        }

        review.status = 'notstarted';

        pullRequest.set('review', review);

        return pullRequest.save();
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
   * @param {String} login - user which approves pull.
   * @param {String} pullId
   *
   * @return {Promise}
   */
  approveReview(login, pullId) {

    let approvedCount = 0;

    return this.getReview(pullId)
      .then(({ pullRequest, review }) => {
        const requiredApprovedCount = this.getRequiredApproveCount(pullRequest);

        forEach(review.reviewers, reviewer => {
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

        return pullRequest.save();

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
   * @param {Object} reviewers
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  updateReviewers(reviewers, pullId) {

    return this.getReview(pullId)
      .then(({ pullRequest }) => {
        if (isEmpty(reviewers)) {
          throw new Error(util.format(
            'Cannot drop all reviewers from pull request %s',
            pullRequest.toString()
          ));
        }

        pullRequest.set('review.reviewers', reviewers);

        return pullRequest.save();
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
    const teamName = this.team.findTeamNameByPullRequest(pullRequest);

    return get(
      this.options,
      ['teamOverrides', teamName, 'approveCount'],
      this.options.approveCount
    );
  }

}
