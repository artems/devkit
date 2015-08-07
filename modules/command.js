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
   */
  dispatch(payload) {
    const comment = _.get(payload, 'comment.body', '');

    _.forEach(this.store, command => {
      _.forEach(comment.split('\n'), line => {
        if (command.regexp.test(line)) {
          _.forEach(command.handlers, handler => {
            const commentCommand = line.trim().toLowerCase();
            handler(commentCommand, payload);
          });
        }
      });
    });
  }

}

/**
 * @typedef {Object} Command
 * @property {RegExp} regexp
 * @property {Array<Function>} handlers - array of handlers.
 */
