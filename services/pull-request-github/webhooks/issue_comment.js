'use strict';

/**
 * Handler for github webhook with type `issue_comment`.
 *
 * @param {Object} payload - github webhook payload.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const model = imports.model;
  const logger = imports.logger;
  const events = imports.events;

  const PullRequestModel = model.get('pull_request');

  const repositoryName = payload.repository.full_name;
  const pullRequestNumber = payload.issue.number;

  logger.info(
    'Webhook triggered for pull #%s, action=comment',
    pullRequestNumber
  );

  return PullRequestModel
    .findByNumberAndRepository(pullRequestNumber, repositoryName)
    .then(pullRequest => {
      if (!pullRequest) {
        return Promise.reject(
          new Error(`Pull request #${pullRequestNumber} not found`)
        );
      }

      events.emit(
        'github:issue_comment',
        { pullRequest, comment: payload.comment }
      );

      return pullRequest;
    });

}
