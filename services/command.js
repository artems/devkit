'use strict';

import CommandDispatcher from '../modules/command';

export default function (options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const action = imports['pull-request-action'];
  const team = imports.team;

  const commands = options.commands.map(command => {
    return {
      regexp: new RegExp(command.regexp, 'i'),
      handers: command.handlers.map(path => {
        return require(path);
      })
    };
  });

  const dispatcher = new CommandDispatcher(commands);

  options.events.forEach(event => {
    events.on(event, payload => {
      payload.events = events;
      payload.logger = logger;
      payload.action = action;
      payload.team = team;

      // TODO return promise from dispatch
      dispatcher.dispatch(payload);
    });
  });

  return Promise.resolve({ service: dispatcher });

}
