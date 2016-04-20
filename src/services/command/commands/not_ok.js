import util from 'util';
import { find } from 'lodash';

const EVENT_NAME = 'review:command:not_ok';

export default function setup(options, imports) {

  const { action, logger, events } = imports;

  /**
   * Handle '/!ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const notOkCommand = function notOkCommand(command, payload) {

    const login = payload.comment.user.login;
    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');
    const commenter = find(reviewers, { login });

    logger.info('"/!ok" %s', pullRequest.toString());

    if (!commenter) {
      return Promise.reject(new Error(util.format(
        '%s tried to cancel approve, but he is not in reviewers list %s',
        login, pullRequest.toString()
      )));
    }

    commenter.approved = false;

    return action
      .updateReviewers(pullRequest, reviewers)
      .then(pullRequest => action.stopReview(pullRequest))
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });
  };

  return notOkCommand;
}
