'use strict';

import path from 'path';

// TODO wrap service into domain
// TODO timeout for service startup
export default class Application {

  /**
   * @constructor
   *
   * @param {Object} config - application config.
   * @param {String} [basePath] - the path relative to which all modules are located.
   */
  constructor(config, basePath) {
    this.services = config && config.services || {};

    this.starting = {};
    this.resolved = {};
    this.teardown = {};

    this.promise = null;
    this.started = false;
    this.stoping = false;
    this.executed = false;
    this.basePath = basePath || '.';
    this.awaiting = Object.keys(this.services).length;
  }

  /**
   * Run an application.
   *
   * @return {Promise}
   */
  execute() {
    if (this.executed) {
      throw new Error('Can not execute an application twice');
    }

    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.executed = true;

      this.nextRound();
    });
  }

  /**
   * Graceful shutdown an application.
   *
   * @return {Promise}
   */
  shutdown() {
    if (!this.started) {
      throw new Error('The application can not shutdown until fully started');
    }

    this.stoping = true;

    const promise = [];
    for (const name in this.teardown) {
      promise.push(this.teardown[name]());
    }

    return Promise.all(promise).then(() => {});
  }

  /**
   * Launching a new round.
   * Each round method checks whitch of services can be started.
   * Trigger deadlock exception when there are no awaiting services and no one of services started in the last round.
   *
   * @private
   */
  nextRound() {
    if (this.awaiting === 0) {
      this.started = true;
      this.promise.resolve(this.resolved);
      return;
    }

    let startedInThisRound = 0;

    for (const name in this.services) {
      const service = this.services[name];

      if (this.checkDependencies(name, service)) {
        startedInThisRound++;
        this.startService(name, service);
      }
    }

    if (startedInThisRound === 0) {
      if (Object.keys(this.starting).length === 0) {
        const names = Object.keys(this.services).join(', ');
        this.promise.reject(new Error(
          'Circular dependency detected while resolving ' + names
        ));
      }
    }
  }

  /**
   * Check dependencies of a given service.
   * Return `true` when all dependencies are resolved and `false` otherwise.
   *
   * @private
   *
   * @param {String} name - service name
   * @param {Object} service - service object
   *
   * @return {Boolean}
   */
  checkDependencies(name, service) {
    if (!service.dependencies || service.dependencies.length === 0) {
      return true;
    }

    let resolved = true;

    service.dependencies.forEach((dependency) => {
      if (!(dependency in this.resolved)) {
        resolved = false;
      }

      if (
        !(dependency in this.services)
        && !(dependency in this.starting)
      ) {
        this.promise.reject(new Error(
          'Dependency `' + dependency + '` on `' + name + '` is not found'
        ));
      }
    });

    return resolved;
  }

  /**
   * Start a given service.
   *
   * @private
   *
   * @param {String} name - service name
   * @param {Object} service - service object
   */
  startService(name, service) {
    const options = service.options || {};
    const servicePath = path.join(this.basePath, service.path || '');
    const serviceModule = service.module || require(servicePath);

    const imports = {};
    (service.dependencies || []).forEach((dependency) => {
      imports[dependency] = this.resolved[dependency];
    });

    delete this.services[name];
    this.starting[name] = true;
    this.awaiting--;

    serviceModule(options, imports)
      .then(result => {
        this.starting[name] = false;
        this.resolved[name] = result.service;
        this.teardown[name] = result.shutdown || function() { return Promise.resolve(); };
        this.nextRound();
      });
  }

}
