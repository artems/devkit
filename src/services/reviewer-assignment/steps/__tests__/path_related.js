import _ from 'lodash';
import service, {
  isMatchAny, isMatchAll, getFiles, incRank, decRank
} from '../path_related';

import { pullRequestMock } from
  '../../../model/collections/__mocks__/pull-request';
import { reviewMembersMock } from '../../__mocks__/index';
import { members as membersMock } from '../../../team-dispatcher/__mocks__/index';


describe('services/reviewer-assignment/steps/path_related', function () {

  describe('service', function() {
    let step, team, members, pullRequest, options;
    let reviewers, membersMap;

    beforeEach(() => {
      step = service();

      team = reviewMembersMock();

      members = ['Hulk'];

      pullRequest = pullRequestMock();

      options = {
        max: 5,
        members: members,
        incPattern: ['*.js'],
        decPattern: ['*.json']
      };

      reviewers = reviewMembersMock();

      membersMap = _.filter(reviewers, (member) => {
        return members.indexOf(member.login) !== -1;
      });

    });

    it('should inc/dec rank if pattern match', function (done) {
      const review = { team: team, pullRequest };

      pullRequest.files = [{ filename: 'a.js' }, { filename: 'b.json' }]
      pullRequest.review = { reviewers: membersMock() };

      step(review, options)
        .then(() => {
          const changedMembers = _.filter(reviewers, (member) => {
            members.indexOf(member.login) !== -1
          });

          _.forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank < membersMap[index].rank);
          });
        })
        .then(done, done);
    });
  });

  describe('#isMatch', function () {

    it('should return true if pattern match files pathes', function () {
      assert.isTrue(isMatchAny(['test.js', 'test.priv.js'], ['*.js']));
    });

    it('should return false if pattern doesn`t match files pathes', function () {
      assert.isFalse(isMatchAny(['test.js', 'test.priv.js'], ['*.css']));
    });

  });

  describe('#isMatchAll', function () {

    it('should return true if all patterns match files pathes', function () {
      assert.isTrue(isMatchAll(['test.js', 'test.priv.js'], ['*.js', 'test.*']));
    });

    it('should return false if not all patterns match files pathes', function () {
      assert.isFalse(isMatchAll(['test.js', 'test.priv.js'], ['*.js', '*.css']));
    });

  });

  describe('#getFiles', function () {

    it('should return promise resolved into files', function (done) {
      const files = [{ filename: '' }, { filename: '' }, { filename: '' }];

      const pullRequest = pullRequestMock();
      pullRequest.files = files;

      getFiles(pullRequest)
        .then(result => assert.deepEqual(result, ['', '', '']))
        .then(done, done);
    });

    it('should return rejected promise if there are no any files', function (done) {
      const pullRequest = pullRequestMock();

      pullRequest.files = [];

      getFiles(pullRequest)
        .then(() => assert.fail('should reject promise'))
        .catch(error => assert.match(error.message, /no files/i))
        .then(done, done);
    });
  });

  describe('incRank', function () {
    const members = ['Hulk', 'Hawkeye'];
    const reviewers = reviewMembersMock();

    const membersMap = _.filter(reviewers, (member) => {
      return members.indexOf(member.login) !== -1;
    });

    const options = { pattern: ['*.js'], max: 5, members };

    it('should increment rank for one random member of team', function (done) {
      const step = incRank(options, { team: reviewMembersMock() });

      step(['test.js'])
        .then(() => {
          const changedMembers = _.filter(reviewers, (member) => {
            members.indexOf(member.login) !== -1
          });

          _.forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank >= membersMap[index].rank);
          });
        })
        .then(done, done);
    });

    it('should not change rank if there are no matched pathes', function (done) {
      const step = incRank(options, { team: reviewMembersMock() });

      step(['test.css'])
        .then(() => {
          const changedMembers = _.filter(reviewers, (member) => {
            members.indexOf(member.login) !== -1
          });

          _.forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank === membersMap[index].rank);
          });
        })
        .then(done, done);
    });
  });

  describe('decRank', function () {
    const members = ['Hulk', 'Hawkeye'];
    const reviewers = reviewMembersMock();

    const membersMap = _.filter(reviewers, (member) => {
      return members.indexOf(member.login) !== -1;
    });

    const options = { pattern: ['*.js'], max: 5, members };

    it('should decrement rank for all members specified in options', function (done) {
      const step = decRank(options, { team: reviewMembersMock() });

      step(['test.js'])
        .then(() => {
          const changedMembers = _.filter(reviewers, (member) => {
            members.indexOf(member.login) !== -1
          });

          _.forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank < membersMap[index].rank);
          });
        })
        .then(done, done);
    });

    it('should not change rank if there is no matched pathes', function (done) {
      const step = decRank(options, { team: reviewMembersMock() });

      step(['test.css'])
        .then(() => {
          const changedMembers = _.filter(reviewers, (member) => {
            members.indexOf(member.login) !== -1
          });

          _.forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank === membersMap[index].rank);
          });
        })
        .then(done, done);
    });
  });
});
