/**
 * Handle '/start' command.
 *
 * @param {Array} command - line with user command.
 * @param {Object} payload - github webhook payload.
 */
export default function startCommand(command, payload, logger) {
  logger.info(
      '"/start" command [%s – %s]',
      payload.pullRequest.id,
      payload.pullRequest.title
  );

  if (payload.pullRequest.state !== 'open') {
    logger.error(
      'Cannot start review for closed pull request [%s – %s]'
      payload.pullRequest.id,
      payload.pullRequest.title
    );

    return;
  }

  if (payload.pullRequest.user.login !== payload.comment.user.login) {
    logger.error(
      '%s tried to start a review but author is %s',
      payload.comment.user.login,
      payload.pullRequest.user.login
    );

    return;
  }

  saveReview({ status: 'inprogress' }, payload.pullRequest.id);
};
