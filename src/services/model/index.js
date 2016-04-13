import { Schema } from 'mongoose';
import { forEach } from 'lodash';
import { AddonBroker } from './addon-broker';

import * as userModel from './items/user';
import * as pullRequestModel from './items/pull-request';

export default function setup(options, imports) {

  const logger = imports.logger;
  const mongoose = imports.mongoose;

  const saveHooks = {};
  const extenders = {};

  forEach(options.addons, (list, modelName) => {
    forEach(list, addonName => {
      const addon = imports[addonName];

      if (!addon) {
        throw new Error(`Cannot find addon with name "${addonName}"`);
      }

      if (!saveHooks[modelName]) {
        saveHooks[modelName] = [];
        extenders[modelName] = [];
      }

      addon.saveHook && saveHooks[modelName].push(addon.saveHook);
      addon.extender && extenders[modelName].push(addon.extender);
    });
  });

  const broker = new AddonBroker(saveHooks, extenders, logger);

  const setup = function setup(modelName, module) {
    // setup schema
    const base = module.setupSchema();
    const schema = broker.setupExtenders(modelName, base);
    const mongooseModel = new Schema(schema);

    // setup methods
    module.setupModel(modelName, mongooseModel);

    // setup save hooks
    broker.setupSaveHooks(modelName, mongooseModel);

    // register model
    mongoose.model(modelName, mongooseModel);
  };

  setup('user', userModel);
  setup('pull_request', pullRequestModel);

  return function (modelName) {
    return mongoose.model(modelName);
  };

}
