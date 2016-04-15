import webhook from '..//pull_request';
import loggerMock from '../../../logger/__mocks__/index';
import eventsMock from '../../../events/__mocks__/index';
import pullRequestMock, { modelMock as pullRequestModelMock } from '../../../model/items/__mocks__/pull-request';
import pullRequestGitHubMock from '../../../pull-request-github/__mocks__/index';

describe('services/pull-request-webhook/items/pull_request', () => {

  let payload, imports, logger, events;
  let promise, pullRequest, PullRequestModel, pullRequestGitHub;

  beforeEach(function () {

    logger = loggerMock();
    events = eventsMock();
    PullRequestModel = pullRequestModelMock();
    pullRequestGitHub = pullRequestGitHubMock();

    imports = {
      events,
      logger,
      'pull-request-model': PullRequestModel,
      'pull-request-github': pullRequestGitHub
    };

    payload = {
      id: 123456789,
      action: 'pull_request',
      pull_request: {
        title: 'The Ultimate Question of Life, the Universe, and Everything',
        number: 42,
        html_url: 'http://'
      },
      repository: {
        full_name: 'devexp-org/devexp',
        owner: {
          login: 'Abcde'
        }
      }
    };

    pullRequest = pullRequestMock();

    promise = function (x) {
      return Promise.resolve(x);
    };

    pullRequestGitHub.loadPullRequestFiles.returns(promise([]));

    PullRequestModel.findById.returns(promise(pullRequest));

  });

  it('should trigger event `github:pull_request`', function (done) {
    webhook(payload, imports)
      .then(() => {
        events.emit.calledWith('github:pull_requset');
        done();
      })
      .catch(done);
  });

  it('should create new object if pull request was not found', function (done) {
    PullRequestModel.findById.returns(promise(null));

    webhook(payload, imports)
      .then(pullRequest => { assert.isObject(pullRequest); done(); })
      .catch(done);
  });

});
