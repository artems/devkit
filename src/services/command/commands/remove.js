import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:remove';

export default function setup(options, imports) {

  const {
    events,
    logger,
    'pull-request-review': pullRequestReview
  } = imports;

  // TODO must be team config
  const minReviewersCount = options.min;

  /**
   * Handle '/remove' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command
   *
   * @return {Promise}
   */
  const removeCommand = function removeCommand(command, payload, arglist) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const oldReviewerLogin = arglist.shift();

    const pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/remove" %s', pullRequest);

    // TODO config this
    if (!find(pullRequestReviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove %s, but he is not a reviewer %s',
        commentUser, oldReviewerLogin, pullRequest
      )));
    }

    if (pullRequestReviewers.length - 1 < minReviewersCount) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove %s, but there is should be at least %s reviewers %s',
        commentUser,
        oldReviewerLogin,
        minReviewersCount,
        pullRequest
      )));
    }

    pullRequestReviewers = reject(
      pullRequestReviewers, { login: oldReviewerLogin }
    );

    return pullRequestReview
      .updateReviewers(pullRequest, pullRequestReviewers)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return removeCommand;
}
