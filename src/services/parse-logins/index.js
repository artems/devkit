import parseLogins from './parse-logins';

/**
 * Parse logins service.
 *
 * @param {Object} options
 * @param {Boolean} options.isStrictAt
 *
 * @return {Function}
 */
export default function setup(options) {
  return function (str, startFrom) {
    return parseLogins(str, startFrom, options.isStrcitAt);
  };
}
