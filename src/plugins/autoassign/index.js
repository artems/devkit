import { isEmpty } from 'lodash';

/**
 * Check for autostarting review.
 *
 * @param {Object} pullRequest
 *
 * @return {Boolean}
 */
function shouldStart(pullRequest) {
  return isEmpty(pullRequest.get('review.reviewers'));
}

export default function setup(options, imports) {

  const events = imports.events;
  const review = imports.review;
  const logger = imports.logger.getLogger('autoassign');
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Plugin for auto assign reviewers for pull request.
   *
   * @param {Object} payload
   * @param {Object} payload.pullRequest
   */
  function autoStart(payload) {
    const pullRequest = payload.pullRequest;

    if (!shouldStart(pullRequest)) {
      return;
    }

    logger.info('Autostart review %s', pullRequest.toString());

    review.choose(pullRequest.id)
      .then(result => {
        return pullRequestReview.updateReviewers(
          pullRequest,
          result.members
        );
      })
      .catch(logger.error.bind(logger));
  }

  events.on('github:pull_request:opened', autoStart);
  events.on('github:pull_request:synchronize', autoStart);

  return {};

}
