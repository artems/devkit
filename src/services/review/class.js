import { map, forEach, isEmpty } from 'lodash';

export default class ReviewerAssignment {

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
  }

  /**
   * Get and then set team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setTeam(review) {
    const team = this.teamDispatcher.findTeamByPullRequest(review.pullRequest);

    if (!team) {
      return Promise.reject(new Error(
        `Team is not found for pull request ${review.pullRequest}`
      ));
    }

    review._team = team;

    return team.getMembersForReview(review.pullRequest)
      .then(team => {
        review.team = team;
        return review;
      });
  }

  /**
   * Find choose reviewer steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setSteps(review) {
    return this.getSteps(review)
      .then(steps => {
        review.steps = steps;
        return review;
      });
  }

  /**
   * Get steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Array.<Function>>}
   */
  getSteps(review) {
    const stepNames = review._team.getOption('steps', this.options.steps);

    if (isEmpty(stepNames)) {
      return Promise.reject(new Error('There are no any steps for given team'));
    }

    let notFound = false;

    const steps = stepNames.map(name => {
      const ranker = this.imports['reviewer-assignment-step-' + name];

      if (!ranker && !notFound) {
        notFound = new Error(`There is no step with name "${name}"`);
      }

      return { ranker, name };
    });

    return notFound ? Promise.reject(notFound) : Promise.resolve(steps);
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  addZeroRank(review) {
    forEach(review.team, (member) => { member.rank = 0; });

    return Promise.resolve(review);
  }

  /**
   * Start ranking queue.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Review>}
   */
  start(pullRequest) {
    return Promise.resolve({ pullRequest, team: [] });
  }

  /**
   * Build queue from steps.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  stepsQueue(review) {
    const stepsOptions = review._team.getOption(
      'stepsOptions', this.options.stepsOptions || {}
    );

    return review.steps.reduce((queue, { ranker, name }) => {

      return queue.then(review => {
        this.logger.info('Phase is `%s`', name);

        this.logger.info(
          'Temporary ranks are: %s',
          map(review.team, (x) => x.login + '#' + x.rank).join(' ')
        );

        const rankerOptions = stepsOptions[name];

        return ranker(review, rankerOptions);
      });

    }, Promise.resolve(review));
  }

  /**
   * Review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Review>}
   */
  choose(pullRequest) {
    this.logger.info('Review started for #s', pullRequest.id);

    return this
      .start(pullRequest)
      .then(::this.setTeam)
      .then(::this.setSteps)
      .then(::this.addZeroRank)
      .then(::this.stepsQueue)
      .then(review => {
        this.logger.info('Complete %s', review.pullRequest);

        this.logger.info('Reviewers are: %s',
          isEmpty(review.team)
            ? 'ooops, no reviewers were selected...'
            : review.team.map(x => x.login + '#' + x.rank).join(' ')
        );

        return review;
      });
  }

}
