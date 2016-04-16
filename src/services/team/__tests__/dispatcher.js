import TeamDispatcher from '../dispatcher';
import { pullRequestMock } from '../../model/collections/__mocks__/pull-request';

describe('services/team/dispatcher', () => {

  let pullRequest;

  beforeEach(() => {

    pullRequest = pullRequestMock();
    pullRequest.repository.full_name = 'nodejs/node';

  });

  ['findTeamByPullRequest', 'findTeamNameByPullRequest'].forEach(method => {

    describe('#' + method, () => {

      it('should use the first matched route', () => {
        const routes = [
          { pattern: 'github/hubot', name: 'team1', team: 'team1' },
          { pattern: 'nodejs/node', name: 'team2', team: 'team2' },
          { pattern: '*', name: 'team3', team: 'team3' }
        ];

        const result = (new TeamDispatcher(routes))[method](pullRequest);

        assert.equal(result, 'team2');
      });

      it('should interpret "*" as "always match"', () => {
        const routes = [
          { pattern: '*', name: 'team1', team: 'team1' }
        ];

        const result = (new TeamDispatcher(routes))[method](pullRequest);

        assert.equal(result, 'team1');
      });

      it('should understand wildcard', () => {
        const routes = [
          { pattern: 'nodejs/*', name: 'team1', team: 'team1' }
        ];

        const result = (new TeamDispatcher(routes))[method](pullRequest);

        assert.equal(result, 'team1');
      });

      it('should return a null if there are no matched routes', () => {
        const routes = [
          { pattern: 'other-org/other-repo', name: 'team1', team: 'team1' }
        ];

        const result = (new TeamDispatcher(routes))[method](pullRequest);

        assert.isNull(result);
      });

      it('should not throw an error if routes are not given', () => {
        assert.doesNotThrow(() => (new TeamDispatcher())[method](pullRequest));
      });

    });

  });

});
