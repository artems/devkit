import util from 'util';
import { uniq, pluck, difference, map } from 'lodash';

export const REVIEWER_RE = /@([a-z][-0-9a-z]+)/gi;

/**
 * Find users in description
 *
 * @param {String} body
 *
 * @return {Array}
 */
export function findReviewersInDescription(body) {
  let match;
  const reviewers = [];

  do {
    match = REVIEWER_RE.exec(body);
    if (match && match.length) {
      reviewers.push(match[1]);
    }
  } while (match !== null);

  return reviewers;
}

/**
 * Create prefered reviewers processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max random rank
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {
  const teamDispatcher = imports['team-dispatcher'];

  /**
   * Up rank for prefered reviewers
   *
   * @param {Review} review
   * @param {Object} options
   *
   * @return {Review} review
   */
  function preferedReviewers(review, options) {
    const body = review.pullRequest.body;

    const preferedReviewers = uniq(findReviewersInDescription(body));

    const requiredReviewers = difference(preferedReviewers, pluck(review.members, 'login'));

    let promise = [];
    let reviewers = [];

    preferedReviewers.length && review.team.forEach(user => {
      if (preferedReviewers.includes(user.login)) {
        reviewers.push({ login: user.login, rank: Infinity });
      }
    });

    if (requiredReviewers.length) {
      promise = map(requiredReviewers, (requiredUser) => {
        return teamDispatcher
          .findTeamByPullRequest(review.pullRequest)
          .then(team => team.findTeamMember(review.pullRequest, requiredUser))
          .then(user => {
            if (!user) {
              return Promise.reject(new Error(util.format(
                'There are no user with the login "%s" in team',
                requiredUser.login
              )));
            }

            reviewers.push({ login: user.login, rank: Infinity });
          });
      });
    }

    return Promise.all(promise).then(() => reviewers);
  }

  return preferedReviewers;
}
