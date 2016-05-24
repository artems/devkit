import service from '../complete';
import eventsMock from '../../../events/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';

describe('services/notification/complete', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = sinon.stub().returns(Promise.resolve());

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:complete', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:complete');
  });

  it('should send complete message to the author', function () {
    pullRequest.user = { login: 'Black Widow' };

    service(options, imports);

    assert.calledWith(notification, 'Black Widow');
  });

  it('should log errors', function (done) {
    pullRequest.user = { login: 'Black Widow' };

    notification.returns(Promise.reject(new Error()));

    service(options, imports);

    setTimeout(() => {
      assert.called(logger.error);
      done();
    }, 0);
  });

});
