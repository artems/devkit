'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var Architect = _interopDefault(require('node-architect'));
var fs = _interopDefault(require('fs'));
var _ = require('lodash');
var ___default = _interopDefault(_);

var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};
babelHelpers;

/**
 * Return parsed json file if the file exists, otherwise return an empty object.
 *
 * @param {String} configPath
 * @return {Object}
 */
var requireIfExists = function requireIfExists(configPath) {
  if (fs.existsSync(configPath)) {
    var _config = void 0;
    try {
      _config = JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
      throw new Error('Cannot parse config "' + configPath + '":\n' + e.message);
    }

    return _config;
  }

  return {};
};

function transform(basePath, json) {

  var visit = function visit(context) {
    if (_.isArray(context)) {
      return _.map(context, visit);
    }

    if (_.isPlainObject(context)) {
      var _ret = function () {
        var addons = [];
        var newObj = ___default(context).mapValues(function (v, k) {
          if (k.substr(0, 9) === '#include:') {
            var includePath = path.join(basePath, v);
            var includeContent = requireIfExists(includePath);
            addons.push(visit(includeContent));

            return null;
          } else {
            return visit(v);
          }
        }).omitBy(_.isNull).value();

        return {
          v: _.merge.apply(___default, [newObj].concat(addons))
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
    }

    return context;
  };

  return visit(json);
}

function config(basePath, envName) {

  envName = envName || process.env.NODE_ENV || 'development';
  basePath = path.join(basePath, 'config');

  var join = path.join.bind(path, basePath);

  var envConfigPath = join(envName + '.json');
  var envConfigRaw = requireIfExists(envConfigPath);
  var envConfig = transform(basePath, envConfigRaw);

  var secretConfigPath = join('secret.json');
  var secretConfigRaw = requireIfExists(secretConfigPath);
  var secretConfig = transform(basePath, secretConfigRaw);

  var defaultConfigPath = join('default.json');
  var defaultConfigRaw = requireIfExists(defaultConfigPath);
  var defaultConfig = transform(basePath, defaultConfigRaw);

  return ___default.merge({ env: envName }, defaultConfig, secretConfig, envConfig);
}

var basePath = path.join(__dirname, '..');
var appConfig = config(basePath);
var application = new Architect(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application.execute().then(function (resolved) {
  resolved.logger.info('Application fully started');
}).catch(function (error) {
  console.error(error.stack ? error.stack : error);
  process.exit(1);
});

process.on('SIGINT', function () {
  application.shutdown().then(function () {
    console.log('');
  }).catch(function (error) {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });
});