import _ from 'lodash';

import { mockMembers } from '../../__mocks__/index';
import service, { getFiles, getCommits, getCommiters, getSinceDate } from '../../steps/commiters';

describe('services/choose-reviewer/steps/commiters', () => {
  let members, github, commit, files, pullRequest;
  let ignorePatterns = [];

  const filesToCheck = 10;
  const commitsCount = 2;

  beforeEach(() => {
    members = _.cloneDeep(mockMembers);

    commit = sinon.stub();
    commit.callsArgWithAsync(1, null, []);

    github = {
      repos: { getCommits: commit }
    };

    files = sinon.stub();

    pullRequest = {
      repository: { name: 'hubot', owner: { login: 'github' } },
      get: files
    };

    files.withArgs('files').returns([
      { filename: 'a.txt' },
      { filename: 'b.txt' },
      { filename: 'c.txt' }
    ]);
  });

  describe('#getFiles', function () {
    it('should return an empty array if pull request has no files', function (done) {
      files.withArgs('files').returns([]);

      getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => {
          assert.deepEqual(result, []);
          done();
        })
        .catch(done);
    });

    it('should return files without ignored', function (done) {
      ignorePatterns = ['a.txt', 'b.txt'];

      getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => {
          assert.deepEqual(result, [{ filename: 'c.txt' }]);
          done();
        })
        .catch(done);
    });

    it('should return no more then `filesToCheck` files', function (done) {
      getFiles(pullRequest, ignorePatterns, 1)
        .then(result => {
          assert.lengthOf(result, 1);
          done();
        })
        .catch(done);
    });

  });

  describe('#getCommits', function () {

    let helper, since; // eslint-disable-line
    beforeEach(function () {
      since = '2015-01-01T01:00:00Z';
      helper = getCommits(github, pullRequest, since, commitsCount);
    });

    it('should return commits associated with files', function (done) {
      const files = pullRequest.get('files');

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
        .then(result => {
          assert.deepEqual(result, expected);
          done();
        })
        .catch(done);
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
        .then(result => {
          assert.deepEqual(result, expected);
          done();
        })
        .catch(done);
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

    it('should return an empty string if no date given', function () {
      assert.equal(getSinceDate(), '');
    });

  });

  it('should increase rank if member is an author of the last commits', done => {
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

    const commiters = service(options, { github });

    commiters(review)
      .then(review => {
        assert.deepEqual(review.team, membersAltered);
        done();
      })
      .catch(done);
  });

  it('should do nothing if no team in a review object', function (done) {
    const review = { team: [] };

    const commiters = service({}, {});

    commiters(review)
      .then(() => null)
      .then(done, done);
  });

});
