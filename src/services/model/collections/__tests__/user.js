import * as userModel from '../user';

describe('services/model/collections/user', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = userModel.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
      assert.property(schema, 'contacts');
    });

  });

});
