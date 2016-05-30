import service from '../addon';
import schemaMock from '../../model/collections/__mocks__/schema';
import staticMock from '../../model/collections/__mocks__/static';

describe('services/pull-request-review/addon', function () {

  let options, imports, model;

  beforeEach(function () {
    model = schemaMock();

    options = {};
    imports = {};
  });

  describe('#mixin', function () {

    it('should setup static methods', function () {
      const addon = service(options, imports);

      assert.isFunction(addon.mixin);

      addon.mixin(model);

      assert.deepProperty(model, 'statics.findInReview');
      assert.deepProperty(model, 'statics.findByReviewer');
      assert.deepProperty(model, 'statics.findInReviewByReviewer');
    });

    describe('', function () {

      let addon, staticStub;

      beforeEach(function () {
        staticStub = staticMock();

        model.statics.model = sinon.stub().returns(staticStub);

        addon = service(options, imports);
        addon.mixin(model);
      });

      describe('#findByReviewer', function () {

        it('should build query', function () {
          model.statics.findByReviewer();

          assert.called(staticStub.find);
          assert.called(staticStub.exec);
        });

      });

      describe('#findInReview', function () {

        it('should build query', function () {
          model.statics.findInReview();

          assert.called(staticStub.find);
          assert.called(staticStub.exec);
        });

      });

      describe('#findInReviewByReviewer', function () {

        it('should build query', function () {
          model.statics.findInReviewByReviewer();

          assert.called(staticStub.find);
          assert.called(staticStub.exec);
        });

      });

    });

  });

  describe('#extender', function () {

    it('should return patial schema', function () {
      const addon = service(options, imports);

      assert.isFunction(addon.extender);

      const extender = addon.extender();
      assert.isObject(extender);
    });

  });

});
