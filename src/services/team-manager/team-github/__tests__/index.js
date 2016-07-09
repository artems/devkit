import service from '../index';
import githubMock from '../../../github/__mocks__/index';
import teamManagerMock from '../../__mocks__/';

describe('services/team-manager/github', function () {

  let options, imports, team, github, teamManager;

  beforeEach(function () {
    github = githubMock();
    teamManager = teamManagerMock();

    teamManager.addRoute = function (addTeam) {
      team = addTeam;
    };

    options = { orgName: 'nodejs' };

    imports = { github, 'team-manager': teamManager };
  });

  it('should be resolved to AbstractTeam', function () {
    service(options, imports);

    assert.property(team, 'getOption');
    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');
  });

  it('should pass team options', function () {
    options.overrides = { approveCount: 10 };

    service(options, imports);

    assert.equal(team.getOption('approveCount'), 10);
  });

});
