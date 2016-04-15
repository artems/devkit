export default function dispatcherMock() {

  return {
    findTeamByPullRequest: sinon.stub(),
    findTeamNameByPullRequest: sinon.stub()
  };

}
