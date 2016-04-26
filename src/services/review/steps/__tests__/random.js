import service from '../random';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/review/steps/random', () => {

  let step, members, pullRequest, options;

  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    options = { max: 2 };
  });

  it('should add random value to rank to each member', done => {
    const review = { members, pullRequest };

    const oldMembers = reviewMembersMock();

    step(review, options)
      .then(review => {
        assert.isAbove(review.members[0].rank, 9);
        assert.isBelow(review.members[0].rank, 13);

        assert.isAbove(review.members[1].rank, 4);
        assert.isBelow(review.members[1].rank, 8);

        assert.isAbove(review.members[2].rank, 2);
        assert.isBelow(review.members[2].rank, 6);

        assert.notDeepEqual(review.members, oldMembers);
      })
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review, options)
      .then(review => assert.sameDeepMembers(review.members, []))
      .then(done, done);
  });

});
