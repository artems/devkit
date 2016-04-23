import util from 'util';

const EVENT_NAME = 'review:command:start';

export default function setup(options, imports) {

  const {
    events,
    logger,
    'pull-request-review': pullRequestReview
  } = imports;

  /**
   * Handle '/start' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const startCommand = function startCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/start" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot start review for closed pull request ${pullRequest}`
      ));
    }

    if (commentUser !== pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to start a review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    return pullRequestReview.startReview(pullRequest)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return startCommand;
}
