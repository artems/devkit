import webhook from '../../items/issue_comment';
import modelMock from '../../../model/__mocks__/index';
import loggerMock from '../../../logger/__mocks__/index';
import eventsMock from '../../../events/__mocks__/index';
import pullRequestMock from '../../../model/items/__mocks__/pull-request';

describe.skip('services/pull-request-github/webhooks/issue_comment', () => {

  let payload, imports, model, logger, events;
  let promise, pullRequest, pullRequestModel;

  beforeEach(function () {
    model = modelMock();
    logger = loggerMock();
    events = eventsMock();

    pullRequestModel = model.get('pull_request');

    imports = { 'pull-request-model': pullRequestModel, logger, events };

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

    pullRequestModel
      .findByRepositoryAndNumber.returns(promise(pullRequest));
  });

  it('should trigger system event `github:issue_comment`', function (done) {
    webhook(payload, imports)
      .then(() => {
        events.emit.calledWith('github:issue_comment');
        done();
      })
      .catch(done);
  });

  it('should fail if pull request was not found', function (done) {
    pullRequestModel
      .findByRepositoryAndNumber.returns(promise(null));

    webhook(payload, imports)
      .catch(e => {
        assert.instanceOf(e, Error);
        assert.match(e.message, /not found/);
        done();
      })
      .catch(done);
  });

});
