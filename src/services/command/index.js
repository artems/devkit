import { get, forEach } from 'lodash';
import CommandDispatcher from './dispatcher';

export function constructRegexp(commandRegexp) {
  return new RegExp('(?:^|\\s)(?:' + commandRegexp + ')(?:\\s|$)', 'i');
}

export default function setup(options, imports) {

  const {
    queue,
    events,
    'pull-request-model': PullRequestModel
  } = imports;

  const logger = imports.logger.getLogger('command');

  const wrapHandler = function (handler) {

    return function (command, payload, arglist) {

      const pullId = payload.pullRequest.id;

      return queue.dispatch('pull-request#' + pullId, () => {

        return PullRequestModel
          .findById(pullId)
          .then(pullRequest => {
            payload.pullRequest = pullRequest;

            return handler(command, payload, arglist);
          })
          .then(pullRequest => pullRequest.save());

      });

    };

  };

  const commands = options.commands.map(command => {
    return {
      test: constructRegexp(command.test),
      handlers: command.handlers.map(serviceName => {
        const handler = imports[serviceName];

        if (!handler) {
          throw new Error(`Handler "${serviceName}" is not found`);
        }

        return wrapHandler(handler);
      })
    };
  });

  const dispatcher = new CommandDispatcher(commands);

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      const comment = get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(::logger.error);
    });
  });

  return dispatcher;
}
