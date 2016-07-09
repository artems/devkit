import service from '../index';
import serviceMock from '../__mocks__/';

import loggerMock from '../../logger/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/class';

describe('services/pull-request-review', function () {

  let options, imports, logger, events, teamManager;

  beforeEach(function () {
    options = {};

    logger = loggerMock();
    events = eventsMock();
    teamManager = teamManagerMock();

    imports = { events, logger, 'team-manager': teamManager };
  });

  it('the mock object should have the same methods', function () {

    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

});
