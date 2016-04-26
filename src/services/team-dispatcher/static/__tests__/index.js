import service from '../index';
import StaticTeam from '../static';
import { members } from '../../__mocks__/index';

describe('services/team/static', function () {

  it('should be resolved to Team', function () {

    const options = { members: members() };

    const team = service(options);

    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');

  });

  it('should set options for team', function () {
    const options = {
      members: members(),
      overrides: { approveCount: 10 }
    };

    const team = service(options);

    assert.equal(team.getOption('approveCount'), 10);
  });

  describe('StaticTeam', function () {

    it('should return team members', function (done) {
      const group = [{ login: 'a' }, { login: 'b' }];
      const team = new StaticTeam(group);

      team.getMembersForReview()
        .then(result => {
          assert.deepEqual(result, group);
          done();
        })
        .catch(done);
    });

    it('should return a clone of members', function (done) {
      const group = [{ login: 'a' }, { login: 'b' }];
      const team = new StaticTeam(group);

      team.getMembersForReview()
        .then(result => {
          assert.notEqual(result, group);
          done();
        })
        .catch(done);
    });

    it('should throws an error if members are not given', function () {
      assert.throws(() => new StaticTeam());
    });

    it('should throws error if members is an empty array', function () {
      assert.throws(() => new StaticTeam([]));
    });

  });
});
