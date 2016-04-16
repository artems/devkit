import { AddonBroker } from '../addon-broker';

describe('services/model', function () {

  describe('AddonBroker', function () {

    it('should be able to extend base schema', function () {
      const baseSchema = {
        moduleA: {
          fieldA: Number
        }
      };

      const extender = function () {
        return {
          moduleA: {
            fieldB: String
          }
        };
      };

      const broker = new AddonBroker(null, null, { modelA: [extender] });
      const schema = broker.setupExtenders('modelA', baseSchema);

      assert.deepEqual(schema, { moduleA: { fieldA: Number, fieldB: String } });
    });

    it('should be able to add pre-save hook', function (done) {
      const modelStub = {
        pre: function (hookName, callback) {
          assert.equal(hookName, 'save');
          this.preCallback = callback;
        }
      };

      const objectStub = {
        fieldA: 1,

        save: function () {
          const next = function () {
            assert.equal(objectStub.fieldA, 2);
            done();
          };

          modelStub.preCallback.call(this, next);
        }
      };

      const saveHook = function (model) {
        return new Promise(resolve => {
          model.fieldA += 1;

          resolve();
        });
      };

      const broker = new AddonBroker(null, { modelA: [saveHook] }, null);

      broker.setupSaveHooks('modelA', modelStub);

      objectStub.save();
    });

  });

});
