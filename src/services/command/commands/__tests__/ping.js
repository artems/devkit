import service from '../ping';

describe.skip('services/command/ping', () => {

  let command, payload, logger, events; // eslint-disable-line

  beforeEach(() => {
    events = { emit: sinon.stub() };
    logger = { info: sinon.stub() };

    command = service({}, { logger, events });

    payload = {
      pullRequest: {
        state: 'open',
        user: { login: 'd4rkr00t' }
      },
      comment: { user: { login: 'd4rkr00t' } }
    };
  });

  it('should be rejected if pr is closed', done => {
    payload.pullRequest.state = 'closed';
    command('/ping', payload).catch(() => done());
  });

  it('should be rejected if triggered by not an author', done => {
    payload.comment.user.login = 'blablabla';
    command('/ping', payload).catch(() => done());
  });

  it('should trigger review:command:ping event', done => {
    command('/ping', payload)
      .then(() => {
        assert.calledWith(events.emit, 'review:command:ping');
        done();
      })
      .catch(done);
  });

});
