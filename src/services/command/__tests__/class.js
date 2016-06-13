import { forEach } from 'lodash';
import CommandDispatcher, { buildRegExp } from '../class';
import teamMock from '../../team-dispatcher/__mocks__/team';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/';

describe('services/command/class', function () {

  let team, teamDispatcher;

  beforeEach(function () {
    team = teamMock();

    teamDispatcher = teamDispatcherMock();
    teamDispatcher.findTeamByPullRequest.returns(team);
  });

  it('should take an empty array if commands list is not given', function () {
    const dispatcher = new CommandDispatcher(teamDispatcher);

    assert.isArray(dispatcher.store);
    assert.lengthOf(dispatcher.store, 0);
  });

  describe('#dispatch', function () {

    let h1, h2, h3;
    let payload, comment, store;

    beforeEach(function () {
      h1 = sinon.stub().returns(Promise.resolve());
      h2 = sinon.stub().returns(Promise.resolve());
      h3 = sinon.stub().returns(Promise.reject(new Error('just error')));

      store = [];
      payload = {};
      comment = 'first line\n/fireball\nthird line';
    });

    it('should dispatch each line of comment to each command', function (done) {
      store = [
        {
          id: 'all',
          test: ['.*'],
          handler: h1
        },
        {
          id: 'fireball',
          test: ['/fireball'],
          handler: h2
        }
      ];

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledThrice(h1);
          assert.calledOnce(h2);
        })
        .then(done, done);
    });

    it('should execute each command only once for each line', function (done) {
      store = [
        {
          id: 'all',
          test: ['.*', '/fireball'],
          handler: h1
        }
      ];

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.calledThrice(h1))
        .then(done, done);
    });

    it('should take regexp for command from team config', function (done) {
      store = [
        {
          id: 'fireball',
          test: ['/fireball'],
          handler: h1
        }
      ];

      team.getOption
        .withArgs('command.regexp.fireball')
        .returns(['first line']);

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.calledTwice(h1))
        .then(done, done);
    });

    it('should return rejected promise if command handler was rejected', function (done) {
      store = [
        {
          id: 'all',
          test: ['.*'],
          handler: h1
        },
        {
          id: 'fireball',
          test: ['/fireball'],
          handler: h3
        }
      ];

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

    it('should pass parsed arguments from RegExp to handler', function (done) {
      store = [
        {
          id: 'change',
          test: ['/change @(\\w+) to @(\\w+)'],
          handler: h1
        }
      ];

      comment = '/change @old to @new';

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledWith(h1, comment, payload, sinon.match(function (arglist) {
            assert.deepEqual(arglist, ['old', 'new']);
            return true;
          }));
        })
        .then(done, done);
    });

    it('should return rejected promise if team is not found', function (done) {
      teamDispatcher.findTeamByPullRequest.returns(null);

      const dispatcher = new CommandDispatcher(teamDispatcher, store);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

  });

});

describe('services/command/#buildRegExp', function () {

  function makePositiveCases(command) {
    return [
      `${command}`,
      `Lorem ipsum dolor sit amet ${command}`,
      `${command} lorem ipsum dolor sit amet`,
      `Lorem ipsum dolor sit amet, ${command} consectetur adipisicing elit`,
      `Lorem ipsum dolor sit amet,\n${command} consectetur adipisicing elit`
    ];
  }

  function makeNegativeCases(command) {
    return [
      `Lorem ipsum dolor sit amet${command}`,
      `${command}lorem ipsum dolor sit amet`,
      `lorem ipsum dolor${command} sit amet`
    ];
  }

  const testCases = [
    {
      test: '/command',
      positive: makePositiveCases('/command')
    },
    {
      test: '/command|/команда|ok',
      positive: [].concat(
        makePositiveCases('/command'),
        makePositiveCases('/команда'),
        'ok Lorem ipsum dolor sit amet'
      ),
      negative: [].concat(
        makeNegativeCases('ok'),
        makePositiveCases('!ok'),
        makeNegativeCases('command'),
        makeNegativeCases('команда')
      )
    }
  ];

  testCases.forEach(command => {

    const regexp = buildRegExp(command.test);

    forEach(command.positive, (comment) => {
      it('should find command using regexp — ' + command.test, function () {
        assert.match(comment, regexp);
      });
    });

    forEach(command.negative, (comment) => {
      it('should not find command using regexp — ' + command.test, function () {
        assert.notMatch(comment, regexp);
      });
    });

  });

});
