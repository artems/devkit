import service from '../index';
import modelMock from '../../model/__mocks__/index';

describe('services/pull-request-model', function () {

  let options, imports;

  it('should be resolved to PullRequest', function () {

    options = {};
    imports = { model: modelMock() };

    const model = service(options, imports);

    assert.property(model, 'findById');
    assert.property(model, 'findByUser');
    assert.property(model, 'findByReviewer');
    assert.property(model, 'findInReviewByReviewer');
    assert.property(model, 'findByRepositoryAndNumber');

  });

});
