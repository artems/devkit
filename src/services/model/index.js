import { Schema } from 'mongoose';
import { forEach } from 'lodash';
import { AddonBroker } from './addon-broker';

import * as userModel from './items/user';
import * as pullRequestModel from './items/pull-request';

export default function setup(options, imports) {

  const mongoose = imports.mongoose;

  const saveHooks = {};
  const extenders = {};

  forEach(options.addons, (list, modelName) => {
    forEach(list, addonPath => {
      const addon = imports.require(addonPath);

      if (!saveHooks[modelName]) {
        saveHooks[modelName] = [];
        extenders[modelName] = [];
      }

      addon.saveHook && saveHooks[modelName].push(addon.saveHook);
      addon.extender && extenders[modelName].push(addon.extender);
    });
  });

  const addonBroker = new AddonBroker(saveHooks, extenders);

  const setup = function setup(modelName, module) {
    const base = module.setupSchema();
    const schema = addonBroker.setupExtenders(modelName, base);

    const model = new Schema(schema);

    module.setupModel(modelName, model);

    addonBroker.setupSaveHooks(modelName, model);

    mongoose.model(modelName, model);
  };

  setup('user', user);
  setup('pull_request', pullRequest);

  return function(modelName) {
    return mongoose.model(modelName);
  };

}
