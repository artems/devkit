import { reject, isEmpty, includes } from 'lodash';

/**
 * Review ignore step - removes reviewers which login match to one in the list.
 *
 * @return {Promise}
 */
export default function ignoreService() {

  /**
   * @param {Object} options
   * @param {Array} options.list - list of logins which should be ignored
   */
  function ignore(review, options = {}) {
    const list = options.list || [];

    if (isEmpty(review.team) || isEmpty(list)) {
      return Promise.resolve(review);
    }

    review.team = reject(review.team, (member) => {
      return includes(list, member.login);
    });

    return Promise.resolve(review);

  }

  return ignore;
}
