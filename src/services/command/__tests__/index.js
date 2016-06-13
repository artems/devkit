import service from '../';
import queueMock from '../../queue/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/pull-request/__mocks__/';

describe('service/command', function () {

  let queue, events, logger, teamDispatcher;
  let pullRequest, PullRequestModel, commandHandlerStart;
  let options, imports, payload;

  beforeEach(function () {

    options = {
      events: ['github:issue_comment'],
      commands: [
        {
          id: 'start',
          test: ['/start'],
          handler: 'command-handler-start'
        }
      ]
    };

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();

    pullRequest = pullRequestMock();

    teamDispatcher = teamDispatcherMock();

    PullRequestModel = pullRequestModelMock();

    payload = {
      comment: {
        user: 'Spider-Man',
        body: '/start'
      },
      pullRequest: pullRequest
    };

    commandHandlerStart = sinon.stub().returns(Promise.resolve());

    imports = {
      queue,
      events,
      logger,
      'team-dispatcher': teamDispatcher,
      'pull-request-model': PullRequestModel,
      'command-handler-start': commandHandlerStart
    };

  });

  it('should subscribe on events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'github:issue_comment');
  });

  it('should dispatch event to handlers', function (done) {
    queue.dispatch
      .withArgs('pull-request#1')
      .callsArg(1);

    events.on
      .withArgs('github:issue_comment')
      .callsArgWith(1, payload);

    imports['command-handler-start'] = function (command, payload) {
      assert.equal(payload, payload);
      assert.equal(command, payload.comment.body);
      done();
    };

    service(options, imports);
  });

  it('should throw an error of handler is not given', function () {
    delete imports['command-handler-start'];

    assert.throws(() => service(options, imports), /not found/);
  });

});
