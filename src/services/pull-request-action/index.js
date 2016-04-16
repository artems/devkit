import PullRequestAction from './pull-request-action';

export default function setup(options, imports) {

  const { team, events, logger } = imports;

  const service = new PullRequestAction(options, {
    team,
    events,
    logger: logger.getLogger('review'),
    PullRequestModel: imports['pull-request-model']
  });

  return service;

}
