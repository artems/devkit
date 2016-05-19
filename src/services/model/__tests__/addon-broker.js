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

      const broker = new AddonBroker(null, { modelA: [extender] });
      const schema = broker.setupExtenders('modelA', baseSchema);

      assert.deepEqual(schema, { moduleA: { fieldA: Number, fieldB: String } });
    });

    it('should be able to add mixin', function () {
      const mixin = sinon.stub();
      const model = {};

      const broker = new AddonBroker({ modelA: [mixin] }, null);
      broker.setupModel('modelA', model);

      assert.calledWith(mixin, model);
    });

  });

});
