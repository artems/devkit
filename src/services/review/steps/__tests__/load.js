import service from '../load';

import { reviewMembersMock } from '../../__mocks__/index';
import {
  pullRequestMock,
  pullRequestModelMock
} from '../../../model/collections/__mocks__/pull-request';

describe('services/reviewer-assignment/steps/load', function () {

  let members, pullRequest, PullRequestModel;
  let options, imports

  beforeEach(() => {
    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock();

    PullRequestModel.findInReviewByReviewer
      .returns(Promise.resolve([]));

    options = { max: 1 };
    imports = { 'pull-request-model': PullRequestModel };
  });

  it('should decrease rank if member has active reviews', function (done) {
    const review = { team: members, pullRequest };

    const activePull1 = {
      id: 1,
      review: {
        reviewers: [{ login: 'Black Widow' }, { login: 'Hulk' }]
      }
    };

    const activePull2 = {
      id: 2,
      review: {
        reviewers: [{ login: 'Hulk' }, { login: 'Batman' }]
      }
    };

    const membersAltered = [
      { login: 'Hulk', rank: 6 },
      { login: 'Thor', rank: 3 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Black Widow', rank: 9 },
      { login: 'Captain America', rank: 5 }
    ];

    PullRequestModel.findInReviewByReviewer
      .withArgs('Black Widow')
      .returns(Promise.resolve([activePull1]));

    PullRequestModel.findInReviewByReviewer
      .withArgs('Hulk')
      .returns(Promise.resolve([activePull1, activePull2]));

    const step = service({}, imports);

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, membersAltered))
      .then(done, done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    const review = { team: [], pullRequest };

    const step = service({}, imports);

    step(review, options)
      .then(review => assert.sameDeepMembers(review.team, []))
      .then(done, done);
  });

});
