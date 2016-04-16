import service from '../index';
import eventsMock from '../__mocks__/index';

describe('services/events', function () {

  const methods = [
    'on',
    'once',
    'emit',
    'addListener',
    'removeListener'
  ];

  it('should be resolved to EventEmitter', function () {
    const emitter = service();

    methods.forEach(function (method) {
      assert.property(emitter, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = eventsMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});
