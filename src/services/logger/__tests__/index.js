import service from '../index';
import loggerMock from '../__mocks__/index';

describe('services/logger', function () {

  const methods = [
    'log',
    'info',
    'warn',
    'error'
  ];

  it('should be resolved to Logger', function () {
    const logger = service({});

    methods.forEach(function (method) {
      assert.property(logger, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = loggerMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});
