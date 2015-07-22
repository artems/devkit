'use strict';

import fs from 'fs';
import path from 'path';
import assign from 'object-assign';

export default function config(basePath, envName) {
  envName = envName || process.env.NODE_ENV || 'development';
  const defaultConfigPath = path.join(basePath, 'config', 'default.json');
  const environmentConfigPath = path.join(basePath, 'config', envName + '.json');

  let defaultConfig = {};
  if (fs.existsSync(defaultConfigPath)) {
    defaultConfig = require(defaultConfigPath);
  }

  let environmentConfig = {};
  if (fs.existsSync(environmentConfigPath)) {
    environmentConfig = require(environmentConfigPath);
  }

  return assign({ env: envName }, defaultConfig, environmentConfig);
}
