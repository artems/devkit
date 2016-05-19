import service from '../total_number';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/review/steps/total_number', function () {

  let step, options, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    options = { max: 2 };
  });

  it('should keep only `option.max` members', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Black Widow', rank: Infinity },
      { login: 'Captain America', rank: Infinity }
    ];

    step(review, options)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step(review, options)
      .then(actual => assert.deepEqual(actual, []))
      .then(done, done);
  });

});
