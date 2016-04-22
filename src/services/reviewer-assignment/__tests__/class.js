import ReviewerAssignment from '../class';

import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';

import teamMock from '../../team-dispatcher/__mocks__/team';
import { members } from '../../team-dispatcher/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';
import { pullRequestMock } from
  '../../model/collections/__mocks__/pull-request';

describe('services/reviewer-assignment/ReviewerAssignment', function () {

  let model, logger, team, teamDispatcher, pullRequest;
  let imports, options;

  beforeEach(function () {

    model = modelMock();
    logger = loggerMock();

    team = teamMock();
    team.getMembersForReview.returns(Promise.resolve(members()));

    teamDispatcher = teamDispatcherMock();
    teamDispatcher.findTeamByPullRequest.returns(Promise.resolve(team));
    teamDispatcher.findTeamNameByPullRequest.returns('Avengers');

    pullRequest = pullRequestMock();

    options = {};

    imports = { logger, 'team-dispatcher': teamDispatcher };

  });

  describe('#getSteps', function () {

    let review;

    beforeEach(function () {

      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1', 'step2']
          }
        }
      };

      imports['reviewer-assignment-step-step1'] = '1';
      imports['reviewer-assignment-step-step2'] = '2';

      review = new ReviewerAssignment(options, imports);

    });

    it('should return rejected promise if team is not found', function (done) {
      teamDispatcher.findTeamNameByPullRequest.returns(null);

      review.getSteps({ pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /not found/))
        .then(done, done);
    });

    it('should return rejected promise if there are no steps for team', function (done) {
      teamDispatcher.findTeamNameByPullRequest.returns('team');

      review.getSteps({ pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /steps/))
        .then(done, done);
    });

    it('should return rejected promise if there is no step with given name', function (done) {
      delete imports['reviewer-assignment-step-step2'];

      review.getSteps({ pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /no step/))
        .then(done, done)
    });

    it('should return resolved promise with steps array', function (done) {
      review.getSteps({ pullRequest })
        .then(resolved => {
          assert.sameDeepMembers(resolved, [
            { name: 'step1', ranker: '1' },
            { name: 'step2', ranker: '2' }
          ])
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

      review.stepsQueue({ steps: _steps, team: [] })
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

              assert.sameDeepMembers(review.team, members());

              return Promise.resolve(review);
            }
          }
        ];

        review.stepsQueue({ steps, pullRequest, team: members() })
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
              review.team.splice(0, 5);
              return Promise.resolve(review);
            }
          },
          {
            name: 'step2',
            ranker: function (review) {
              stub2();
              assert.lengthOf(review.team, 12);
              return Promise.resolve(review);
            }
          }
        ];

        review.stepsQueue({ steps, pullRequest, team: members() })
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

      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1', 'step2']
          }
        }
      };

      imports['reviewer-assignment-step-step1'] = function (review) {
        return Promise.resolve(review)
      };
      imports['reviewer-assignment-step-step2'] = function (review) {
        return Promise.resolve(review)
      };

      review = new ReviewerAssignment(options, imports);

    });

    it('should return resolved pormise with chosen reviewers', function (done) {
      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.team);
          assert.isAbove(review.team.length, 0);
        })
        .then(done, done);
    });

    it('should return resolved pormise even when reviewers are not selected', function (done) {
      team.getMembersForReview.returns(Promise.resolve([]));

      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.team);
          assert.lengthOf(review.team, 0);
        })
        .then(done, done);
    });

  });

});
