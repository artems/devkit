import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:busy';

export default function commandService(options, imports) {
  const { action, review, logger, events } = imports;

  /**
   * Handle '/busy' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const busyCommand = function busyCommand(command, payload) {

    const pullRequest = payload.pullRequest;

    logger.info('"/busy" %s', pullRequest.toString());

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        'Cannot change reviewer for closed pull request %s',
        pullRequest.toString()
      )));
    }

    const login = payload.comment.user.login;
    const reviewer = find(pullRequest.review.reviewers, { login });

    if (!reviewer) {
      return Promise.reject(new Error(util.format(
        '%s tried to change reviewer, but he is not in reviewers list %s',
        login, pullRequest.toString()
      )));
    }

    return review.review(pullRequest)
      .then(result => {
        const candidate = result.team[0];
        const reviewers = reject(
          pullRequest.review.reviewers,
          { login: payload.comment.user.login }
        );

        reviewers.push(candidate);

        return action.updateReviewers(reviewers, pullRequest.id);
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });
  };

  return busyCommand;
}
