import service from '../';
import teamManagerMock from '../../__mocks__/';

describe('services/team-manager/static', function () {

  let options, imports, team, teamManager;

  beforeEach(function () {
    teamManager = teamManagerMock();

    teamManager.addRoute = function (addTeam) {
      team = addTeam;
    };

    options = { members: [{ login: 'A' }] };

    imports = { 'team-manager': teamManager };
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
