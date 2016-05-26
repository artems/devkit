import { map, flatten } from 'lodash';
import YandexMMStaffTeam from './class';

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];

  const teams = {
    images: imports['team-mm-images-staff'],
    video: imports['team-mm-video-staff']
  };

  const groups = flatten(map(teams, (team) => team.groupId));

  const service = new YandexMMStaffTeam(staff, groups, teams);

  return service;

}
