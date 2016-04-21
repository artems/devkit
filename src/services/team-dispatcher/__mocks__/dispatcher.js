export default function mock(team, teamName) {

  return {
    findTeamByPullRequest: sinon.stub().returns(Promise.resolve(team)),
    findTeamNameByPullRequest: sinon.stub().returns(Promise.resolve(teamName))
  };

}
