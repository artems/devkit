/**
 * Handler for github webhook with type `pull_request`.
 *
 * @param {Object} body - github webhook payload.
 * @return {Promise}
 */
export default function webhook(payload, PullRequest, imports) {

  const logger = imports.logger;
  const github = imports.github;
  const events = imports.events;

  logger.info(
    'WebHook triggered for pull #%s, action=%s',
    payload.pull_request.id,
    payload.action
  );

  return PullRequest
    .findById(payload.pull_request.id).exec()
    .then(pullRequest => {
      if (!pullRequest) {
        pullRequest = new PullRequest(payload.pull_request);
      } else {
        pullRequest.set(payload.pull_request);
      }

      return github
        .loadPullRequestFiles(pullRequest)
        .then(files => {
          pullRequest.set('files', files);
          return pullRequest.save();
        });
    })
    .then(pullRequest => {
      logger.info(
        'Pull request #%s saved. %s',
        pullRequest._id,
        pullRequest.html_url
      );
      events.emit('github:pull_request:' + payload.action, { pullRequest: pullRequest });

      return pullRequest;
    });
}
