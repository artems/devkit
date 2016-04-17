import service from '../index';

import teamMock from '../../team/__mocks__/dispatcher';
import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import { pullRequestModelMock } from '../../model/collections/__mocks__/pull-request';

describe('services/pull-request-action', function () {

  let options, imports;
  let team, logger, events, PullRequestModel;

  beforeEach(function () {
    options = {};

    team = teamMock();
    logger = loggerMock();
    events = eventsMock();
    PullRequestModel = pullRequestModelMock();

    imports = { team: team, events, logger, 'pull-request-model': PullRequestModel };

  });

  it('should be resolved to PullRequestAction', function () {

    const action = service(options, imports);

    assert.property(action, 'stopReview');
    assert.property(action, 'startReview');
    assert.property(action, 'approveReview');
    assert.property(action, 'updateReviewers');

  });

});
