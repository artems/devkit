import _ from 'lodash';

export class ReviewAction {

  constructor(pullRequest, events, logger) {
    this.events = events;
    this.logger = logger;
    this.pullRequest = pullRequest;
  }

  /**
   * Save review.
   *
   * @param {Object} review
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  save(review, pullId) {
    let isNew = false;

    return this.pullRequest
      .findById(pullId)
      .exec()
      .then(pullRequest => {

        if (!pullRequest) {
          throw new Error('Pull request `' + pullId + '` not found');
        }

        if (_.isEmpty(pullRequest.review.reviewers)) {
          isNew = true;
        }

        if (_.isEmpty(review.reviewers)) {
          review.reviewers = pullRequest.get('review.reviewers');
        }

        review = _.assign({}, pullRequest.review, review);

        if (!review.status) {
          review.status = 'notstarted';
        }

        if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {

          throw new Error('Try to start review where reviewers weren\'t selected' +
                          ' | id - ' + pullId + ', title - ' + pullRequest.title + '
                         );
        }

        if (review.status === 'inprogress' && isNew) {
          review.started_at = new Date();
        }

        pullRequest.set('review', review);

        return pullRequest.save();

      }).then(pullRequest => {

        let eventName;
        if (review.status === 'inprogress' && isNew) {
          eventName = 'review:started';
        } else {
          eventName = 'review:updated';
        }

        this.events.emit(eventName, { pullRequest: pullRequest, review: review });
        this.logger.info('review saved: %s %s', pullId, eventName);

        return pullRequest;

      });
  }

  /**
   * Approve and complete review if approved reviewers count === review config approveCount.
   *
   * @param {String} login - user which approves pull.
   * @param {String} pullId
   *
   * @returns {Promise}
   */
  approveReview(login, pullId) {
    let approvedCount = 0;

    return this.pullRequest
      .findById(pullId)
      .exec()
      .then(pullRequest => {

        if (!pullRequest) {
          throw new Error('Pull request `' + pullId + '` not found');
        }

        const review = pullRequest.get('review');

        review.reviewers.forEach(reviewer => {
          if (reviewer.login === login) {
            reviewer.approved = true;
          }

          if (reviewer.approved) {
            approvedCount += 1;
          }

          if (approvedCount === 2) {
            review.status = 'complete';
          }
        });

        review.updated_at = new Date();

        if (review.status === 'complete') {
          review.completed_at = new Date();
        }

        pullRequest.set('review', review);

        return pullRequest.save();

      }).then(pullRequest => {
        if (pullRequest.review.status === 'complete') {
          this.logger.info('review complete: %s', pullId);
          this.events.emit('review:complete', { pullRequest: pullRequest });
        } else {
          this.logger.info('review approved: %s by %s', pullRequest.id, login);
          this.events.emit('review:approved', { pullRequest: pullRequest, login: login });
        }

        return pullRequest;
      });
  }

}

export default function (options, imports) {

  const model = imports.model;
  const events = imports.events;
  const logger = imports.logger;

  const actions = new ReviewAction(model.get('pull_request'), events, logger);

  Promise.resolve({ service: actions });

}
