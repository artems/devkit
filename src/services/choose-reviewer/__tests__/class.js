import ChooseReviewer from '../class';

import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import teamMock from '../../team-dispatcher/__mocks__/team';
import { members } from '../../team-dispatcher/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';
import { pullRequestMock, pullRequestModelMock } from '../../model/collections/__mocks__/pull-request';

describe('services/choose-reviewer/ChooseReviewer', function () {

  let model, logger, team, teamDispatcher, pullRequest, PullRequestModel;
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

    PullRequestModel = pullRequestModelMock()
    PullRequestModel.findById.returns(Promise.resolve(pullRequest));

    options = {};

    imports = { logger, 'team-dispatcher': teamDispatcher, 'pull-request-model': PullRequestModel };

  });

  describe('#getSteps', function () {

    let review;

    beforeEach(function () {

      options = {
        teamOverrides: {
          Avengers: {
            steps: [
              'step1',
              'step2'
            ]
          }
        }
      };

      imports['choose-reviewer-step-step1'] = '1';
      imports['choose-reviewer-step-step2'] = '2';

      review = new ChooseReviewer(options, imports);

    });

    it('should return rejected promise if team is not found', function (done) {
      teamDispatcher.findTeamNameByPullRequest.returns(null);

      review.getSteps({ pullRequest })
        .then(() => { done(new Error('should reject promise')); })
        .catch(() => done());
    });

    it('should return rejected promise if there are no any steps for team', function (done) {
      teamDispatcher.findTeamNameByPullRequest = sinon.stub().returns('team');

      review.getSteps({ pullRequest })
        .catch(error => { assert.match(error.message, /steps/); done(); })
        .catch(done)
    });

    it('should return rejected promise if there is no step with passed name', function (done) {
      delete imports['choose-reviewer-step-step2'];

      review.getSteps({ pullRequest })
        .then(() => done(new Error('should reject promise')))
        .catch(error => { assert.match(error.message, /no step/); done(); })
        .catch(done)
    });

    it('should instantiate steps and return resolved promise with steps array', function (done) {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1', 'step2']
          }
        }
      };

      imports['choose-reviewer-step-step1'] = '1';
      imports['choose-reviewer-step-step2'] = '2';

      review = new ChooseReviewer(options, imports);

      review.getSteps({ pullRequest })
        .then(resolved => {
          assert.deepEqual(resolved, [
            { name: 'step1', ranker: '1' },
            { name: 'step2', ranker: '2' }
          ])
        })
        .then(done)
        .catch(done);
    });

  });

  describe('#start', function () {

    it('should return rejected promise if pull request is not found', function (done) {
      const review = new ChooseReviewer(options, imports);

      PullRequestModel.findById.returns(Promise.resolve(null));

      review.start(1)
        .then(() => { done(new Error('should reject promise')); })
        .catch(error => { assert.match(error.message, /not found/); done(); })
        .catch(done);
    });

  });

  describe('#stepsQueue', function () {

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
        createStep('one'),
        createStep('two'),
        createStep('three'),
        createStep('four')
      ];

      const review = new ChooseReviewer(options, imports);

      review.stepsQueue({ steps: _steps, team: [] })
        .then(() => assert.deepEqual(order, ['one', 'two', 'three', 'four']))
        .then(done)
        .catch(done);
    });

    describe('each step', function () {

      it('should receive a team and a pullRequest', function (done) {
        const steps = [
          {
            name: 'step',
            ranker: function (review) {
              assert.equal(review.pullRequest, pullRequest);
              assert.deepEqual(review.team, members());

              return Promise.resolve(review);
            }
          }
        ];

        const review = new ChooseReviewer(options, imports);

        review.stepsQueue({ steps, pullRequest, team: members() })
          .then(() => null)
          .then(done, done);
      });

      it('should be able to change the team', function (done) {
        const steps = [
          {
            name: 'step1',
            ranker: function (review) {
              review.team.splice(0, 5);
              return Promise.resolve(review);
            }
          },
          {
            name: 'step2',
            ranker: function (review) {
              assert.lengthOf(review.team, 12);
              return Promise.resolve(review);
            }
          }
        ];

        const review = new ChooseReviewer(options, imports);

        review.stepsQueue({ steps, pullRequest, team: members() })
          .then(() => null)
          .then(done)
          .catch(done);
      });

    });

  });

  describe('#review', function () {

    it('should return resolved pormise with chosen reviewers', function (done) {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1']
          }
        }
      };

      imports['choose-reviewer-step-step1'] = function (review) {
        return Promise.resolve(review);
      };

      const review = new ChooseReviewer(options, imports);

      review.review(1)
        .then(review => {
          assert.isArray(review.team);
          assert.isAbove(review.team.length, 0);
        })
        .then(done)
        .catch(done);
    });

    it('should return resolved pormise even when reviewers are not selected', function (done) {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1']
          }
        }
      };

      imports['choose-reviewer-step-step1'] = function (review) {
        return Promise.resolve(review);
      };

      team.getMembersForReview.returns(Promise.resolve([]));

      const review = new ChooseReviewer(options, imports);

      review.review(1)
        .then(review => {
          assert.isArray(review.team);
          assert.lengthOf(review.team, 0);
        })
        .then(done)
        .catch(done);
    });

  });

});
