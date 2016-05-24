import service from '../index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import reviewMock from '../../review/__mocks__/index';
import pullRequestReviewMock from '../../pull-request-review/__mocks__/index';
import { pullRequestMock } from '../../model/collections/__mocks__/pull-request';

describe('service/plugin-autoassign', function () {

  let options, imports, payload, reviewResult;

  beforeEach(function () {

    options = {};

    imports = {
      events: eventsMock(),
      logger: loggerMock(),
      review: reviewMock(),
      'pull-request-review': pullRequestReviewMock()
    };

    payload = {
      pullRequest: pullRequestMock()
    };

    reviewResult = {
      members: ['Captain America', 'Hawkeye']
    };

    imports.events.on
      .withArgs('github:pull_request:opened').callsArgWith(1, payload);
    imports.events.on
      .withArgs('github:pull_request:synchronize').callsArgWith(1, payload);

    imports.review.choose
      .withArgs(1).returns(Promise.resolve(reviewResult));

  });

  it('should start review when someone open a new pull request', function (done) {

    service(options, imports);

    setTimeout(function () {
      assert.calledWithExactly(
        imports['pull-request-review'].updateReviewers, 1, reviewResult.members
      );
      done();
    }, 10);

  });

  it('should not restart if reviewer were selected before', function () {

    payload.pullRequest.review.reviewers = [{ login: 'Hulk' }];

    service(options, imports);

    assert.notCalled(imports['pull-request-review'].updateReviewers);

  });

});
