'use strict';

import * as complexity from './complexity';

export const MAX_COMPLEXITY = 40;

export default function setup(options, imports) {

  return {

    /**
     * Pre save hook for pull_request model which calculates pull request complexity.
     *
     * @param {Object} model - pull request object
     */
    mixin: function (model) {

      model.pre('save', function (next) {
        let value = 0;

        value += complexity.additionsComplexity(model.additions);
        value += complexity.deletionsComplexity(model.deletions);
        value += complexity.commitsComplexity(model.commits);

        this.complexity = (value * 100) / MAX_COMPLEXITY;

        next();
      });

    },

    /**
     * Extend pull_request model to add complexity rate.
     *
     * @return {Object}
     */
    extender: function () {

      return {
        complexity: {
          type: Number,
          'default': 0
        }
      };

    }

  };

}
