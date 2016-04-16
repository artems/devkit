export default function mock() {

  const user = {
    id: 1,
    _id: 1,
    notification_transports: []
  };

  const promise = Promise.resolve(user);

  user.get = sinon.stub();
  user.set = sinon.stub().returnsThis();
  user.save = sinon.stub().returns(promise);

  return user;

}

export function modelMock() {

  const stub = function () {
    return mock();
  };

  stub.findByLogin = sinon.stub();

  return stub;

}
