import ReviewerAssignment from '../class';

import loggerMock from '../../logger/__mocks__/index';

import teamMock from '../../team-dispatcher/__mocks__/team';
import { members } from '../../team-dispatcher/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';
import { pullRequestMock } from
  '../../model/collections/__mocks__/pull-request';

describe('services/review/ReviewerAssignment', function () {

  let logger, team, teamDispatcher, pullRequest;
  let imports, options;

  beforeEach(function () {

    logger = loggerMock();

    team = teamMock();
    team.getMembersForReview.returns(Promise.resolve(members()));

    teamDispatcher = teamDispatcherMock();
    teamDispatcher.findTeamByPullRequest.returns(team);

    pullRequest = pullRequestMock();

    options = {
      steps: ['step1', 'step2']
    };

    imports = { logger, 'team-dispatcher': teamDispatcher };

  });

  describe('#getSteps', function () {

    let review;

    beforeEach(function () {
      imports['reviewer-assignment-step-step1'] = '1';
      imports['reviewer-assignment-step-step2'] = '2';

      review = new ReviewerAssignment(options, imports);
    });

    it('should return rejected promise if there are no steps for team', function (done) {
      delete options.steps;

      review.getSteps({ team, pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /steps/))
        .then(done, done);
    });

    it('should return rejected promise if there is no step with given name', function (done) {
      delete imports['reviewer-assignment-step-step2'];

      review.getSteps({ team, pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /no step/))
        .then(done, done);
    });

    it('should return resolved promise with steps array', function (done) {
      review.getSteps({ team, pullRequest })
        .then(resolved => {
          assert.sameDeepMembers(resolved, [
            { name: 'step1', ranker: '1' },
            { name: 'step2', ranker: '2' }
          ]);
        })
        .then(done, done);
    });

  });

  describe('#stepsQueue', function () {

    let review;

    beforeEach(function () {
      review = new ReviewerAssignment(options, imports);
    });

    it('should iterate through steps', function (done) {
      const order = [];

      const createStep = function (name) {
        return {
          name: name,
          ranker: function (review) {
            order.push(name);
            return Promise.resolve(review);
          }
        };
      };

      const _steps = [
        createStep('1'),
        createStep('2'),
        createStep('3'),
        createStep('4')
      ];

      review.stepsQueue({ team, steps: _steps, members: [] })
        .then(() => assert.deepEqual(order, ['1', '2', '3', '4']))
        .then(done, done);
    });

    describe('each step', function () {

      it('should receive a team and a pullRequest', function (done) {
        const stub = sinon.stub();

        const steps = [
          {
            name: 'step',
            ranker: function (review) {
              stub();

              assert.equal(review.pullRequest, pullRequest);

              assert.sameDeepMembers(review.members, members());

              return Promise.resolve(review);
            }
          }
        ];

        review.stepsQueue({ team, steps, pullRequest, members: members() })
          .then(() => assert.called(stub))
          .then(done, done);
      });

      it('should be able to change the team', function (done) {
        const stub1 = sinon.stub();
        const stub2 = sinon.stub();

        const steps = [
          {
            name: 'step1',
            ranker: function (review) {
              stub1();
              review.members.splice(0, 5);
              return Promise.resolve(review);
            }
          },
          {
            name: 'step2',
            ranker: function (review) {
              stub2();
              assert.lengthOf(review.members, 12);
              return Promise.resolve(review);
            }
          }
        ];

        review.stepsQueue({ team, steps, pullRequest, members: members() })
          .then(() => {
            assert.called(stub1);
            assert.called(stub2);
          })
          .then(done, done);
      });

    });

  });

  describe('#review', function () {

    let review;

    beforeEach(function () {

      imports['reviewer-assignment-step-step1'] = function (review) {
        return Promise.resolve({ rank: 1, login: 'Spider-Man' });
      };
      imports['reviewer-assignment-step-step2'] = function (review) {
        return Promise.resolve({ rank: 2, login: 'Black Widow' });
      };

      review = new ReviewerAssignment(options, imports);

    });

    it('should return rejected pormise if team is not found', function (done) {
      teamDispatcher.findTeamByPullRequest.returns(null);

      review.choose(pullRequest)
        .then(() => { throw new Error('should reject promise'); })
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

    it('should return resolved pormise with chosen reviewers', function (done) {
      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.members);
          assert.isAbove(review.members.length, 0);
          assert.isArray(review.ranks);
          assert.isAbove(review.ranks.length, 0);
        })
        .then(done, done);
    });

    it('should return resolved pormise with chosen reviewers ordered by rank', function (done) {

      imports['reviewer-assignment-step-step1'] = function (review) {
        return Promise.resolve([
          { rank: 1, login: 'Spider-Man' },
          { rank: Infinity, login: 'Thor' }
        ]);
      };

      imports['reviewer-assignment-step-step2'] = function (review) {
        return Promise.resolve([
          { rank: -Infinity, login: 'Hulk' },
          { rank: 2, login: 'Black Widow' },
          { rank: 0, login: 'Thor' }
        ]);
      };

      review.choose(pullRequest)
        .then(review => {
          assert.equal(review.ranks[0].login, 'Thor');
          assert.equal(review.ranks[1].login, 'Black Widow');
          assert.equal(review.ranks[2].login, 'Spider-Man');
          assert.equal(review.ranks[3].login, 'Hulk');
        })
        .then(done, done);
    });

    it('should return resolved pormise even when reviewers are not selected', function (done) {
      team.getMembersForReview.returns(Promise.resolve([]));

      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.members);
          assert.lengthOf(review.members, 0);
        })
        .then(done, done);
    });

  });

});
