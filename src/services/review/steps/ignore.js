import { reject, isEmpty, includes } from 'lodash';

/**
 * Removes reviewers which login is match to one in the list.
 *
 * @param {Object} options
 * @param {Array}  [options.list] - list of logins which should be ignored
 */
function ignore(review, options) {
  const list = options && options.list || [];

  if (isEmpty(list) || isEmpty(review.team)) {
    return Promise.resolve(review);
  }

  review.team = reject(review.team, (member) => {
    return includes(list, member.login);
  });

  return Promise.resolve(review);

}

/**
 * Create review `ignore` processor.
 *
 * @return {Promise.<Review>}
 */
export default function setup() {
  return ignore;
}
