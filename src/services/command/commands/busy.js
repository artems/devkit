import util from 'util';
import { find, reject, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:busy';

export default function setup(options, imports) {
  const {
    events,
    logger,
    review,
    'pull-request-review': pullRequestReview
  } = imports;

  /**
   * Handle '/busy' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const busyCommand = function busyCommand(command, payload) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/busy" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot change reviewer for closed pull request ${pullRequest}`
      ));
    }

    if (!find(pullRequestReviewers, { login: commentUser })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change himself, but he is not a reviewer %s',
        commentUser, pullRequest
      )));
    }

    return review.choose(pullRequest)
      .then(({ ranks }) => {
        // TODO handle an empty team.

        newReviewer = cloneDeep(ranks.shift());

        pullRequestReviewers = reject(
          pullRequestReviewers, { login: commentUser }
        );

        pullRequestReviewers.push(newReviewer);

        return pullRequestReview.updateReviewers(
          pullRequest, pullRequestReviewers
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest, newReviewer });

        return pullRequest;
      });
  };

  return busyCommand;
}
