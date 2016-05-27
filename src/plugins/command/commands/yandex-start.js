import util from 'util';
import { flatten, pluck, filter, get } from 'lodash';

const EVENT_NAME = 'review:command:start';
const ERROR_EVENT_NAME = 'review:command:error';

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];
  const events = imports.events;
  const logger = imports.logger.getLogger('command');
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/start' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const startCommand = function startCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/start" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot start review for closed pull request ${pullRequest}`
      ));
    }

    if (pullRequest.get('review.status') !== 'open') {
      return Promise.reject(new Error(
        `Cannot start is not open review ${pullRequest}`
      ));
    }

    const reviewers = pullRequest.get('review.reviewers');

    return Promise
      .all(reviewers.map(user => staff.apiAbsence(user.login)))
      .then(absenceUsers => {
        absenceUsers = filter(flatten(absenceUsers), (user) => get(user, 'gap_type__name') !== 'trip');
        absenceUsers = pluck(absenceUsers, 'staff__login');

        if (absenceUsers.length) {
          events.emit(
            ERROR_EVENT_NAME,
            `Reviewers are absent: ${absenceUsers}. You can change them to somebody else.`
          );
        }

        return pullRequestReview.startReview(pullRequest);
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  return startCommand;

}
