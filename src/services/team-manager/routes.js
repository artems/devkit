import { Router as router } from 'express';

export default function setup(options, imports) {

  const http = imports.http;
  const logger = imports.logger.getLogger('team');
  const teamManager = imports['team-manager'];
  const PullRequestModel = imports['pull-request-model'];

  const teamRoute = router();

  teamRoute.get('/pull/:org/:repo/:number', function (req, res) {
    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    PullRequestModel
      .findByRepositoryAndNumber(`${org}/${repo}`, number)
      .then(pullRequest => {
        if (!pullRequest) {
          return Promise.reject(new Error(
            `Pull request ${org}/${repo}/${number} is not found`
          ));
        }

        const team = teamManager.findTeamByPullRequest(pullRequest);
        if (!team) {
          return Promise.reject(new Error(
            `Team for pull request ${org}/${repo}/${number} is not found`
          ));
        }

        return team.getMembersForReview(pullRequest);
      })
      .then(res.success.bind(res))
      .catch(err => {
        res.error(err.message);
        logger.error(err);
      });
  });

  http.addRoute('/team', teamRoute);

  return teamRoute;

}
