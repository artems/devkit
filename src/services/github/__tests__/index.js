import service from '../index';
import githubMock from '../__mocks__/index';

describe('services/github', function () {

  it('should be resolved to GitHub', function () {
    const options = {
      version: '3.0.0'
    };

    const github = service(options);

    assert.property(github, 'orgs');
    assert.property(github, 'pullRequests');
  });

  it('the mock object should have the same methods', function () {
    const mock = githubMock();

    assert.property(mock, 'orgs');
    assert.property(mock, 'pullRequests');
  });

  it('should authenticate to GitHub if credentials was given', function () {
    const options = {
      version: '3.0.0',
      authenticate: {
        type: 'token',
        token: '1234567890abcde'
      }
    };

    const github = service(options);

    assert.deepPropertyVal(github, 'auth.type', 'token');
  });

});
