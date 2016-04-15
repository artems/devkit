import { find } from 'lodash';

export default class Team {

  /**
   * Find team member by login.
   * The member is not necessary to be an "active reviewer".
   *
   * @param {PullRequest} pullRequest
   * @param {String} login
   *
   * @return {Developer}
   */
  findTeamMember(pullRequest, login) {
    return this.getMembersForReview()
      .then(team => find(team, { login }));
  }

  /**
   * Returns "active" developers who will be chosen to review
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Array.<Developer>}
   */
  getMembersForReview(pullRequest) {
    return Promise.resolve([]);
  }

}
