import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('team');
  const teamDispatcher = imports['team-dispatcher'];
  const PullRequestModel = imports['pull-request-model'];

  const teamRoute = router();

  teamRoute.get('/pull/:org/:repo/:number', function (req, res) {
    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    if (!org || !repo || !number) {
      res.error('Url format: pull/{org}/{repo}/{number}');
      return;
    }

    PullRequestModel
      .findByNumberAndRepository(number, `${org}/${repo}`)
      .then(pullRequest => team.findByPullRequest(pullRequest))
      .then(team => res.json(team))
      .catch(err => {
          logger.error(err);
          res.error(err.message);
        }
      );
  });

  return teamRoute;

}
