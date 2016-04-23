import service from '../random';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/reviewer-assignment/steps/random', () => {

  let step, members, pullRequest, options;

  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    options = { max: 2 };
  });

  it('should add random value to rank to each member', done => {
    const review = { team: members, pullRequest };

    const oldMembers = reviewMembersMock();

    step(review, options)
      .then(review => {
        assert.isAbove(review.team[0].rank, 9);
        assert.isBelow(review.team[0].rank, 13);

        assert.isAbove(review.team[1].rank, 4);
        assert.isBelow(review.team[1].rank, 8);

        assert.isAbove(review.team[2].rank, 2);
        assert.isBelow(review.team[2].rank, 6);

        assert.notDeepEqual(review.team, oldMembers);
      })
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { team: [], pullRequest };

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, []))
      .then(done, done);
  });

});
