'use strict';

import _ from 'lodash';
import pullRequestModel from './model/pull_request';

class ModelAddons {

  /**
   * Register extenders and hooks for models.
   *
   * @constructor
   * @param {Object} hooks — objects which extends models.
   * @param {Object} extenders — objects which extends models.
   */
  constructor(hooks, extenders) {
    this.hooks = hooks || {};
    this.extenders = extenders || {};
  }

  /**
   * Return extenders and hooks for given model
   *
   * @param {String} model - model name.
   * @return {Object}
   */
  get(model) {
    return {
      hooks: this.hooks[model] || [],
      extenders: this.extenders[model] || []
    };
  }

  /**
   * Setup model pre save hooks.
   *
   * @param {String} model - model name.
   * @param {Object} schema - mongoose schema.
   */
  setupHooks(model, schema) {
    const hooks = this.get(model).hooks;

    if (Array.isArray(hooks.preSave)) {
      schema.pre('save', function (next) {
        const promise = [];

        _.forEach(hooks.preSave, hook => {
          promise.push(hook(this));
        });

        Promise.all(promise).then(next);
      });
    }
  }

  /**
   * Setup model extenders.
   *
   * @param {String} model - model name.
   * @param {Object} schema - model base schema.
   */
  setupExtenders(model, schema) {
    const extenders = this.get(model).extenders;

    _.forEach(extenders, extender => {
      _.extend(schema, extender);
    });
  }

}

export default function (options, imports, provide) {

  const addons = new ModelAddons(options.hooks, options.extenders);

  const mongoose = imports.mongoose;

  const setupModel = function (modelName) {
    return function (schema, model) {
      addons.setupHooks(modelName, model);
      addons.setupExtenders(modelName, schema);

      mongoose.model(modelName, model);
    };
  };

  pullRequestModel(setupModel('PullRequest'), mongoose);

  provide({
    get(modelName) {
      return mongoose.get(modelName);
    }
  });

}
