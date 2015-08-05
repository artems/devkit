/**
 * Handler for github webhook with type `pull_request`.
 *
 * @param {Object} body - github webhook payload.
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const model = imports.model;
  const logger = imports.logger;
  const github = imports.github;
  const events = imports.events;

  const PullRequest = model.get('pull_request');

  logger.info(
    'WebHook triggered for pull #%s, action=%s',
    payload.pull_request.id,
    payload.action
  );

  const pullRequestWebhook = payload.pull_request;
  pullRequestWebhook.repository = payload.repository;
  pullRequestWebhook.organization = payload.organization;

  return PullRequest
    .findById(pullRequestWebhook.id).exec()
    .then(pullRequest => {
      if (!pullRequest) {
        pullRequest = new PullRequest(pullRequestWebhook);
      } else {
        pullRequest.set(pullRequestWebhook);
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