import { find } from 'lodash';

export default class AbstractTeam {

  /**
   * Find team member by login.
   * The member is not necessary to be an "active reviewer" returned from `getMembersForReview`
   *
   * @param {PullRequest} pullRequest
   * @param {String} login
   *
   * @return {Promise.<Developer>}
   */
  findTeamMember(pullRequest, login) {
    return this.getMembersForReview()
      .then(team => find(team, { login }));
  }

  /**
   * Returns "active" developers who may be chosen to review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Array.<Developer>>}
   */
  getMembersForReview(pullRequest) {
    return Promise.resolve([]);
  }

}
