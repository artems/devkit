import service from '../help';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';

describe('services/notification/help', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = sinon.stub().returns(Promise.resolve());

    pullRequest = pullRequestMock();

    payload = { pullRequest, comment: { user: { login: 'Black Widow' } } };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:command:help', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:command:help');
  });

  it('should send help message to the author', function () {
    pullRequest.user = { login: 'Black Widow' };

    service(options, imports);

    assert.calledWith(notification, 'Black Widow');
  });

});
