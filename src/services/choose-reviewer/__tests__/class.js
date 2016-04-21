import ChooseReviewer from '../class';

import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import teamMock from '../../team-dispatcher/__mocks__/team';
import { members } from '../../team-dispatcher/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';
import { pullRequestMock, pullRequestModelMock } from '../../model/collections/__mocks__/pull-request';

describe('services/choose-reviewer/ChooseReviewer', function () {

  let team, teamDispatcher, model, logger, pullRequest, PullRequestModel;
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

  describe('#start', function () {

    it('should return rejected promise if pull request is not found', function (done) {
      const review = new ChooseReviewer(options, imports);

      PullRequestModel.findById.returns(Promise.resolve(null));

      review.start(123456)
        .then(() => assert.fail())
        .catch(error => { assert.match(error.message, /not found/); done(); })
        .catch(done);
    });

  });

  describe('#setSteps', () => {

    it('should return rejected promise if there are no steps for team for pull request', done => {
      const review = new ChooseReviewer(options, imports);

      review.setSteps({ pullRequest: {} })
        .catch(error => { assert.match(error.message, /steps/); done(); })
        .catch(done)
    });

    it('should be resolved with review which includes steps for pull request', done => {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1', 'step2']
          }
        }
      };

      imports.step1 = '1';
      imports.step2 = '2';

      const review = new ChooseReviewer(options, imports);

      review.setSteps({ pullRequest: {} })
        .then(resolved => {
          assert.deepEqual(resolved.steps, ['1', '2']);
          done();
        })
        .catch(done);
    });

  });

  describe('#stepsQueue', () => {

    it('should iterate through steps', done => {
      const order = [];

      const createStep = function (name) {
        return function (review) {
          order.push(name);
          return Promise.resolve(review);
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
        .then(() => {
          assert.deepEqual(order, ['one', 'two', 'three', 'four']);
        })
        .then(done, done);
    });

    describe('each step', () => {

      it('should receive team and pullRequest', done => {
        const steps = [
          function (review) {
            assert.equal(review.pullRequest, pullRequest);
            assert.deepEqual(review.team, members());

            return Promise.resolve(review);
          }
        ];

        const review = new ChooseReviewer(options, imports);

        review.stepsQueue({ steps, pullRequest, team: members() })
          .then(() => null)
          .then(done, done);
      });

      it('should be able to change the team', done => {
        const steps = [
          function (review) {
            review.team.splice(0, 5);
            return Promise.resolve(review);
          },
          function (review) {
            assert.lengthOf(review.team, 12);
            return Promise.resolve(review);
          }
        ];

        const review = new ChooseReviewer(options, imports);

        review.stepsQueue({ steps, pullRequest, team: members() })
          .then(() => null)
          .then(done, done);
      });

    });

  });

  describe('#review', () => {

    it('should not throw error if reviewers will not selected', done => {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1']
          }
        }
      };

      imports.step1 = function (review) {
        return Promise.resolve(review);
      };

      const review = new ChooseReviewer(options, imports);

      review.review(123456)
        .then(() => null)
        .then(done, done);
    });

  });

  describe('#getSteps', function () {

    let review;

    beforeEach(() => {
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

      imports.step1 = '1';
      imports.step2 = '2';

      review = new ChooseReviewer(options, imports);
    });

    it('should be rejected if team was not found', done => {
      teamDispatcher.findTeamNameByPullRequest = sinon.stub().returns(null);

      review.getSteps({}).catch(() => done());
    });

    it('should be rejected if there aren`t any steps for team', done => {
      teamDispatcher.findTeamNameByPullRequest = sinon.stub().returns('team');

      review.getSteps({}).catch(() => done());
    });

    it('should throw an error if there is no step with passed name', done => {
      imports.step2 = null;

      review.getSteps({}).catch(() => done());
    });

    it('should instantiate steps and resolve with steps array', done => {
      options = {
        teamOverrides: {
          Avengers: {
            steps: ['step1', 'step2']
          }
        }
      };

      imports.step1 = '1';
      imports.step2 = '2';

      review = new ChooseReviewer(options, imports);

      review.getSteps({})
        .then(resolved => {
          assert.deepEqual(resolved, ['1', '2']);

          done();
        })
        .catch(done);
    });

  });

});
