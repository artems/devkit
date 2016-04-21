import PullRequestReview from './class';

export default function setup(options, imports) {

  const { events, logger, 'team-dispatcher': teamDispatcher } = imports;

  const service = new PullRequestReview(options, {
    events,
    logger: logger.getLogger('review'),
    teamDispatcher
  });

  return service;

}
