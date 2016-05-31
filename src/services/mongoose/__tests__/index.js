import proxyquire from 'proxyquire';
import loggerMock from '../../logger/__mocks__/index';

describe('services/mongoose', function () {

  let service, options, imports, connectionStub;

  beforeEach(function () {
    options = { host: 'localhost' };

    imports = {
      logger: loggerMock()
    };

    connectionStub = {
      on: sinon.stub().returnsThis(),
      close: sinon.stub()
    };

    service = proxyquire('../index', {
      mongoose: {
        createConnection: sinon.stub().returns(connectionStub)
      }
    }).default;

  });

  it('should be resolved to Mongoose', function (done) {
    connectionStub.on.withArgs('open').callsArg(1);

    service(options, imports)
      .then(mongoose => {
        assert.equal(mongoose, connectionStub);
        done();
      })
      .catch(done);

  });

  it('should be rejected on error', function (done) {
    connectionStub.on.withArgs('error').callsArg(1);

    service(options, imports)
      .then(() => assert.fail())
      .catch(() => done());

  });

  it('should call close when shutdown', function (done) {
    connectionStub.on.withArgs('open').callsArg(1);
    connectionStub.close.callsArg(0);

    service(options, imports)
      .then(mongoose => {
        mongoose.shutdown(done);
      })
      .catch(done);

  });

});
