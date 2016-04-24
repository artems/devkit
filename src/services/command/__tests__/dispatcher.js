import CommandDispatcher from '../dispatcher';

describe('services/command/dispatcher', function () {

  it('should use an empty array if commands list is not passed', function () {
    const dispatcher = new CommandDispatcher();

    assert.isArray(dispatcher.store);
    assert.lengthOf(dispatcher.store, 0);
  });

  describe('#dispatch', function () {
    const payload = {};
    const comment = 'first line\n/fireball\nthird line';

    let h1, h2, h3, h4;

    beforeEach(function () {
      h1 = sinon.stub().returns(Promise.resolve());
      h2 = sinon.stub().returns(Promise.resolve());
      h3 = sinon.stub().returns(Promise.resolve());
      h4 = sinon.stub().returns(Promise.reject(new Error()));
    });

    it('should dispatch each line of user comment to each command', function (done) {
      const store = [
        {
          test: /.*/,
          handlers: [h1, h2]
        },
        {
          test: /\/fireball/,
          handlers: [h3]
        }
      ];

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledThrice(h1);
          assert.calledThrice(h2);
          assert.calledOnce(h3);
        })
        .then(done, done);
    });

    it('should return rejected promise if any command is rejected', function (done) {
      const store = [
        {
          test: /.*/,
          handlers: [h1, h4]
        },
        {
          test: /\/fireball/,
          handlers: [h3]
        }
      ];

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload)
        .then(() => { throw new Error('should reject promise'); })
        .catch(error => assert.notMatch(error.message, /should reject promise/))
        .then(done, done);
    });

  });

});
