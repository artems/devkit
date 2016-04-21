import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:remove';

export function getParticipant(command, parseLogins) {
  const participant = parseLogins(command, ['/remove', '-']);

  return participant[0];
}

export default function commandService(options, imports) {
  const { action, logger, events, parseLogins } = imports;
  const minReviewersCount = options.min;

  /**
   * Handle '/remove' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const removeCommand = function removeCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');

    logger.info('"/remove" %s', pullRequest.toString());

    const reviewerLogin = getParticipant(command, parseLogins);

    if (!find(reviewers, { login: reviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove reviewer %s but he is not in reviewers list',
        payload.comment.user.login,
        reviewerLogin
      )));
    }

    if (reviewers.length - 1 < minReviewersCount) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove reviewer %s but there should be at least %s reviewers in pull request',
        payload.comment.user.login,
        reviewerLogin,
        minReviewersCount
      )));
    }

    const newReviewers = reject(reviewers, { login: reviewerLogin });

    return action
      .updateReviewers(pullRequest, newReviewers)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });

  };

  return removeCommand;
}
