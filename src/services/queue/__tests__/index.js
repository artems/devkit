import service from '../index';

describe('services/queue', function () {

  it('should be resolved to Queue', function () {

    const queue = service();

    assert.property(queue, 'dispatch');

  });

});
