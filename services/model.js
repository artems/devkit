'use strict';

import _ from 'lodash';
import pullRequestModel from './model/pull_request';

class AddonBroker {

  /**
   * @constructor
   */
  constructor() {
    this.hooks = {}
    this.extenders = {}
  }

  /**
   * Return hooks and extenders for given model
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
   * Add pre save hook for given model
   *
   * @param {String} model - model name.
   * @param {Function} hook - pre save hook.
   */
  addHook(model, hook) {
    if (hook) {
      if (!this.hooks[model]) {
        this.hooks[model] = [];
      }
      this.hooks[model].push(hook);
    }
  }

  /**
   * Add extender for given model
   *
   * @param {String} model - model name.
   * @param {Function} extender
   */
  addExtender(model, extender) {
    if (extender) {
      if (!this.extenders[model]) {
        this.extenders[model] = []
      }
      this.extenders[model].push(extender);
    }
  }

  /**
   * Setup model pre save hooks.
   *
   * @param {String} model - model name.
   * @param {Object} object - mongoose model.
   */
  setupHooks(model, object) {
    const hooks = this.get(model).hooks;

    object.pre('save', function (next) {
      const promise = [];

      _.forEach(hooks, hook => {
        promise.push(hook(this));
      });

      Promise.all(promise).then(next);
    });
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
      _.extend(schema, extender(schema));
    });
  }

}

export default function (options, imports, provide) {

  const mongoose = imports.mongoose;
  const addonBroker = new AddonBroker();

  _.forEach(options.addons, (list, modelName) => {
    _.forEach(list, addon => {
      const m = require(addon);
      addonBroker.addHook(modelName, m.hook);
      addonBroker.addExtender(modelName, m.extender);
    });
  });

  const setupModel = function (modelName) {
    return function (schema, model) {
      addonBroker.setupHooks(modelName, model);
      addonBroker.setupExtenders(modelName, schema);

      mongoose.model(modelName, model);
    };
  };

  pullRequestModel(setupModel('pull_request'), mongoose);

  provide({
    get(modelName) {
      return mongoose.model(modelName);
    }
  });

}
