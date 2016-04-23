import service from '../ignore';

import { pullRequestMock } from '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/reviewer-assignment/steps/ignore', function () {

  let step, members, pullRequest, options;

  beforeEach(() => {
    step = service();

    members = reviewMembersMock();

    options = { list: ['Captain America', 'Hulk', 'Thor'] };

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  it('should remove members from team which logins are in ignore list', function (done) {
    const review = { team: members, pullRequest };

    const membersAltered = [
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Black Widow', rank: 10 }
    ];

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, membersAltered))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { team: [], pullRequest };

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, []))
      .then(done, done);
  });

  it('should do nothing if there are no ignore list', done => {
    const review = { team: members, pullRequest };

    step(review, {})
      .then(review => assert.sameDeepMembers(review.team, members))
      .then(done, done);
  });

});
