import schemaModelMock from '../__mocks__/schema';
import pullRequestMock from '../__mocks__/pull-request';
import * as pullRequestModel from '../pull-request';

describe('services/model/items/pull-request', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = pullRequestModel.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
      assert.property(schema, 'number');
    });

  });

  describe('#setupModel', function () {

    let model, pullRequest;
    beforeEach(function () {
      model = schemaModelMock();
      pullRequest = pullRequestMock();

      pullRequestModel.setupModel('pull_request', model);
    });

    it('should add method "toString"', function () {
      assert.isFunction(model.methods.toString);
      assert.equal(model.methods.toString.call(pullRequest), '[1 – title] html_url');
    });

  });

});
