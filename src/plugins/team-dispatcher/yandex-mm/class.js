import { cloneDeep, assign, flatten } from 'lodash';
import YandexStaffTeam from '../yandex/class';

export default class YandexMMStaffTeam extends YandexStaffTeam {

  constructor(staff, groupId, teams) {
    super(staff, groupId);

    this.teams = teams;
  }

  getTeam(pr) {
    const IMAGE_RE = /^IMAGESUI/;
    const VIDEO_RE = /^(VIDEOUI|MOBVIDEO)/;

    let prj;

    if (IMAGE_RE.test(pr.title)) {
      prj = 'images';
    }

    if (VIDEO_RE.test(pr.title)) {
      prj = 'video';
    }

    const groupId = prj ? this.teams[prj].groupId : this.groupId;

    return Promise.all(groupId.map(id => this.staff.getUsersInOffice(id)))
      .then(teams => {
        const resTeam = [];

        for (let i = 0; i < teams.length; i++) {
          const id = groupId[i];
          const team = teams[i];

          resTeam.push(team.map(user => this._updateTeamInfo(user, id)));
        }

        return cloneDeep(flatten(resTeam));
      });
  }

  _updateTeamInfo(user, groupId) {
    return assign(user, {
      groupId,
      mmTeam: this.teams.images.groupId.includes(groupId) ? 'images' : 'video'
    });
  }

}
