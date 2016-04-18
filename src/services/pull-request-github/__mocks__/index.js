export default function mock(pullRequest) {

  const promise = Promise.resolve(pullRequest);

  pullRequest.loadPullRequestFromGitHub = sinon.stub().returns(promise);
  pullRequest.updatePullRequestOnGitHub = sinon.stub().returns(promise);
  pullRequest.loadPullRequestFiles = sinon.stub().returns(Promise.resolve([]));
  pullRequest.syncPullRequestWithGitHub = sinon.stub().returns(promise);
  pullRequest.savePayloadFromGitHub = sinon.stub().returns(promise);
  pullRequest.setBodySection = sinon.stub();

}
