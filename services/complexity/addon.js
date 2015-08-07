'use strict';

import * as complex from '../modules/complexity';

const MAX = 40;

/**
 * Extend pull_request model to add complexity rate.
 *
 * @return {Object}
 */
export function extender() {

  return {
    complexity: {
      type: Number,
      'default': 0
    }
  };

}

/**
 * Pre save hook for pull_request model which calculates pull request complexity.
 *
 * @param {Object} model - pull request object
 *
 * @return {Promise}
 */
export function saveHook(model) {

  return new Promise(resolve => {
    let complexity = 0;

    complexity += complex.additionsComplexity(model.additions);
    complexity += complex.deletionsComplexity(model.deletions);
    complexity += complex.commitsComplexity(model.commits);

    model.complexity = (complexity * 100) / MAX;

    resolve();
  });

}
