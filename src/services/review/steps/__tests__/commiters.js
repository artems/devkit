import service, {
  getFiles, getCommits, getCommiters, getSinceDate
} from '../commiters';

import githubMock from '../../../github/__mocks__/index';
import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';

describe('services/reviewer-assignment/steps/commiters', function () {
  let members, github, commit, files, pullRequest;
  let ignorePatterns = [];

  const filesToCheck = 10;
  const commitsCount = 2;

  beforeEach(function () {

    members = reviewMembersMock();

    commit = sinon.stub();
    commit.callsArgWithAsync(1, null, []);

    github = githubMock();
    github.repos.getCommits = commit;

    files = [
      { filename: 'a.txt' },
      { filename: 'b.txt' },
      { filename: 'c.txt' }
    ];

    pullRequest = pullRequestMock();
    pullRequest.files = files;
    pullRequest.repository = { name: 'hubot', owner: { login: 'github' } };

  });

  describe('#getFiles', function () {
    it('should return an empty array if pull request has no files', function (done) {
      pullRequest.files = [];

      getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => assert.deepEqual(result, []))
        .then(done, done);
    });

    it('should return files without ignored', function (done) {
      ignorePatterns = ['a.txt', 'b.txt'];

      getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => assert.deepEqual(result, [{ filename: 'c.txt' }]))
        .then(done, done);
    });

    it('should return no more then `filesToCheck` files', function (done) {
      getFiles(pullRequest, ignorePatterns, 1)
        .then(result => assert.lengthOf(result, 1))
        .then(done, done);
    });

  });

  describe('#getCommits', function () {

    let helper, since;

    beforeEach(function () {
      since = '2015-01-01T01:00:00Z';
      helper = getCommits(github, pullRequest, since, commitsCount);
    });

    it('should return commits associated with files', function (done) {
      commit
        .withArgs(sinon.match({ path: 'a.txt' }))
        .callsArgWithAsync(1, null, [
          { author: { login: 'Captain America' } }
        ]);

      commit
        .withArgs(sinon.match({ path: 'b.txt' }))
        .callsArgWithAsync(1, null, [
          { author: { login: 'Captain America' } },
          { author: { login: 'Hawkeye' } },
          { author: { login: 'Thor' } }
        ]);

      const expected = [
        { author: { login: 'Captain America' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } }
      ];

      helper(files)
        .then(result => assert.deepEqual(result, expected))
        .then(done, done);
    });

  });

  describe('#getCommiters', function () {

    let commits;

    beforeEach(function () {
      commits = [
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } }
      ];
    });

    it('should return hash: `members` with number of commits', function (done) {
      const expected = { 'Captain America': 3, Hawkeye: 2, Thor: 2 };

      getCommiters(commits)
        .then(result => assert.deepEqual(result, expected))
        .then(done, done);
    });

    it('should skip commits without author', function (done) {
      commits.push({});
      commits.unshift({});

      getCommiters(commits)
        .then(() => null)
        .then(done, done);
    });

  });

  describe('#getSinceDate', function () {

    it('should property format date', function () {
      const date = +new Date(getSinceDate([2, 'days']));
      assert.isAbove(date, +new Date() - 3 * 24 * 3600 * 1000);
      assert.isBelow(date, +new Date() - 1 * 24 * 3600 * 1000);
    });

    it('should return an empty string if no date is given', function () {
      assert.equal(getSinceDate(), '');
    });

  });

  it('should increase rank if member is an author of the last commits', function (done) {
    const review = { team: members, pullRequest };
    const commit = sinon.stub();
    const options = {
      max: 4,
      ignore: ignorePatterns,
      commitsCount,
      filesToCheck
    };

    commit.callsArgWith(1, null, []);

    commit
      .withArgs(sinon.match({ path: 'a.txt' }))
      .callsArgWith(1, null, [
        { author: { login: 'Captain America' } },
        { author: { login: 'Iron Man' } }
      ]);

    github.repos.getCommits = commit;

    const membersAltered = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 9 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 11 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Thor', rank: 3 }
    ];

    const commiters = service({}, { github });

    commiters(review, options)
      .then(review => assert.deepEqual(review.team, membersAltered))
      .then(done, done);
  });

  it('should do nothing if there is no team in a review object', function (done) {
    const review = { team: [] };

    const commiters = service({}, {});

    commiters(review, {})
      .then(() => null)
      .then(done, done);
  });

});