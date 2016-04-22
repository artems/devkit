import service from '../total_number';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/reviewer-assignment/steps/total_number', function () {

  let step, options, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    options = { max: 2 };
  });

  it('should keep only `option.max` members', function (done) {
    const review = { team: members, pullRequest };

    const reviewers = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 }
    ];

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, reviewers))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { team: [], pullRequest };

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, []))
      .then(done, done);
  });

});
