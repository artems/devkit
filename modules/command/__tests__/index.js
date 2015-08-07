'use strict';

import CommandDispatcher from '../../command';

describe('modules/command', function () {

  it('should return promise', function (done) {
    const h1 = sinon.stub().returns(() => Promise.resolve());
    const store = [{ test: /.*/, handlers: [h1] }];
    const payload = { comment: { body: '.' } };
    const dispatcher = new CommandDispatcher(store);

    dispatcher.dispatch(payload).then(() => {
      assert.called(h1);
      done();
    });

  });

  it('should dispatch each line of user comment to each command', function (done) {
    const h1 = sinon.stub().returns(() => Promise.resolve());
    const h2 = sinon.stub().returns(() => Promise.resolve());
    const h3 = sinon.stub().returns(() => Promise.resolve());

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

    const payload = {
      comment: {
        body: `first line\n/fireball\nthird line`
      }
    };

    const dispatcher = new CommandDispatcher(store);

    dispatcher.dispatch(payload).then(() => {
      assert.calledThrice(h1);
      assert.calledThrice(h2);
      assert.calledOnce(h3);
      done();
    });
  });

  it('should not throw an error if commands does not provied', function (done) {
    const payload = {
      comment: {
        body: `first line\n/fireball\nthird line`
      }
    };

    const dispatcher = new CommandDispatcher();

    dispatcher.dispatch(payload).then(done);
  });

});
