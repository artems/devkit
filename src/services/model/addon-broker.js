import { cloneDeep, forEach, merge } from 'lodash';

/**
 * Addon broker helps to extend base model schema and setup save hooks.
 */
export class AddonBroker {

  /**
   * @param {Object[]} saveHooks - each saveHook setup hook to model
   * @param {Object[]} extenders - each extender return parial schema
   * @param {Object} logger
   */
  constructor(saveHooks, extenders, logger) {
    this.saveHooks = saveHooks || {};
    this.extenders = extenders || {};
    this.logger = logger;
  }

  /**
   * Return pre save hooks and extenders for given model
   *
   * @param {String} model - model name.
   *
   * @return {Object}
   */
  get(model) {
    return {
      saveHooks: this.saveHooks[model] || [],
      extenders: this.extenders[model] || []
    };
  }

  /**
   * Setup model pre save hooks.
   *
   * @param {String} name - model name.
   * @param {Object} model - mongoose model.
   */
  setupSaveHooks(name, model) {
    const saveHooks = this.get(name).saveHooks;

    model.pre('save', function (next) {
      const promise = [];

      forEach(saveHooks, (hook) => {
        promise.push(hook(this));
      });

      Promise.all(promise).then(next).catch(next);
    });
  }

  /**
   * Setup model extenders.
   *
   * @param {String} name - model name
   * @param {Object} schema - base schema
   *
   * @return {Object} extended schema
   */
  setupExtenders(name, schema) {
    let newSchema = cloneDeep(schema);

    forEach(this.get(name).extenders, (extender) => {
      newSchema = merge(newSchema, extender(schema));
    });

    return newSchema;
  }

}
