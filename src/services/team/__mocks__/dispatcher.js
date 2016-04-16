export default function mock() {

  return {
    findTeamByPullRequest: sinon.stub(),
    findTeamNameByPullRequest: sinon.stub()
  };

}
