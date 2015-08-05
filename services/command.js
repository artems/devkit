import CommandDispatcher from '../modules/command';

export default function (options, imports) {
  const events = imports.events;

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
    events.on(event, dispatcher.dispatch.bind(dispatcher));
  });

  return Promise.resolve();
}
