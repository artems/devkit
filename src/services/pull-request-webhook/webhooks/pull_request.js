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
  const logger = imports.logger.getLogger('webhook');

  const PullRequestModel = imports['pull-request-model'];

  let isNewPullRequest = false;

  return PullRequestModel
    .findById(payload.pull_request.id)
    .then(pullRequest => {
      if (!pullRequest) {
        pullRequest = new PullRequestModel();
        isNewPullRequest = true;
      }

      return pullRequest
        .savePayloadFromGitHub(payload)
        .then(::pullRequest.loadPullRequestFiles())
        .then(::pullRequest.save());
    })
    .then(pullRequest => {
      const action = isNewPullRequest ? 'saved' : 'updated';

      logger.info('Pull request %s %s', action, pullRequest.toString());
      events.emit('github:pull_request:' + payload.action, { pullRequest });

      return pullRequest;
    });

}
