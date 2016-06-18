import { Router as router } from 'express';

export default function setup(options, imports) {

  const http = imports.http;
  const events = imports.events;
  const logger = imports.logger.getLogger('http.badges');
  const PullRequestModel = imports['pull-request-model'];

  const badgesRouter = router();

  badgesRouter.get('/pull/:org/:repo/:number', function (req, response) {

    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    const fullName = `${org}/${repo}`;

    PullRequestModel
      .findByRepositoryAndNumber(fullName, number)
      .then(pullRequest => {
        if (!pullRequest) {
          response.error(`Pull request ${fullName}#${number} is not found`);
          return;
        }

        events.emit('review:update_badges', { pullRequest });

        response.end('ok');
      })
      .catch(err => {
        logger.error(err);
        response.error(err.message);
      });

  });

  http.addRoute('/badges-updater', badgesRouter);

  return badgesRouter;

}
