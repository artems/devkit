import teamMock from './team';
import teamManagerMock from './class';

export function membersMock() {
  return [
    { login: 'Black Panther' },
    { login: 'Black Widow' },
    { login: 'Captain America' },
    { login: 'Captain Marvel' },
    { login: 'Falcon' },
    { login: 'Hank Pym' },
    { login: 'Hawkeye' },
    { login: 'Hulk' },
    { login: 'Iron Man' },
    { login: 'Luke Cage' },
    { login: 'Quicksilver' },
    { login: 'Scarlet Witch' },
    { login: 'Spider-Woman' },
    { login: 'Thor' },
    { login: 'Vision' },
    { login: 'Wasp' },
    { login: 'Wonder Man' }
  ];
}

export default function (teamName, member) {
  return teamManagerMock(teamMock(member), teamName);
}
