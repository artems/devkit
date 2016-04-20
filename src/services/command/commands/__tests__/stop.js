import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';

import service from '../../commands/stop';

describe.skip('services/command/stop', () => {
  let action, pullRequest, team, events, payload, logger, comment, command; // eslint-disable-line

  beforeEach(() => {
    events = { emit: sinon.stub() };
    logger = { info: sinon.stub() };

    pullRequest = {
      state: 'open',
      user: { login: 'd4rkr00t' },
      review: { status: 'inprogress' }
    };

    comment = { user: { login: 'd4rkr00t' } };

    action = pullRequestReviewMock(pullRequest);

    command = service({}, { action, team, events, logger });

    payload = { pullRequest, comment };
  });

  it('should be rejected if pr is closed', done => {
    payload.pullRequest.state = 'closed';
    command('/stop', payload).catch(() => done());
  });

  it('should be rejected if triggered by not an author', done => {
    payload.comment.user.login = 'blablabla';
    command('/stop', payload).catch(() => done());
  });

  it('should be rejected if pull request review not in progress', done => {
    payload.pullRequest.review.status = 'complete';
    command('/stop', payload).catch(() => done());
  });

  it('should trigger review:command:stop event', done => {
    command('/stop', payload)
      .then(() => {
        assert.calledWith(events.emit, 'review:command:stop');
        done();
      })
      .catch(done);
  });
});
