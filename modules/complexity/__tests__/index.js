'use strict';

import * as complexity from '../../complexity';

describe('modules/complexity', function () {

  describe('#additionsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.additionsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      assert.ok(complexity.additionsComplexity(100) > 0);

      assert.ok(
        complexity.additionsComplexity(50)
        < complexity.additionsComplexity(200)
      );
    });

  });

  describe('#deletionsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.deletionsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      assert.ok(complexity.deletionsComplexity(100) > 0);

      assert.ok(
        complexity.deletionsComplexity(50)
        < complexity.deletionsComplexity(200)
      );
    });

  });

  describe('#commitsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.commitsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      assert.ok(complexity.commitsComplexity(100) > 0);

      assert.ok(
        complexity.commitsComplexity(1)
        < complexity.commitsComplexity(5)
      );
    });

  });

});
