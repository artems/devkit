import service from '../index';
import githubMock from '../../../github/__mocks__/index';
import teamDispatcherMock from '../../__mocks__/';

describe('services/team-dispatcher/github', function () {

  let options, imports, team, github, teamDispatcher;

  beforeEach(function () {
    github = githubMock();
    teamDispatcher = teamDispatcherMock();

    teamDispatcher.addRoute = function (addTeam) {
      team = addTeam;
    };

    options = { orgName: 'nodejs' };

    imports = { github, 'team-dispatcher': teamDispatcher };
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
