import Team from '../../team';

describe('module/team', function () {

  const pull = {
    repo: { full_name : 'devexp-org/devexp' }
  };

  it('should use the first matched route', function() {
    const source1 = sinon.stub();
    const source2 = sinon.stub();
    const source3 = sinon.stub();

    const routes = [
      { pattern: 'otherorg-org/devexp', source: source1 },
      { pattern: 'devexp-org/devexp', source: source2 },
      { pattern: '*', source: source3 }
    ];

    const team = (new Team(routes)).findByPullRequest(pull);

    assert.called(source2);
    assert.notCalled(source1);
    assert.notCalled(source3);
  });

  it('should interpret "*" as "always match"', function() {
    const source = sinon.stub();

    const routes = [
      { pattern: '*', source: source }
    ];

    const team = new Team(routes).findByPullRequest(pull);

    assert.called(source);
  });

  it('should understand wildcard', function() {
    const source = sinon.stub();

    const routes = [
      { pattern: 'devexp-*/*', source: source }
    ];

    const team = new Team(routes).findByPullRequest(pull);

    assert.called(source);
  });

  it('should return an empty array if there are no matched routes', function() {
    const source = sinon.stub();

    const routes = [
      { pattern: 'other-org/other-repo', source: source }
    ];

    const team = new Team(routes).findByPullRequest(pull);

    assert.lengthOf(team, 0);
    assert.notCalled(source);
  });

});
