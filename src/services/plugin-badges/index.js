import ReviewBadgeBuilder from './class';

export default function (options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new ReviewBadgeBuilder(options.url);

  /**
   * Call method for updating pull request body with review badges.
   *
   * @param {Object} payload
   */
  function updateReviewBadges(payload) {
    const pullRequest = payload.pullRequest;
    const badgeContent = builder.build(payload.pullRequest.review);

    queue.dispatch('pull-request#' + pullRequest.id, () => {
      pullRequestGitHub.setBodySection(
        pullRequest, 'review:badge', badgeContent, 100
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    });
  }

  // Subscribe on events for creating review badges.
  events.on('review:updated', updateReviewBadges);
  events.on('review:started', updateReviewBadges);
  events.on('review:approved', updateReviewBadges);
  events.on('review:complete', updateReviewBadges);

  return builder;

}
