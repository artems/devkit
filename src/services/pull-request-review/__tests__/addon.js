import service from '../addon';
import schemaMock from '../../model/collections/__mocks__/schema';

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
