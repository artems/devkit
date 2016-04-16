import { get } from 'lodash';

export default function mock() {

  const pull = {
    id: 1,
    _id: 1,
    body: 'body',
    title: 'title',
    number: 2,
    html_url: 'html_url',
    state: 'open',
    user: { id: 3, login: 'user.login' },
    owner: 'repository.owner.login',
    repository: {
      id: 4,
      name: 'repository.name',
      full_name: 'repository.full_name',
      owner: {
        id: 5,
        login: 'repository.owner.login'
      }
    },
    files: [],
    review: {
      status: 'notstarted',
      reviewers: []
    }
  };

  const promise = Promise.resolve(pull);

  pull.get = function () {};
  pull.set = sinon.stub().returnsThis();
  pull.save = sinon.stub().returns(promise);

  sinon.stub(pull, 'get', function (path) {
    return get(this, path);
  });

  return pull;

}

export function modelMock() {

  const stub = function () {
    return mock();
  };

  stub.findById = sinon.stub();
  stub.findByUser = sinon.stub();
  stub.findByReviewer = sinon.stub();
  stub.findInReviewByReviewer = sinon.stub();
  stub.findByRepositoryAndNumber = sinon.stub();

  return stub;

}
