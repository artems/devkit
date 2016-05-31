import schemaModelMock, { virtualMock } from '../__mocks__/schema';
import staticModelMock from '../__mocks__/static';
import { pullRequestMock } from '../__mocks__/pull-request';
import * as pullRequestModel from '../pull-request';

describe('services/model/collections/pull-request', function () {

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
    });

    it('should add the method "toString"', function () {
      pullRequestModel.setupModel('pull_request', model);

      assert.equal(model.methods.toString.call(pullRequest), '[1 – title] html_url');
    });

    it('should add virtual property "id"', function () {
      const virtual = virtualMock();
      model.virtual
        .withArgs('id')
        .returns(virtual);

      pullRequestModel.setupModel('pull_request', model);

      virtual.get.callArgOn(0, pullRequest);
      virtual.set.callArgOnWith(0, pullRequest, 1);
    });

    describe('#owner', function () {

      it('should add virtual property "owner"', function () {
        const virtual = virtualMock();
        model.virtual
          .withArgs('owner')
          .returns(virtual);

        pullRequestModel.setupModel('pull_request', model);

        virtual.get.callArgOn(0, pullRequest);
      });

      it('should return an empty string if owner is not set', function () {
        const virtual = virtualMock();
        model.virtual
          .withArgs('owner')
          .returns(virtual);

        pullRequest.repository = {};

        pullRequestModel.setupModel('pull_request', model);

        virtual.get.callArgOn(0, pullRequest);
      });

    });

    describe('(static)', function () {

      let staticMock;
      beforeEach(function () {
        staticMock = staticModelMock();

        pullRequestModel.setupModel('pull_request', model);
      });

      it('should add static method "findByUser"', function () {
        model.statics.findByUser.call(staticMock, 'user');
        assert.called(staticMock.exec);
      });

      it('should add static method "findByRepositoryAndNumber"', function () {
        model.statics.findByRepositoryAndNumber.call(staticMock, 'user');
        assert.called(staticMock.exec);
      });

    });

  });

});
