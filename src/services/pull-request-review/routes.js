import { Router as router } from 'express';

export default function setup(options, imports) {

  const http = imports.http;
  const logger = imports.logger.getLogger('http.pull');
  const PullRequestModel = imports['pull-request-model'];

  const pullRequestReviewRouter = router();

  const success = (response) => (result) => {
    response.success(result);
  };

  const catchError = (response) => (error) => {
    logger.error(error);
    response.error(error.message);
  };

  pullRequestReviewRouter.get('/:id', (req, res) => {
    PullRequestModel.findById(req.params.id)
      .then(success(res), catchError(res));
  });

  pullRequestReviewRouter.get('/pulls-by/:username', (req, res) => {
    PullRequestModel.findByUser(req.params.username)
      .then(success(res), catchError(res));
  });

  pullRequestReviewRouter.get('/reviews-by/:username', (req, res) => {
    PullRequestModel.findByReviewer(req.params.username)
      .then(success(res), catchError(res));
  });

  http.addRoute('/pull', pullRequestReviewRouter);

  return pullRequestReviewRouter;

}
