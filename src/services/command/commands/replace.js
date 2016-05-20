import util from 'util';
import { find, reject, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:replace';

export default function commandService(options, imports) {

  const {
    events,
    logger,
    review,
    'pull-request-review': pullRequestReview
  } = imports;

  /**
   * Handle '/replace' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command
   *
   * @return {Promise}
   */
  const replaceCommand = function replaceCommand(command, payload, arglist) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const oldReviewerLogin = arglist.shift();

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/replace" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot change reviewer for closed pull request ${pullRequest}`
      ));
    }

    if (!find(pullRequestReviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change %s, but he is not a reviewer %s',
        commentUser, oldReviewerLogin, pullRequest
      )));
    }

    return review.choose(pullRequest)
      .then(({ ranks }) => {
        pullRequestReviewers = reject(
          pullRequestReviewers, { login: oldReviewerLogin }
        );

        pullRequestReviewers.push(cloneDeep(ranks.shift()));

        return pullRequestReview.updateReviewers(
          pullRequest, pullRequestReviewers
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  return replaceCommand;
}
