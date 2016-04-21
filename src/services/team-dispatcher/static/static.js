import { cloneDeep } from 'lodash';
import Team from '../team';

export default class StaticTeam extends Team {

  /**
   * @constructor
   *
   * @param {Array.<Developer>} members - array of team members
   */
  constructor(members) {
    super();

    if (!Array.isArray(members)) {
      throw new Error('Members should be an array');
    }

    if (members.length === 0) {
      throw new Error('Passed an empty array of members');
    }

    this.members = members;
  }

  /**
   * @override
   */
  getMembersForReview() {
    return Promise.resolve(cloneDeep(this.members));
  }

}
