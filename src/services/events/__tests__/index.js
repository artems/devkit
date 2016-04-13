import service from '../index';
import eventsMock from '../__mocks__/index';

describe('services/events', function () {

  it('should be resolved to EventEmitter', function () {

    const emitter = service();

    assert.property(emitter, 'on');
    assert.property(emitter, 'once');
    assert.property(emitter, 'emit');
    assert.property(emitter, 'addListener');
    assert.property(emitter, 'removeListener');

  });

  it('the mock object should have the same methods', function () {
    const mock = eventsMock();

    assert.property(mock, 'on');
    assert.property(mock, 'once');
    assert.property(mock, 'emit');
    assert.property(mock, 'addListener');
    assert.property(mock, 'removeListener');

  });

});
