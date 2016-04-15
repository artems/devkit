import service from '../index';
import GitHubTeam from '../github';
import githubMock from '../../../github/__mocks__/index';

describe('services/team/github', function () {

  it('should be resolved to Team', function () {

    const options = {
      orgName: 'nodejs'
    };

    const imports = {
      github: githubMock()
    };

    const team = service(options, imports);

    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');

  });

  describe('GitHubTeam', function () {

    let github;

    beforeEach(function () {
      github = githubMock();
    });

    it('should use method `getMembers` to obtain team if slug is not given', function (done) {
      github.orgs.getMembers.callsArgWith(1, null, []);

      const team = new GitHubTeam(github, 'nodejs');

      team.getMembersForReview()
        .then(() => {
          assert.calledWith(github.orgs.getMembers, sinon.match({ org: 'nodejs' }));
          done();
        })
        .catch(done);
    });

    it('should use method `getTeamMembers` to obtain team if slug is given', function (done) {
      github.orgs.getTeams.callsArgWith(1, null, [{ id: 42, slug: 'devs' }]);
      github.orgs.getTeamMembers.callsArgWith(1, null, []);

      const team = new GitHubTeam(github, 'nodejs', 'devs');

      team.getMembersForReview()
        .then(() => {
          assert.calledWith(github.orgs.getTeamMembers, sinon.match({ id: 42 }));
          done();
        })
        .catch(done);
    });

    describe('#getTeamId', function () {

      it('should rejected promise if github return error', function (done) {
        github.orgs.getTeams.callsArgWith(1, new Error('just error'));

        const team = new GitHubTeam(github, 'nodejs', 'devs');

        team.getTeamId('github', 'devs')
          .catch(error => {
            assert.match(error.message, /just error/);
            done();
          })
          .catch(done);
      });

      it('should rejected promise if team is not found', function (done) {
        github.orgs.getTeams.callsArgWith(1, null, []);

        const team = new GitHubTeam(github, 'nodejs', 'devs');

        team.getTeamId('github', 'devs')
          .catch(error => {
            assert.match(error.message, /not found/);
            done();
          })
          .catch(done);
      });

    });

    describe('#getMembersByOrgName', function () {

      it('should rejected promise if github return error', function (done) {
        github.orgs.getMembers.callsArgWith(1, new Error('just error'));

        const team = new GitHubTeam(github, 'nodejs', 'devs');

        team.getMembersByOrgName('github')
          .catch(error => {
            assert.match(error.message, /just error/);
            done();
          })
          .catch(done);
      });

    });

    describe('#getMembersByTeamId', function () {

      it('should rejected promise if github return error', function (done) {
        github.orgs.getTeamMembers.callsArgWith(1, new Error('just error'));

        const team = new GitHubTeam(github, 'nodejs', 'devs');

        team.getMembersByTeamId(1)
          .catch(error => {
            assert.match(error.message, /just error/);
            done();
          })
          .catch(done);
      });

    });

  });

});
