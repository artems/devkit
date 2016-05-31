import * as userModel from '../user';
import schemaModelMock from '../__mocks__/schema';
import staticModelMock from '../__mocks__/static';
import { userMock } from '../__mocks__/user';

describe('services/model/collections/user', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = userModel.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
      assert.property(schema, 'contacts');
    });

  });

  describe('#setupModel', function () {

    let user, model;
    beforeEach(function () {
      user = userMock();

      model = schemaModelMock();

      userModel.setupModel('user', model);
    });

    it('should add method "getContacts"', function () {
      let contacts;
      const userContacts = [{ type: 'skype' }];

      user.contacts = null;
      contacts = model.methods.getContacts.call(user);
      assert.deepEqual(contacts, []);

      user.contacts = userContacts;
      contacts = model.methods.getContacts.call(user);
      assert.deepEqual(contacts, userContacts);
    });

    it('should add static method "findByLogin"', function () {
      const userStaticMock = staticModelMock();
      model.statics.findByLogin.call(userStaticMock, 'user');

      assert.calledWith(userStaticMock.findById, 'user');
    });

    it('should add virtual property "login"', function () {
      const virtual = model.virtual();

      virtual.get.callArgOn(0, user);
      virtual.set.callArgOnWith(0, user, 1);
    });

  });

});
