import Team from '../team';

describe('services/team', function () {

  describe('Team', function () {

    let team;
    beforeEach(function () {
      team = new Team();
    });

    describe('#getMembersForReview', function () {

      it('should return promise of an empty array', function (done) {
        team.getMembersForReview()
          .then(members => {
            assert.isArray(members);
            assert.lengthOf(members, 0);
            done();
          })
          .catch(done);

      });

    });

    describe('#findTeamMember', function () {

      it('should find member by login', function (done) {
        sinon.stub(team, 'getMembersForReview').returns(Promise.resolve([
          { id: 1, login: 'a' }, { id: 2, login: 'b' }, { id: 3, login: 'c' }
        ]));

        team.findTeamMember(null, 'b')
          .then(member => {
            assert.deepEqual(member, { id: 2, login: 'b' });
            done();
          })
          .catch(done);

      });

    });
  });

});

