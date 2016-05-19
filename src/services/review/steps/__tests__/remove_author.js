import service from '../../steps/remove_author';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/review/steps/remove_author', () => {

  let step, members, pullRequest;

  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  it('should remove author from team', done => {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Black Widow', rank: -Infinity }
    ];

    step(review)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review)
      .then(actual => assert.deepEqual(actual, []))
      .then(done, done);
  });

});
