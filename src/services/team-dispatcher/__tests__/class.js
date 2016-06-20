import TeamDispatcher from '../class';
import { pullRequestMock } from '../../model/pull-request/__mocks__/';

describe('services/team/class', function () {

  let pullRequest;

  beforeEach(function () {
    pullRequest = pullRequestMock();

    pullRequest.repository.full_name = 'nodejs/node';
  });

  ['findTeamByPullRequest', 'findTeamNameByPullRequest'].forEach(method => {

    describe('#' + method, () => {

      it('should use the first matched route', function () {

        const dispatcher = new TeamDispatcher();
        dispatcher.addRoute('team1', 'team1', 'github/hubot');
        dispatcher.addRoute('team2', 'team2', 'nodejs/node');
        dispatcher.addRoute('team3', 'team3', '*');

        const result = dispatcher[method](pullRequest);

        assert.equal(result, 'team2');

      });

      it('should interpret "*" as "always match"', function () {
        const dispatcher = new TeamDispatcher();
        dispatcher.addRoute('team1', 'team1', '*');

        const result = dispatcher[method](pullRequest);

        assert.equal(result, 'team1');
      });

      it('should understand wildcard', function () {
        const dispatcher = new TeamDispatcher();
        dispatcher.addRoute('team1', 'team1', 'nodejs/*');

        const result = dispatcher[method](pullRequest);

        assert.equal(result, 'team1');
      });

      it('should return a null if there are no matched routes', function () {
        const dispatcher = new TeamDispatcher();
        dispatcher.addRoute('team1', 'team1', 'other-org/other-repo');

        const result = dispatcher[method](pullRequest);

        assert.isNull(result);
      });

    });

  });

});
