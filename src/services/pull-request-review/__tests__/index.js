import service from '../index';

import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';
import pullRequestReviewMock from '../__mocks__/index';

describe('services/pull-request-review', function () {

  let options, imports;
  let logger, events, teamDispatcher;

  beforeEach(function () {
    options = {};

    logger = loggerMock();
    events = eventsMock();
    teamDispatcher = teamDispatcherMock();

    imports = { events, logger, 'team-dispatcher': teamDispatcher };
  });

  const methods = [
    'stopReview',
    'startReview',
    'approveReview',
    'updateReviewers'
  ];

  it('should be resolved to PullRequestReview', function () {
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

