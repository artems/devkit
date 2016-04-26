import service from '../ignore';

import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/review/steps/ignore', function () {

  let step, members, pullRequest, options;

  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    options = { list: ['Captain America', 'Hulk', 'Thor'] };

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  it('should remove members from team which logins are in ignore list', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Hulk', value: -Infinity },
      { login: 'Thor', value: -Infinity },
      { login: 'Captain America', value: -Infinity }
    ];

    step(review, options)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review, options)
      .then(review => assert.sameDeepMembers(review.members, []))
      .then(done, done);
  });

  it('should do nothing if there are no ignore list', done => {
    const review = { members, pullRequest };

    step(review, {})
      .then(review => assert.sameDeepMembers(review.members, members))
      .then(done, done);
  });

});
