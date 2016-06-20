import service from '../';
import teamDispatcherMock from '../../__mocks__/';

describe('services/team-dispatcher/static', function () {

  let options, imports, team, teamDispatcher;

  beforeEach(function () {
    teamDispatcher = teamDispatcherMock();

    teamDispatcher.addRoute = function (addTeam) {
      team = addTeam;
    };

    options = { members: [{ login: 'A' }] };

    imports = { 'team-dispatcher': teamDispatcher };
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
