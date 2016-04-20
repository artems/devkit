import { clone } from 'lodash';

import parseLogins from '../../../parse-logins/parse-logins';

import service from '../add';
import { getParticipant } from '../add';
import { mockReviewers } from '../../__mocks__/index';
import pullRequestReviewMock from '../../../pull-request-review/__mocks__/index';
import teamMock from '../../../team/__mocks__/team';
import teamDispatcherMock from '../../../team/__mocks__/dispatcher';

describe.skip('services/command/add', () => {

  describe('#getParticipant', () => {

    it('should get participant from command like /add @username', () => {
      assert.equal(getParticipant('/add @username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n/add @username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' /add @username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like /add username', () => {
      assert.equal(getParticipant('/add username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n/add username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' /add username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like +@username', () => {
      assert.equal(getParticipant('+@username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n+@username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' +@username and some more text\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like +username', () => {
      assert.equal(getParticipant('+username', parseLogins), 'username');
      assert.equal(getParticipant('Text \n+username\nOther text', parseLogins), 'username');
      assert.equal(getParticipant(' +username and some more text\nOther text', parseLogins), 'username');
    });
  });

  describe('#addCommand', () => {
    let command, pullRequest, payload, action, events, logger, team, _team, comment; // eslint-disable-line

    beforeEach(() => {
      team = teamDispatcherMock();
      _team = teamMock();

      team.findTeamByPullRequest.returns(Promise.resolve(_team));
      _team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

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

      command = service({}, { team, action, logger, events, parseLogins });
      payload = { pullRequest, comment };
    });

    it('should be rejected if user is already in reviewers list', done => {
      command('/add Hulk', payload).catch(() => done());
    });

    it('should be rejected if no such user in team', done => {
      _team.findTeamMember.returns(Promise.resolve(null));

      command('/add Hulfk', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewer', done => {
      command('/add Hawkeye', payload).then(() => {
        const resultReviewers = clone(mockReviewers);
        resultReviewers.push({ login: 'Hawkeye' });

        assert.called(action.updateReviewers);
        assert.deepEqual(pullRequest.get('review.reviewers'), resultReviewers);

        done();
      }, done);
    });

    it('should emit `review:command:add` event', done => {
      command('/add Hawkeye', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:add');

        done();
      }, done);
    });

  });

});
