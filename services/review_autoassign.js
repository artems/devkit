import _ from 'lodash';

/**
 * Few checks for autostarting review.
 *
 * @param {Object} pullRequest
 *
 * @returns {Boolean}
 */
function shouldStartReview(pullRequest) {
    return _.isEmpty(pullRequest.review.reviewers);
}

/**
 * Plugin for auto assign reviewers for pull request.
 *
 * @param {Object} payload
 * @param {Object} payload.pullRequest
 */
function autoStart(logger, review, payload) {
    var pullRequest = payload.pullRequest;

    if (!shouldStartReview(pullRequest)) return;

    logger.info('Autostart review for pull "' + pullRequest.id + ' — ' + pullRequest.title + '"');

    review.review(pullRequest.id)
        .then(resultReview => {
            logger.warn('TODO save pull request');
            // saveReview({ reviewers: resultReview.team }, pullRequest.id);
        })
        .catch(logger.error.bind(logger));
}

export default function (options, imports) {
  const logger = imports.logger;
  const events = imports.events;
  const review = imports.review;

  events.on('github:pull_request:opened', autoStart.bind(null, logger, review));
  events.on('github:pull_request:synchronize', autoStart.bind(null, logger, review));

  return Promise.resolve({ service: {} });
}
