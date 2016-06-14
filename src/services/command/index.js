import { get, forEach } from 'lodash';
import CommandDispatcher from './class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('command');
  const teamDispatcher = imports['team-dispatcher'];
  const PullRequestModel = imports['pull-request-model'];

  const dispatcher = new CommandDispatcher(
    queue, teamDispatcher, PullRequestModel
  );

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
