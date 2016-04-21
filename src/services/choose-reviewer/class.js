import util from 'util';
import { get, forEach, map, isEmpty } from 'lodash';

export default class ChooseReviewer {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, imports) {
    this.imports = imports;
    this.options = options;

    this.logger = imports.logger;
    this.teamDispatcher = imports['team-dispatcher'];
    this.PullRequestModel = imports['pull-request-model'];
  }

  /**
   * Get and then set team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  setTeam(review) {
    return this.teamDispatcher
      .findTeamByPullRequest(review.pullRequest)
      .then(team => {
        review.team = team.getMembersForReview(review.pullRequest);
        return review;
      });
  }

  /**
   * Find choose reviewer steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  setSteps(review) {
    return this.getSteps(review.pullRequest)
      .then(steps => {
        review.steps = steps;
        return review;
      });
  }

  /**
   * Get steps for team.
   *
   * @param {Object} pullRequest
   *
   * @return {Promise} { steps, stepOptions }
   */
  getSteps(pullRequest) {
    const teamName = this.teamDispatcher.findTeamNameByPullRequest(pullRequest);

    if (!teamName) {
      return Promise.reject(new Error(util.format(
        'Team not found for pull request %s', pullRequest.toString()
      )));
    }

    const steps =
      get(this.options, ['teamOverrides', teamName, 'steps']) ||
      get(this.options, ['default', 'steps']);

    if (isEmpty(steps)) {
      return Promise.reject(new Error(
        `There aren\'t any steps for given team "${teamName}"`, teamName
      ));
    }

    return new Promise((resolve, reject) => {
      resolve(steps.map(name => {
        const ranker = this.imports[name];

        if (!ranker) {
          reject(new Error(`There is no step with name "${name}"`));
        }

        return ranker;
      }));

    });
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  addZeroRank(review) {
    forEach(review.team, member => { member.rank = 0; });

    return Promise.resolve(review);
  }

  /**
   * Start ranking queue.
   *
   * @param {Number} pullId - pull request id
   *
   * @return {Promise}
   */
  start(pullId) {
    return new Promise((resolve, reject) => {
      this.PullRequestModel
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) {
            return reject(new Error(`Pull request #${pullId} not found`));
          }

          resolve({ pullRequest, team: [] });
        });
    });
  }

  /**
   * Build queue from steps.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  stepsQueue(review) {
    return review.steps.reduce((queue, ranker) => {
      return queue.then(review => {
        this.logger.info('Choose reviewer phase is `%s`', ranker.name);
        this.logger.info(
          'Temporary ranks are: %s',
          map(review.team, (x) => x.login + '#' + x.rank).join(' ')
        );

        return ranker(review);
      });
    }, Promise.resolve(review));
  }

  /**
   * Main review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  review(pullId) {
    this.logger.info('Review started for #%s', pullId);

    return this
      .start(pullId)
      .then(::this.setTeam)
      .then(::this.setSteps)
      .then(::this.addZeroRank)
      .then(::this.stepsQueue)
      .then(review => {
        this.logger.info('Choose reviewers complete %s', review.pullRequest.toString());

        this.logger.info('Reviewers are: %s',
          (!isEmpty(review.team)) ?
            review.team.map(x => x.login + '#' + x.rank).join(' ') :
            'ooops, no reviewers were selected...'
        );

        return review;
      });
  }

}
