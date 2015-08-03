'use strict';

import _ from 'lodash';
import fs from 'fs';
import path from 'path';

export default function config(basePath, envName) {
  envName = envName || process.env.NODE_ENV || 'development';
  const defaultConfigPath = path.join(basePath, 'config', 'default.json');
  const environmentConfigPath = path.join(basePath, 'config', envName + '.json');
  const secretConfigPath = path.join(basePath, 'config', 'secret.json');

  let defaultConfig = {};
  if (fs.existsSync(defaultConfigPath)) {
    defaultConfig = require(defaultConfigPath);
  }

  let environmentConfig = {};
  if (fs.existsSync(environmentConfigPath)) {
    environmentConfig = require(environmentConfigPath);
  }

  let secretConfig = {};
  if (fs.existsSync(secretConfigPath)) {
    secretConfig = require(secretConfigPath);
  }

  return _.merge({ env: envName }, defaultConfig, environmentConfig, secretConfig);
}
