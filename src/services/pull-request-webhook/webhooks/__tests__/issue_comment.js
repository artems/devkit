import webhook from '../issue_comment';
import loggerMock from '../../../logger/__mocks__/index';
import eventsMock from '../../../events/__mocks__/index';
import pullRequestMock, { modelMock as pullRequestModelMock } from '../../../model/collections/__mocks__/pull-request';

describe('services/pull-request-webhook/webhooks/issue_comment', () => {

  let payload, imports, logger, events;
  let promise, pullRequest, PullRequestModel;

  beforeEach(function () {

    logger = loggerMock();
    events = eventsMock();

    PullRequestModel = pullRequestModelMock();

    imports = { 'pull-request-model': PullRequestModel, logger, events };

    payload = {
      action: 'issue_comment',
      issue: {
        title: 'The Ultimate Question of Life, the Universe, and Everything',
        number: 42,
        html_url: 'http://'
      },
      repository: {
        full_name: 'devexp-org/devexp'
      }
    };

    promise = function (x) {
      return Promise.resolve(x);
    };

    pullRequest = pullRequestMock();

    PullRequestModel.findByRepositoryAndNumber.returns(promise(pullRequest));

  });

  it('should trigger system event `github:issue_comment`', function (done) {
    webhook(payload, imports)
      .then(() => {
        events.emit.calledWith('github:issue_comment');
        done();
      })
      .catch(done);
  });

  it('should reject promise if pull request was not found', function (done) {
    PullRequestModel.findByRepositoryAndNumber.returns(promise(null));

    webhook(payload, imports)
      .catch(e => {
        assert.match(e.message, /not found/);
        done();
      })
      .catch(done);
  });

});
