import { modelMock as userMock } from '../collections/__mocks__/user';
import { modelMock as pullRequestMock } from '../collections/__mocks__/pull-request';

export default function mock() {
  const get = sinon.stub();

  get.withArgs('user').returns(userMock());
  get.withArgs('pull_request').returns(pullRequestMock());

  return get;
}
