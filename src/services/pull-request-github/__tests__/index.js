import service from '../index';
import { modelMock } from '../../model/items/__mocks__/pull-request';
import pullRequestGitHubMock from '../__mocks__/index';

describe('services/pull-request-github', function () {

  let options, imports;
  let github, PullRequestModel;

  beforeEach(function () {
    options = {};

    github = sinon.stub();
    PullRequestModel = modelMock();

    imports = { github, 'pull-request-model': PullRequestModel };
  });

  it('should be resolved to PullRequestGitHub', function () {

    const pullRequestGitHub = service(options, imports);

    assert.property(pullRequestGitHub, 'loadPullRequestFromGitHub');
    assert.property(pullRequestGitHub, 'savePullRequestToDatabase');
    assert.property(pullRequestGitHub, 'updatePullRequestOnGitHub');
    assert.property(pullRequestGitHub, 'loadPullRequestFiles');
    assert.property(pullRequestGitHub, 'syncPullRequest');
    assert.property(pullRequestGitHub, 'setBodySection');

  });

  it('the mock object should have the same methods', function () {
    const mock = pullRequestGitHubMock();

    assert.property(mock, 'loadPullRequestFromGitHub');
    assert.property(mock, 'savePullRequestToDatabase');
    assert.property(mock, 'updatePullRequestOnGitHub');
    assert.property(mock, 'loadPullRequestFiles');
    assert.property(mock, 'syncPullRequest');
    assert.property(mock, 'setBodySection');

  });

});
