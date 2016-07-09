export default function mock(team, teamName) {

  return {
    addRoute: sinon.stub(),
    findTeamByPullRequest: sinon.stub().returns(team),
    findTeamNameByPullRequest: sinon.stub().returns(teamName)
  };

}
