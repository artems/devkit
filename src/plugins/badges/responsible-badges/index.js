import { pluck } from 'lodash';
import ResponsibleBadgeBuilder from './class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('badges');
  const componentsAPI = imports['components-api'];
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new ResponsibleBadgeBuilder(options.url);

  /**
   * Call method for updating pull request body with responsible badges.
   *
   * @param {Object} payload
   */
  function updateResponsibleBadges(payload) {
    const pullRequest = payload.pullRequest;

    const files = pluck(pullRequest.files, 'filename');

    componentsAPI
      .getResponsibles(null, { files }, 3600 * 24)
      .then(responsibles => {
        const badgeContent = builder.build(responsibles);

        if (badgeContent) {
          queue.dispatch('pull-request#' + pullRequest.id, () => {
            pullRequestGitHub.setBodySection(
              pullRequest, 'responsible:badge', badgeContent, 50
            );
            return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
          });
        }
      })
      .catch(logger.error.bind(logger));
  }

  // Subscribe on events for creating responsible badges.
  events.on('review:updated', updateResponsibleBadges);
  events.on('review:started', updateResponsibleBadges);
  events.on('review:update_badges', updateResponsibleBadges);
  events.on('github:pull_request:synchronize', updateResponsibleBadges);

  return {};

}
