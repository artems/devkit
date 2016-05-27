import fs from 'fs';
import _ from 'lodash';
import minimatch from 'minimatch';

export default function setup(options, imports) {
  const events = imports.events;
  const logger = imports.logger.getLogger('special');
  const specialChecker = imports['special-checker'];
  const commandAdd = imports['command-add'];
  const teamDispatcher = imports['team-dispatcher'];

  function check(payload) {
    const review = payload.pullRequest.review;
    const pullRequest = payload.pullRequest;

    review.team = review.reviewers;
    review.pullRequest = pullRequest;

    return specialChecker.checkConfigRules(review)
      .then(reviewData => {
        const patch = reviewData.patch;
        const rulesToCheck = _.groupBy(patch.addMembers, 'pattern');
        const alreadyReviewers = review.members;

        forEach(rulesToCheck, (members) => {
          const logins = pluck(members, 'login');
          const newReviewers = _.filter(alreadyReviewers, (user) => logins.includes(user.login)).length
          // check already reviewers by pattern groups
          if (!newReviewers) {
            forEach(members, (member) => {
              addCommand(`/add ${member.login}`, payload, [member.login]);
            });
          }
        });
      })
      .catch(logger.info.bind(this));
  }

  events.on('github:pull_request:synchronize', check);

  return {};
}
