import PullRequestGitHub from '../class';
import githubMock from '../../github/__mocks__/index';
import pullRequestMock from '../../model/items/__mocks__/pull-request';
import { modelMock as pullRequestModelMock } from '../../model/items/__mocks__/pull-request';


describe('services/pull-request-github/class', function () {

  let github, pullRequest, PullRequestModel, pullRequestGitHub, options;

  beforeEach(function () {

    github = githubMock();
    pullRequest = pullRequestMock();
    PullRequestModel = pullRequestModelMock();

    options = {
      separator: {
        top: '<div id="top"></div>',
        bottom: '<div id="bottom"></div>'
      }
    };

    pullRequestGitHub = new PullRequestGitHub(github, PullRequestModel, options);
  });

  describe('#loadPullRequestFromGitHub', function () {

    it('should send a request to github for the pull request', function (done) {
      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.get,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number
            })
          );
          done();
        })
        .catch(done);
    });

    it('should return pull request loaded from github', function (done) {
      const data = {};
      github.pullRequests.get.callsArgWith(1, null, data);

      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .then(result => { assert.equal(result, data); done(); })
        .catch(done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.get.callsArgWith(1, err);

      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .catch(result => {
          assert.match(result.message, /just error/i);
          assert.match(result.message, /cannot.*github/i);
          done();
        })
        .catch(done);
    });

  });

  describe('#savePullRequestToDatabase', function () {

    beforeEach(function () {
      pullRequest.save.callsArgWith(0, null);
      PullRequestModel.findById.returns(Promise.resolve(pullRequest));
    });

    it('should save a pull request to database', function (done) {
      pullRequestGitHub.savePullRequestToDatabase(pullRequest)
        .then(result => {
          assert.equal(result, pullRequest);
          assert.calledWith(pullRequest.set, pullRequest);
          done();
        })
        .catch(done);
    });

    it('should reject promise if pull requset was not found', function (done) {
      PullRequestModel.findById.returns(Promise.resolve(null));

      pullRequestGitHub.savePullRequestToDatabase(pullRequest)
        .catch(result => { assert.match(result.message, /not found/); done(); })
        .catch(done);
    });

    it('should reject promise if pull requset was not found', function (done) {
      const err = new Error('just error');
      pullRequest.save.callsArgWith(0, err);

      pullRequestGitHub.savePullRequestToDatabase(pullRequest)
        .catch(result => {
          assert.match(result.message, /just error/i);
          assert.match(result.message, /cannot.*github/i);
          done();
        })
        .catch(done);
    });

  });

  describe('#updatePullRequestOnGitHub', function () {

    it('should send a request to github to update the pull request', function (done) {
      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.update,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number
            })
          );
          done();
        })
        .catch(done);
    });

    it('should return pull request', function (done) {
      github.pullRequests.update.callsArgWith(1, null);

      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .then(result => { assert.equal(result, pullRequest); done(); })
        .catch(done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.update.callsArgWith(1, err);

      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .catch(result => {
          assert.match(result.message, /just error/i);
          assert.match(result.message, /cannot update/i);
          done();
        })
        .catch(done);
    });

  });

  describe('#loadPullRequestFiles', function () {

    beforeEach(function () {
      github.pullRequests.getFiles.callsArgWith(1, null, []);
    });

    it('should send a request to github for the pull request files', function (done) {
      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.getFiles,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number,
              per_page: sinon.match.number
            })
          );
          done();
        })
        .catch(done);
    });

    it('should return pull request files loaded from github', function (done) {
      const data = [{ fiilename: 'a.txt' }];
      github.pullRequests.getFiles.callsArgWith(1, null, data);

      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .then(result => { assert.deepEqual(result, data); done(); })
        .catch(done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.getFiles.callsArgWith(1, err);

      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .catch(result => {
          assert.match(result.message, /just error/i);
          assert.match(result.message, /cannot.*files/i);
          done();
        })
        .catch(done);
    });

  });

  describe('#syncPullRequest', function () {

    it('should load pull request from github then save it to database', function (done) {
      sinon.stub(pullRequestGitHub, 'loadPullRequestFromGitHub').returns(Promise.resolve());
      sinon.stub(pullRequestGitHub, 'savePullRequestToDatabase').returns(Promise.resolve());

      pullRequestGitHub.syncPullRequest(pullRequest)
        .then(() => {
          assert(
            pullRequestGitHub.loadPullRequestFromGitHub.calledBefore(
              pullRequestGitHub.savePullRequestToDatabase
            )
          );

          done();
        })
        .catch(done);
    });

  });

  describe('#setBodySection', function () {

    beforeEach(function () {
      PullRequestModel.findById.returns(Promise.resolve(pullRequest));
      sinon.stub(pullRequestGitHub, 'syncPullRequest').returns(Promise.resolve(pullRequest));
      sinon.stub(pullRequestGitHub, 'savePullRequestToDatabase').returns(Promise.resolve(pullRequest));
      sinon.stub(pullRequestGitHub, 'updatePullRequestOnGitHub').returns(Promise.resolve(pullRequest));

      const section = {};
      pullRequest.section = section;
    });

    it('should save a pull request with updated property `section`', function (done) {

      pullRequestGitHub.setBodySection(pullRequest, 'section', 'body', 100)
        .then(result => {
          assert.called(pullRequestGitHub.syncPullRequest);
          assert.called(pullRequestGitHub.savePullRequestToDatabase);
          assert.called(pullRequestGitHub.updatePullRequestOnGitHub);

          assert.calledWith(
            pullRequest.set,
            sinon.match('section'),
            sinon.match({ section: { content: 'body', position: sinon.match.number } })
          );
          done();
        })
        .catch(done);
    });

    it('should not reject promise if section does not exists in the pull request', function (done) {
      pullRequest.section = null;

      pullRequestGitHub.setBodySection(pullRequest, 'section', 'body', 100)
        .then(() => done())
        .catch(done);
    });

  });

  describe('#cleanPullRequestBody', function () {

    it('should be able to clean pull request body from end', function () {
      const body = 'BODY TEXT\n<div id="top"></div>\nEXTRA BODY TEXT\n<div id="bottom"></div>';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');
    });

    it('should able to clean pull request body from begin', function () {
      const body = '<div id="top"></div>\nEXTRA BODY TEXT\n<div id="bottom"></div>\nBODY TEXT';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');

    });

    it('should able to clean pull request body from middle', function () {
      const body = 'BODY TEXT 1\n<div id="top"></div>\nEXTRA BODY TEXT\n<div id="bottom"></div>\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT 1\nBODY TEXT 2');

    });

    it('should not perform any edits if no separators exist', function () {
      const body = 'BODY TEXT 1\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);

    });

    it('should not perform any edits if only 1 separator exists', function () {
      const body = 'BODY TEXT 1\n<div id="top"></div>\nEXTRA BODY TEXT\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);

    });

  });

  describe('#fillPullRequestBody', function () {

    it('should be able to replace pull request body', function () {
      const body = 'BODY TEXT\n<div id="top"></div>\n<div>EXTRA BODY TEXT</div>\n<div id="bottom"></div>';

      const pullRequest = {
        body: body,
        section: {
          id1: 'ID1',
          id2: 'ID2'
        }
      };

      pullRequestGitHub.fillPullRequestBody(pullRequest);

      const expected = 'BODY TEXT<div id="top"></div><div>ID1</div><div>ID2</div><div id="bottom"></div>';

      assert.equal(pullRequest.body, expected);
    });

  });

  describe('#buildBodyContent', function () {

    it('should put sections in correct order in body content', function () {
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
