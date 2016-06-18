export default function mock(pullRequest) {

  const promise = () => Promise.resolve(pullRequest);

  if (pullRequest) {
    pullRequest.hasReviewers = sinon.stub();
  }

  return {
    stopReview: sinon.stub().returns(promise()),
    startReview: sinon.stub().returns(promise()),
    approveReview: sinon.stub().returns(promise()),
    changesNeeded: sinon.stub().returns(promise()),
    updateReview: sinon.stub().returns(promise())
  };

}
