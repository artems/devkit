import proxyquire from 'proxyquire';
import jabberMock from '../__mocks__/jabber';
import loggerMock from '../../logger/__mocks__/index';

describe('services/jabber', function () {

  let options, imports;
  let service, logger, jabber;

  beforeEach(function () {
    logger = loggerMock();
    jabber = jabberMock();

    options = {};
    imports = { logger };

    service = proxyquire('../index', {
      './jabber': {
        'default': jabber
      }
    }).default;
  });

  it('should try connect to jabber', function () {
    service(options, imports);

    assert.called(jabber.connect);
  });

  it('should close connection when shutdown', function () {
    const callback = sinon.stub();
    const jabberService = service(options, imports);

    jabberService.shutdown(callback);

    assert.calledWith(jabber.close, callback);
  });

});
