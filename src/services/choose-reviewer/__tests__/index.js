import service  from '../index';

import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/dispatcher';

describe('services/choose-reviewer', function () {

    it('should be resolved to ChooseReviewer', function () {
      const model = modelMock();
      const logger = loggerMock();
      const teamDispatcher = teamDispatcherMock();

      const options = { steps: ['step1', 'step2'] };
      const imports = { model, logger };

      assert.property(service(options, imports), 'review');
    });

});
