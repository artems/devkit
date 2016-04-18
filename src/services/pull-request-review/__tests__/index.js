import service from '../index';

import teamMock from '../../team/__mocks__/dispatcher';
import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import pullRequestReviewMock from '../__mocks__/index';

describe('services/pull-request-review', function () {

  let options, imports;
  let team, logger, events;

  beforeEach(function () {
    options = {};

    team = teamMock();
    logger = loggerMock();
    events = eventsMock();

    imports = { team: team, events, logger };
  });

  const methods = [
    'stopReview',
    'startReview',
    'approveReview',
    'updateReviewers'
  ];

  it('should be resolved to PullRequestAction', function () {
    const review = service(options, imports);

    methods.forEach(method => {
      assert.property(review, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = pullRequestReviewMock();

    methods.forEach(method => {
      assert.property(mock, method);
    });
  });

});

