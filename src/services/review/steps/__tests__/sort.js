import service from '../../steps/sort';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/reviewer-assignment/steps/sort', () => {

  let step, members, pullRequest;
  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();
  });

  it('should sort members by rank descending', done => {
    const review = { team: members, pullRequest };

    const membersSorted = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Captain America', rank: 5 },
      { login: 'Thor', rank: 3 },
      { login: 'Hawkeye', rank: 3 }
    ];

    step(review)
      .then(review => assert.deepEqual(review.team, membersSorted))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { team: [], pullRequest };

    step(review)
      .then(review => assert.sameDeepMembers(review.team, []))
      .then(done, done);
  });

});