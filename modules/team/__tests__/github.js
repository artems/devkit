import GitHubTeam from '../github';

describe('module/team/github', function () {

  let github;

  const pull = {
    org: 'devexp-org'
  };

  beforeEach(function () {
    github = {
      orgs: {
        getTeams: sinon.stub(),
        getMembers: sinon.stub(),
        getTeamMembers: sinon.stub()
      }
    };
  });

  afterEach(function () {
    github = null;
  });

  it('should use method `getMembers` to obtain team if no slug name was given', function (done) {
    const gt = new GitHubTeam(github);
    const teamPromise = gt.getTeam(pull);

    setTimeout(function () {
      github.orgs.getMembers.callArgWith(1, null, []);
    }, 0);

    teamPromise
      .then(() => {
        assert.calledWith(
          github.orgs.getMembers,
          { org: 'devexp-org', per_page: 100 }
        );
        done();
      })
      .catch(done)
  });

  it('should use method `getTeamMembers` to obtain team if slug name was given', function (done) {
    const gt = new GitHubTeam(github, 'devs');
    const teamPromise = gt.getTeam(pull);

    setTimeout(function () {
      github.orgs.getTeams.callArgWith(1, null, [{ id: 42, slug: 'devs' }]);
    }, 0);

    setTimeout(function() {
      github.orgs.getTeamMembers.callArgWith(1, null, []);
    }, 10);

    teamPromise
      .then(() => {
        assert.calledWith(
          github.orgs.getTeamMembers,
          { id: 42, per_page: 100 }
        );
        done();
      })
      .catch(done)
  });

});

