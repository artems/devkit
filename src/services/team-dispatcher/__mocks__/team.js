export default function mock(member) {

  return {
    findTeamMember: sinon.stub().returns(Promise.resolve(member)),
    getMembersForReview: sinon.stub().returns(Promise.resolve([]))
  };

}
