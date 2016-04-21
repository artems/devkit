import util from 'util';

const EVENT_NAME = 'review:command:ping';

export default function commandService(options, imports) {

  const { events, logger } = imports;

  /**
   * Handle '/ping' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const pingCommand = function pingCommand(command, payload) {
    const pullRequest = payload.pullRequest;

    logger.info('"/ping" %s', pullRequest.toString());

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        'Cannot ping for closed pull request %s', pullRequest.toString()
      )));
    }

    if (pullRequest.user.login !== payload.comment.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to ping a review, but author is %s',
        payload.comment.user.login,
        pullRequest.user.login
      )));
    }

    events.emit(EVENT_NAME, { pullRequest });

    return Promise.resolve();
  };

  return pingCommand;
}
