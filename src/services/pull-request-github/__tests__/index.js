import service from '../index';
import pullRequestGitHubMock from '../__mocks__/index';

describe('services/pull-request-github', function () {

  let options, imports, github;

  beforeEach(function () {
    github = sinon.stub();

    options = {};
    imports = { github };
  });

  const methods = [
    'loadPullRequestFromGitHub',
    'updatePullRequestOnGitHub',
    'loadPullRequestFiles',
    'syncPullRequestWithGitHub',
    'setBodySection',
    'setPayload'
  ];

  it('should be resolved to PullRequestGitHub', function () {
    const pullRequestGitHub = service(options, imports);

    methods.forEach(method => {
      assert.property(pullRequestGitHub, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = pullRequestGitHubMock();

    methods.forEach(method => {
      assert.property(mock, method);
    });

  });

});
