import util from 'util';
import { find } from 'lodash';

const EVENT_NAME = 'review:command:not_ok';

export default function setup(options, imports) {

  const {
    events,
    logger,
    'pull-request-review': pullRequestReview
  } = imports;

  /**
   * Handle '/!ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const notOkCommand = function notOkCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const pullRequestReviewers = pullRequest.get('review.reviewers');

    const commenter = find(pullRequestReviewers, { login: commentUser });

    logger.info('"/!ok" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot cancel approve for closed pull request ${pullRequest}`
      ));
    }

    if (!commenter) {
      return Promise.reject(new Error(util.format(
        '%s tried to cancel approve, but he is not a reviewer %s',
        commentUser, pullRequest
      )));
    }

    // TODO do this through pullRequestReview.changesNeeded();
    commenter.approved = false;

    return pullRequestReview
      .updateReviewers(pullRequest, pullRequestReviewers)
      .then(pullRequest => pullRequestReview.stopReview(pullRequest))
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  return notOkCommand;
}
