'use strict';

import _ from 'lodash';
import { Router } from 'express';

import pullRequestHook from './webhooks/pull_request';

const GITHUB_HEADER_EVENT = 'x-github-event';

const issueCommentHook = function () {};

export default function githubRouter(imports) {

  const model = imports.model;
  const logger = imports.logger;

  const PullRequest = model.get('pull_request');

  const router = Router(); // eslint-disable-line new-cap

  router.get('/i', function (req, res) {
    res.ok('Ok');
  });

  router.post('/webhook', function (req, res) {
    if (!_.isPlainObject(req.body)) {
      res.error('req.body is not plain object');
      return;
    }

    const eventName = req.headers[GITHUB_HEADER_EVENT];

    switch (eventName) {
      case 'pull_request':
        pullRequestHook(req.body, PullRequest, imports)
          .then(null, logger.error.bind(logger));
        break;

      case 'issue_comment':
        issueCommentHook(req.body, PullRequest, imports)
          .then(null, logger.error.bind(logger));
        break;

      case 'commit_comment':
      case 'pull_request_review_comment':
        logger.info('Ignore event `%s` from GitHub', eventName);
        break;

      case 'ping':
        res.ok('pong');
        return;

      default:
        logger.info('Unknown event `%s` from GitHub', eventName);
    }

    res.ok('Ok');

  });

  return router;

}
