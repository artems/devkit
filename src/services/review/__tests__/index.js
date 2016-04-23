import service from '../index';

import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import reviewAssignmentMock from '../__mocks__/index';

describe('services/reviewer-assignment', function () {

  it('should be resolved to ReviewerAssignment', function () {
    const model = modelMock();
    const logger = loggerMock();

    const options = { steps: ['step1', 'step2'] };
    const imports = { model, logger };

    const distributor = service(options, imports);

    assert.property(distributor, 'choose');
  });

  it('the mock object should have the same methods', function () {
    const mock = reviewAssignmentMock();

    assert.property(mock, 'choose');
  });

});
