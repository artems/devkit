'use strict';

import path from 'path';

class Application {

  /**
   * @constructor
   * @param {Object} config - application config
   * @param {String} [basePath] - the path relative to which all modules are located
   */
  constructor(config, basePath) {
    this.services = config.services || {};

    this.resolved = {};
    this.executed = false;
    this.basePath = basePath || '.';
    this.awaiting = Object.keys(this.services).length;
  }

  /**
   * Run a application.
   *
   * @return {Promise}
   */
  execute() {
    if (this.executed) {
      throw new Error('Can not execute the application twice');
    }

    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.executed = true;

      this.nextRound();
    });
  }

  /**
   * @private
   */
  nextRound() {
    if (this.awaiting === 0) {
      this.promise.resolve();
      return;
    }

    let startedInThisRound = 0;

    for (const name in this.services) {
      const service = this.services[name];
      if (this.checkDependencies(name, service)) {
        this.startService(name, service);
        startedInThisRound++;
      }
    }

    if (startedInThisRound === 0) {
      const names = Object.keys(this.services).join(', ');
      this.promise.reject(
        'Circular dependency detected while resolving ' + names
      );
    }
  }

  /**
   * Check dependencies of a specified service.
   * Return `true` when all dependencies are resolved and `false` otherwise.
   *
   * @private
   * @param {String} name - service name
   * @param {Object} service
   * @return {Boolean}
   */
  checkDependencies(name, service) {
    if (!service.dependencies) return true;

    let resolved = true;

    service.dependencies.forEach((dependence) => {
      if (!(dependence in this.resolved)) {
        resolved = false;
      }
      if (
        !(dependence in this.services)
        && !(dependence in this.resolved)
      ) {
        this.promise.reject(
          'Dependence `' + dependence + '` on `' + name + '` not found'
        );
      }
    });

    return resolved;
  }

  /**
   * Start a specified service.
   *
   * @private
   * @param {String} name - service name
   * @param {Object} service
   */
  startService(name, service) {
    const options = service.options || {};
    const serviceModule = service.module
      || require(path.join(this.basePath, service.path));

    const imports = {};
    (service.dependencies || []).forEach((dependence) => {
      imports[dependence] = this.resolved[dependence];
    });

    this.awaiting--;
    delete this.services[name];

    serviceModule(options, imports, (result) => {
      this.resolved[name] = result;
      this.nextRound();
    });
  }

}

export default Application;
