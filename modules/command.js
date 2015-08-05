import _ from 'lodash';

export default class CommandDistatcher {

  /**
   * @constructor
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
            let commentCommand = line.trim().toLowerCase();
            handler(commentCommand, payload);
          });
        }
      });
    });
  }

}
