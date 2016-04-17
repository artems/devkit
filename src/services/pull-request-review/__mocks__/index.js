export default function mock(pullRequest) {

  pullRequest.stopReview = sinon.stub().returns(Promise.resolve(pullRequest));
  pullRequest.startReview = sinon.stub().returns(Promise.resolve(pullRequest));
  pullRequest.approveReview = sinon.stub().returns(Promise.resolve(pullRequest));
  pullRequest.updateReviewers = sinon.stub().returns(Promise.resolve(pullRequest));

}
