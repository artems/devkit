import service from '../index';
import eventsMock from '../../../services/events/__mocks__/index';
import loggerMock from '../../../services/logger/__mocks__/index';
import reviewMock from '../../../services/review/__mocks__/index';
import { pullRequestMock } from '../../../services/model/collections/__mocks__/pull-request';
import pullRequestReviewMock from '../../../services/pull-request-review/__mocks__/index';

describe('plugins/autoassign', function () {

  let options, imports;
  let payload, pullRequest, reviewResult;

  beforeEach(function () {

    options = {};

    imports = {
      events: eventsMock(),
      logger: loggerMock(),
      review: reviewMock(),
      'pull-request-review': pullRequestReviewMock()
    };

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    reviewResult = {
      members: ['Captain America', 'Hawkeye']
    };

    imports.events.on
      .withArgs('github:pull_request:opened').callsArgWith(1, payload);

    imports.review.choose
      .withArgs(1).returns(Promise.resolve(reviewResult));

  });

  it('should start review when someone open a new pull request', function (done) {

    service(options, imports);

    setTimeout(() => {
      assert.calledWithExactly(
        imports['pull-request-review'].updateReviewers,
        payload.pullRequest,
        reviewResult.members
      );
      done();
    }, 0);

  });

  it('should not restart review if reviewers were selected before', function (done) {

    pullRequest.review.reviewers = [{ login: 'Hulk' }];

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(imports['pull-request-review'].updateReviewers);
      done();
    }, 0);

  });

});
