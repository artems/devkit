import service from '../index';
import loggerMock from '../__mocks__/index';

describe('services/logger', function () {

  it('should be resolved to Logger', function () {

    const options = {
      transports: []
    };

    const logger = service(options);

    assert.property(logger, 'log');
    assert.property(logger, 'info');
    assert.property(logger, 'warn');
    assert.property(logger, 'error');

  });

  it('the mock object should have the same methods', function () {
    const mock = loggerMock();

    assert.property(mock, 'log');
    assert.property(mock, 'info');
    assert.property(mock, 'warn');
    assert.property(mock, 'error');

  });

});
