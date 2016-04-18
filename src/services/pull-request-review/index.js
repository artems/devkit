import PullRequestAction from './class';

export default function setup(options, imports) {

  const { team, events, logger } = imports;

  const service = new PullRequestAction(options, {
    team,
    events,
    logger: logger.getLogger('review')
  });

  return service;

}
