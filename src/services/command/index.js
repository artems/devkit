import { get, forEach } from 'lodash';
import CommandDispatcher from './class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('command');
  const teamDispatcher = imports['team-dispatcher'];
  const PullRequestModel = imports['pull-request-model'];

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
    const service = imports[command.handler];
    if (!service) {
      throw new Error(`Handler "${command.handler}" is not found`);
    }

    return {
      id: command.id,
      test: command.test,
      handler: wrapHandler(service)
    };
  });

  const dispatcher = new CommandDispatcher(teamDispatcher, commands);

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      const comment = get(payload, 'comment.body', '');
      dispatcher
        .dispatch(comment, payload)
        .catch(logger.error.bind(logger));
    });
  });

  return dispatcher;

}
