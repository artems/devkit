'use strict';

import path from 'path';
import assign from 'object-assign';

export default function config(basePath, envName) {
  envName = envName || process.env.NODE_ENV || 'development';
  const defaultConfig = require(path.join(basePath, 'config/default.json'));
  const environmentConfig = require(path.join(basePath, 'config/' + envName));

  return assign({ env: envName }, defaultConfig, environmentConfig);
}
