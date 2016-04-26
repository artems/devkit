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

    const membersAltered = [
      { login: 'Hulk', rank: 8 },
      { login: 'Thor', rank: 3 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Captain America', rank: 5 }
    ];

    step(review)
      .then(review => assert.sameDeepMembers(review.members, membersAltered))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review)
      .then(review => assert.sameDeepMembers(review.members, []))
      .then(done, done);
  });

});
