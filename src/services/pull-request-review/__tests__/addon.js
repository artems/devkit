import proxyquire from 'proxyquire';

import teamMock from '../../team/__mocks__/dispatcher';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import schemaMock from '../../model/collections/__mocks__/schema';
import pullRequestReviewMock from '../__mocks__/index';

describe('services/pull-request-review/addon', function () {

  let options, imports;
  let team, events, logger;
  let service, pullRequestReviewStub;

  beforeEach(function () {
    team = teamMock();
    events = eventsMock();
    logger = loggerMock();

    options = {};
    imports = { team, events, logger };

    pullRequestReviewStub = function () {
      return pullRequestReviewStub;
    };
    pullRequestReviewMock(pullRequestReviewStub);

    service = proxyquire('../addon', {
      './class': {
        'default': pullRequestReviewStub
      }
    }).default;

  });

  describe('#extender', function () {

    it('should return patial schema', function () {
      const addon = service(options, imports);

      assert.isFunction(addon.extender);

      const extender = addon.extender();
      assert.isObject(extender);
    });

  });

  describe('#mixin', function () {
    let model, addon;

    beforeEach(function () {
      model = schemaMock();

      addon = service(options, imports);
      addon.mixin(model);
    });

    it('should pass call `stopReview`', function () {
      model.methods.stopReview();

      assert.called(pullRequestReviewStub.stopReview);
    });

    it('should pass call `startReview`', function () {
      model.methods.startReview();

      assert.called(pullRequestReviewStub.startReview);
    });

    it('should pass call `approveReview`', function () {
      model.methods.approveReview();

      assert.called(pullRequestReviewStub.approveReview);
    });

    it('should pass call `updateReviewers`', function () {
      model.methods.updateReviewers();

      assert.called(pullRequestReviewStub.updateReviewers);
    });

  });

});
