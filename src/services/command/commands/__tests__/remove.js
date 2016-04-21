import { clone } from 'lodash';

import parseLogins from '../../../parse-logins/parse-logins';

import service from '../../commands/remove';
import { getParticipant } from '../../commands/remove';
import { mockReviewers } from '../../__mocks__/index';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';

describe.skip('services/command/remove', () => {

  describe('#getParticipant', () => {

    it('should get participant from command like /remove @username', () => {
      assert.equal(getParticipant('/remove @username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n/remove @username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' /remove @username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like /remove username', () => {
      assert.equal(getParticipant('/remove username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n/remove username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' /remove username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like -@username', () => {
      assert.equal(getParticipant('-@username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n-@username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' -@username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like -username', () => {
      assert.equal(getParticipant('-username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n-username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' -username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like -user-name', () => {
      assert.equal(getParticipant('-user-name', parseLogins), 'user-name');
      assert.equal(getParticipant('Text \n-user-name\nOther text', parseLogins), 'user-name');
      assert.equal(getParticipant(' -user-name and some more text\nOther text', parseLogins), 'user-name');
    });

    it('should get participant from command like /remove user-name', () => {
      assert.equal(getParticipant('/remove user-name', parseLogins), 'user-name');
      assert.equal(getParticipant('Text \n/remove user-name\nOther text', parseLogins), 'user-name');
      assert.equal(getParticipant(' /remove user-name and some more text\nOther text', parseLogins), 'user-name');
    });
  });

  describe('#removeCommand', () => {
    let command, pullRequest, payload, action, events, logger, comment; // eslint-disable-line

    beforeEach(() => {
      action = pullRequestReviewMock(pullRequest);
      events = { emit: sinon.stub() };
      logger = { info: sinon.stub() };
      comment = {
        user: {
          login: 'd4rkr00t'
        }
      };
      pullRequest = {
        id: 1,
        get: sinon.stub().returns(clone(mockReviewers))
      };

      payload = { pullRequest, comment };

      command = service({ min: 1 }, { action, logger, events, parseLogins });
    });

    it('should be rejected if user is not in reviewers list', done => {
      command('/remove Hawkeye', payload).catch(() => done());
    });

    it('should be rejected if there only 1 reviewer in reviewers list', done => {
      pullRequest.get = sinon.stub().returns(['']);

      command('/remove Hulk', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewers list', done => {
      command('/remove Hulk', payload).then(() => {
        assert.called(action.updateReviewers);
        done();
      }, done);
    });

    it('should emit `review:command:remove` event', done => {
      command('/remove Hulk', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:remove');

        done();
      }, done);
    });

  });

});
