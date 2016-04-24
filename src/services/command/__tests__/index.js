import { forEach } from 'lodash';

import service, { constructRegexp } from '../index';
import queueMock from '../../queue/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import { pullRequestModelMock } from
  '../../model/collections/__mocks__/pull-request';

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

describe('service/command', function () {

  let queue, events, logger, PullRequestModel, commandHandlerStart;
  let options, imports;

  beforeEach(function () {

    options = {
      events: ['github:issue_comment'],
      commands: [{ test: '/start', handlers: ['command-handler-start'] }]
    };

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();
    PullRequestModel = pullRequestModelMock();

    commandHandlerStart = sinon.stub();

    imports = {
      queue,
      events,
      logger,
      'pull-request-model': PullRequestModel,
      'command-handler-start': commandHandlerStart
    };

  });

  it('should subscribe on events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'github:issue_comment');
  });

  describe('#constructRegexp', function () {

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

      const regexp = constructRegexp(command.test);

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

});
