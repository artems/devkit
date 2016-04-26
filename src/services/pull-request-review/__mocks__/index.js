export default function mock(pullRequest) {

  return {
    stopReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    startReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    approveReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    changesNeeded: sinon.stub().returns(Promise.resolve(pullRequest)),
    updateReviewers: sinon.stub().returns(Promise.resolve(pullRequest))
  };

}
