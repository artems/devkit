import ReviewConveyor from '../modules/review';

export default function (options, imports) {

  const team = imports.team;
  const model = imports.model;
  const logger = imports.logger;
  const review = new ReviewConveyor(team, model.get('pull_request'), logger, options);

  return Promise.resolve({ service: review });
}
