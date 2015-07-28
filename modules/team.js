import minimatch from 'minimatch';

export default class Team {

  /**
   * @constructor
   *
   * @param {Array<TeamRoute>} routes
   */
  constructor(routes) {
    this.routes = routes || [];
  }

  /**
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Array<Developer>}
   */
  findByPullRequest(pullRequest) {
    for (let i = 0; i < this.route.length; i++) {
      const route = this.routes[i];
      if (this.matchRoute(route.pattern, pullRequest)) {
        return rule.source.getTeam(pullRequest);
      }
    }
  }

  matchRoute(pattern, pullRequest) {
    if (pattern === '*') {
      return true;
    }

    return minimatch(pullRequest.repo.full_name, pattern);
  }

}
