import _ from 'lodash';
import { Router as router } from 'express';

export default function (options, imports) {

  const logger = imports.logger;
  const PullRequestModel = imports['pull-request-model'];
  const pullRequestReveiew = imports['pull-request-review'];

  const restApiRouter = router();

  const catchError = (res) => (error) => {
    logger.error(error);
    res.error(error);
  };

  restApiRouter.get('/pull/:id', (req, res) => {
    PullRequestModel
      .findById(req.params.id)
      .then(result => res.success(result))
      .catch(catchError(res));
  });

  restApiRouter.get('/pulls-by/:username', (req, res) => {
    PullRequestModel
      .findByUser(req.params.username)
      .then(result => res.success(result))
      .catch(catchError(res));
  });

  restApiRouter.get('/review-by/:username', (req, res) => {
    PullRequestModel
      .findByReviewer(req.params.username)
      .then(result => res.success(result))
      .catch(catchError(res));
  });

  return restApiRouter;

}
