'use strict';

import _ from 'lodash';

export default class CommandDistatcher {

  /**
   * @constructor
   *
   * @param {Array<Command>} store - list of commands
   */
  constructor(store) {
    this.store = store || [];
  }

  /**
   * Dispatch command to handler.
   *
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  dispatch(payload) {
    const promise = [];
    const comment = _.get(payload, 'comment.body', '');

    _.forEach(this.store, command => {
      _.forEach(comment.split('\n'), line => {
        if (command.test.test(line)) {
          _.forEach(command.handlers, handler => {
            const commentCommand = line.trim().toLowerCase();
            promise.push(handler(commentCommand, payload));
          });
        }
      });
    });

    return Promise.all(promise).then(() => {});
  }

}

/**
 * @typedef {Object} Command
 * @property {RegExp} test
 * @property {Array<Function>} handlers - array of handlers.
 */
