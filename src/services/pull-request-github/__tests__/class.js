import PullRequestGitHub from '../class';
import { modelMock } from '../../model/items/__mocks__/pull-request';

describe('services/pull-request-github/class', () => {

  let github, PullRequestModel, pullRequestGitHub, options;

  beforeEach(() => {

    github = sinon.stub();

    PullRequestModel = modelMock();

    options = {
      separator: {
        top: '<div id="top"></div>',
        bottom: '<div id="bottom"></div>'
      }
    };

    pullRequestGitHub = new PullRequestGitHub(github, PullRequestModel, options);
  });

  describe('#cleanPullRequestBody', () => {

    it('should be able to clean pull request body from end', () => {
      const body = '' +
`BODY TEXT
<div id="top"></div>
EXTRA BODY TEXT
<div id="bottom"></div>`;

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');
    });

    it('should able to clean pull request body from begin', () => {
      const body = `
<div id="top"></div>
EXTRA BODY TEXT
<div id="bottom"></div>
BODY TEXT`;

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');

    });

    it('should able to clean pull request body from middle', () => {
      const body = `
BODY TEXT 1
<div id="top"></div>
EXTRA BODY TEXT
<div id="bottom"></div>
BODY TEXT 2`;

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT 1\nBODY TEXT 2');

    });

    it('should not perform any edits if no separators exist', () => {
      const body = `
BODY TEXT 1
BODY TEXT 2
`;

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);

    });

    it('should not perform any edits if only 1 separator exists', () => {
      const body = `
BODY TEXT 1
<div id="top"></div>
EXTRA BODY TEXT
BODY TEXT 2`;

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);

    });


  });

  describe('#fillPullRequestBody', () => {

    it('should be able to replace pull request body', () => {
      const body = `
BODY TEXT
<div id="top"></div>
<div>EXTRA BODY TEXT</div>
<div id="bottom"></div>
`;

      const pullRequest = {
        body: body,
        section: {
          id1: 'ID1',
          id2: 'ID2'
        }
      };

      pullRequestGitHub.fillPullRequestBody(pullRequest);

      const expected = 'BODY TEXT' +
                       '<div id="top"></div>' +
                       '<div>ID1</div>' +
                       '<div>ID2</div>' +
                       '<div id="bottom"></div>';

      assert.equal(pullRequest.body, expected);
    });

  });

  describe('#buildBodyContent', () => {

    it('should put sections in correct order in body content', () => {
      const sections = {
        id1: 'content 1',
        id2: {
          content: 'content 2',
          position: 1
        },
        id3: {
          content: 'content 3',
          position: 10
        }
      };

      assert.equal(
        pullRequestGitHub.buildBodyContent(sections),
        '<div>content 2</div><div>content 3</div><div>content 1</div>'
      );
    });
  });

});
