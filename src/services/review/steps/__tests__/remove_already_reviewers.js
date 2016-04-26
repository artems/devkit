import service from '../../steps/remove_already_reviewers';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/review/steps/remove_already_reviewers', function () {

  let step, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    pullRequest.review = {
      reviewers: [
        { login: 'Hulk' },
        { login: 'Spider-Man' }
      ]
    };
  });

  it('should remove already reviewers', function (done) {
    const review = { members, pullRequest };

    const membersAltered = [
      { login: 'Thor', rank: 3 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 }
    ];

    step(review)
      .then(review => assert.sameDeepMembers(review.members, membersAltered))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step(review)
      .then(review => assert.sameDeepMembers(review.members, []))
      .then(done, done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    pullRequest.review.reviewers = [];

    const review = { members, pullRequest };
    const oldMembers = reviewMembersMock();

    step(review)
      .then(review => assert.sameDeepMembers(review.members, oldMembers))
      .then(done, done);
  });

});
