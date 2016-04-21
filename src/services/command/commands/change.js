import util from 'util';
import { find, reject, cloneDeep, isEmpty } from 'lodash';

const EVENT_NAME = 'review:command:change';

export function getParticipant(command, parseLogins) {
  const participant = parseLogins(command.replace(/\sto\s/, ' '), '/change');

  if (isEmpty(participant)) return {};

  return {
    oldReviewerLogin: participant[0],
    newReviewerLogin: participant[1]
  };
}

export default function commandService(options, imports) {
  const { team, action, logger, events, parseLogins } = imports;

  /**
   * Handle '/change' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const changeCommand = function changeCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const { oldReviewerLogin, newReviewerLogin } = getParticipant(command, parseLogins);

    logger.info('"/change" %s', pullRequest.toString());

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        'Cannot change reviewer for closed pull request %s',
        pullRequest.toString()
      )));
    }

    if (!oldReviewerLogin || !newReviewerLogin) {
      return Promise.reject(new Error(util.format(
        'Panic! Cannot parse user `change` command `%s` %s',
        command, pullRequest.toString()
      )));
    }

    let reviewers = pullRequest.get('review.reviewers');

    if (pullRequest.user.login !== payload.comment.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to change reviewer, but author is %s',
        payload.comment.user.login,
        pullRequest.user.login
      )));
    }

    if (!find(reviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change reviewer %s but he is not in reviewers list',
        payload.comment.user.login,
        oldReviewerLogin
      )));
    }

    if (find(reviewers, { login: newReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change reviewer %s to %s but he is already in reviewers list',
        payload.comment.user.login,
        oldReviewerLogin,
        newReviewerLogin
      )));
    }

    if (newReviewerLogin === pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s cannot set himself as reviewer',
        newReviewerLogin
      )));
    }

    return team
      .findTeamByPullRequest(pullRequest)
      .then(team => team.findTeamMember(pullRequest, newReviewerLogin))
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(util.format(
            '%s tried to set %s, but there are no user with the same login in team',
            payload.comment.user.login,
            newReviewerLogin
          )));
        }

        const newReviewer = cloneDeep(user);

        reviewers = reject(reviewers, { login: oldReviewerLogin });
        reviewers.push(newReviewer);

        return action.updateReviewers(reviewers, pullRequest.id);
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });
  };

  return changeCommand;
}
