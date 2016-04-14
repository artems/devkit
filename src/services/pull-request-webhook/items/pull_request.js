/**
 * Handler for github webhook with type `pull_request`.
 *
 * @param {Object} payload - github webhook payload.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const events = imports.events;
  const github = imports.github;
  const logger = imports.logger.getLogger('webhook');

  const PullRequestModel = imports['pull-request-model'];

  const pullRequestWebhook = payload.pull_request;

  pullRequestWebhook.repository = payload.repository;

  let isNewPullRequest = true;
  return PullRequestModel
    .findById(pullRequestWebhook.id)
    .then(pullRequest => {
      if (pullRequest) {
        pullRequest.set(pullRequestWebhook);
        isNewPullRequest = false;
      } else {
        pullRequest = new PullRequestModel(pullRequestWebhook);
      }

      return github
        .loadPullRequestFiles(pullRequest)
        .then(files => {
          pullRequest.set('files', files);

          return pullRequest;
        });
    })
    .then(pullRequest => pullRequest.save())
    .then(pullRequest => {
      const action = isNewPullRequest ? 'saved' : 'updated';
      logger.info('Pull request %s %s', action, pullRequest.toString());
      events.emit('github:pull_request:' + payload.action, { pullRequest });

      return pullRequest;
    });

}
