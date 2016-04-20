import util from 'util';
import { find, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:ok';
const EVENT_NAME_NEW_REVIEWER = EVENT_NAME + ':new_reviewer';

export default function setup(options, imports) {

  const { action, logger, team, events } = imports;

  /**
   * Handle '/ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const okCommand = function okCommand(command, payload) {

    const login = payload.comment.user.login;
    const pullRequest = payload.pullRequest;
    const reviewer = find(pullRequest.get('review.reviewers'), { login });

    logger.info('"/ok" %s', pullRequest.toString());

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        '%s cannot approve review for closed pull request %s',
        login, pullRequest.toString()
      )));
    }

    if (login === pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s cannot ok to his pull request',
        login
      )));
    }

    if (reviewer) {
      return action
        .approveReview(pullRequest, login)
        .then(pullRequest => {
          events.emit(EVENT_NAME, { pullRequest });
        });
    } else {
      return team
        .findTeamByPullRequest(pullRequest)
        .then(team => team.findTeamMember(pullRequest, login))
        .then(user => {
          if (!user) {
            return Promise.reject(new Error(util.format(
              '%s tried to approve review, but there isn`t a user with the same login in team %s',
              login, pullRequest.toString()
            )));
          }

          const reviewers = pullRequest.get('review.reviewers');
          const newReviewer = cloneDeep(user);

          reviewers.push(newReviewer);

          return action.updateReviewers(reviewers, pullRequest.id);
        })
        .then(pullRequest => action.approveReview(pullRequest, login))
        .then(pullRequest => {
          events.emit(EVENT_NAME_NEW_REVIEWER, { pullRequest });

          return pullRequest;
        });
    }
  };

  return okCommand;
}
