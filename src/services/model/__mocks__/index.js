import { userModelMock } from '../collections/__mocks__/user';
import { pullRequestModelMock } from '../collections/__mocks__/pull-request';

export default function mock() {

  const model = sinon.stub();

  model.withArgs('user')
    .returns(userModelMock());

  model.withArgs('pull_request')
    .returns(pullRequestModelMock());

  return model;

}
