import { Schema } from 'mongoose';
import { forEach } from 'lodash';
import { AddonBroker } from './addon-broker';

import * as UserModel from './collections/user';
import * as PullRequestModel from './collections/pull-request';

export default function setup(options, imports) {

  const mixins = {};
  const saveHooks = {};
  const extenders = {};

  const mongoose = imports.mongoose;

  forEach(options.addons, (list, modelName) => {
    forEach(list, (addonName) => {
      const addon = imports[addonName];

      if (!addon) {
        throw new Error(`Cannot find the addon "${addonName}"`);
      }

      if (!mixins[modelName]) {
        mixins[modelName] = [];
        saveHooks[modelName] = [];
        extenders[modelName] = [];
      }

      addon.mixin && saveHooks[modelName].push(addon.mixin);
      addon.saveHook && saveHooks[modelName].push(addon.saveHook);
      addon.extender && extenders[modelName].push(addon.extender);
    });
  });

  const broker = new AddonBroker(mixins, saveHooks, extenders);

  const setup = function setup(modelName, module) {
    // setup schema
    const base = module.setupSchema();
    const schema = broker.setupExtenders(modelName, base);
    const mongooseModel = new Schema(schema);

    // setup methods
    module.setupModel(modelName, mongooseModel);
    broker.setupModel(modelName, mongooseModel);

    // setup save hooks
    broker.setupSaveHooks(modelName, mongooseModel);

    // register model
    mongoose.model(modelName, mongooseModel);
  };

  setup('user', UserModel);
  setup('pull_request', PullRequestModel);

  return function (modelName) {
    return mongoose.model(modelName);
  };

}
