import { Router as router } from 'express';

export default function (options, imports) {

  const logger = imports.logger;
  const PullRequestModel = imports['pull-request-model'];

  const restApiRouter = router();

  const catchError = (res) => (error) => {
    logger.error(error);
    res.error(error);
  };

  restApiRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

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
