import minimatch from 'minimatch';

export default class TeamDispatcher {

  /**
   * @constructor
   *
   */
  constructor() {
    this.routes = [];
  }

  /**
   * Add route for team
   *
   * @param {Object} team
   * @param {String} name
   * @param {Array.<String>} pattern
   */
  addRoute(team, name, pattern) {
    [].concat(pattern).forEach(pattern => {
      this.routes.push({ team, name, pattern });
    });
  }

  /**
   * Match route and then return one property of them.
   *
   * @protected
   * @param {PullRequest} pullRequest
   * @param {String} property
   *
   * @return {*}
   */
  find(pullRequest, property) {
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      if (this.matchRoute(route.pattern, pullRequest)) {
        return route[property];
      }
    }

    return null;
  }

  /**
   * Return team of matched route
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Object}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest, 'team');
  }

  /**
   * Return name of matched route
   *
   * @param {PullRequest} pullRequest
   *
   * @return {String}
   */
  findTeamNameByPullRequest(pullRequest) {
    return this.find(pullRequest, 'name');
  }

  /**
   * @protected
   * @param {String} pattern
   * @param {PullRequest} pullRequest
   *
   * @return {Boolean}
   */
  matchRoute(pattern, pullRequest) {
    if (pattern === '*') {
      return true;
    }

    return minimatch(pullRequest.get('repository.full_name'), pattern);
  }

}
