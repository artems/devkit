import { forEach } from 'lodash';

export function buildRegExp(commandRE) {
  return new RegExp('(?:^|\\s)(?:' + commandRE + ')(?:\\s|$)', 'i');
}

export default class CommandDispatcher {

  /**
   * @constructor
   *
   * @param {Object} teamDispatcher
   * @param {Array.<Command>} store - list of commands
   */
  constructor(teamDispatcher, store) {
    this.store = store || [];

    this.teamDispatcher = teamDispatcher;
  }

  /**
   * Dispatch command to handler.
   *
   * @param {String} comment - user comment
   * @param {Object} payload - payload is passed as-is to handler
   *
   * @return {Promise}
   */
  dispatch(comment, payload) {

    const pullRequest = payload.pullRequest;

    const team = this.teamDispatcher.findTeamByPullRequest(pullRequest);

    if (!team) {
      return Promise.reject(new Error(
        `Team is not found for pull request ${pullRequest}`
      ));
    }

    const promise = [];

    forEach(this.store, (command) => {

      const teamRegExp = team.getOption('command.regexp.' + command.id, []);
      const defaultRegExp = command.test;

      const allRegExp = [].concat(defaultRegExp, teamRegExp).map(buildRegExp);

      forEach(comment.split('\n'), (line) => {
        forEach(allRegExp, (test) => {
          const matches = line.match(test);
          if (matches && matches.length > 0) {
            const arglist = matches.slice(1);

            promise.push(command.handler(line.trim(), payload, arglist));
            return false; // break
          }
        });
      });

    });

    return Promise.all(promise);

  }

}

/**
 * @typedef {Object} Command
 *
 * @property {String} id - command id
 * @property {Array.<RegExp>} test - check that the command is present
 * @property {CommandHandler} handler - handler for command
 */

/**
 * @callback CommandHandler
 *
 * @param {String} comment - comment line with command.
 * @param {Object} payload - issue payload from github.
 * @param {Array}  arglist - parsed arguments for command.
 */
