import { userModelMock } from '../model-user/__mocks__/';
import { pullRequestModelMock } from '../model-pull-request/__mocks__/';

export default function mock() {

  const model = sinon.stub();

  model
    .withArgs('user')
    .returns(userModelMock());

  model
    .withArgs('pull_request')
    .returns(pullRequestModelMock());

  return model;

}
