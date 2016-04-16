import { get } from 'lodash';

export function userMock() {

  const user = {
    _id: 1,
    contacts: []
  };

  user.get = function () {};
  user.set = sinon.stub().returnsThis();
  user.save = sinon.stub().returns(Promise.resolve(user));

  sinon.stub(user, 'get', function (path) {
    return get(this, path);
  });

  return user;

}

export function userModelMock() {

  const stub = function () {
    return userMock();
  };

  stub.findByLogin = sinon.stub();

  return stub;

}
