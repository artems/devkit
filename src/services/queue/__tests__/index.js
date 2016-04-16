import service from '../index';

describe('services/queue', function () {

  it('should be resolved to Queue', function () {

    const options = {
      transports: []
    };

    const queue = service(options);

    assert.property(queue, 'dispatch');

  });

});
