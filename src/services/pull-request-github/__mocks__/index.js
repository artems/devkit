export default function mock() {

  return {
    loadPullRequestFromGitHub: sinon.stub(),
    savePullRequestToDatabase: sinon.stub(),
    updatePullRequestOnGitHub: sinon.stub(),
    loadPullRequestFiles: sinon.stub(),
    syncPullRequest: sinon.stub(),
    setBodySection: sinon.stub()
  };

}
