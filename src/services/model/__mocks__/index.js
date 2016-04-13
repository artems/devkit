import { modelMock as userMock } from '../items/__mocks__/user';
import { modelMock as pullRequestMock } from '../items/__mocks__/pull-request';

export default function () {
  const get = sinon.stub();

  get.withArgs('user').returns(userMock());
  get.withArgs('pull_request').returns(pullRequestMock());

  return get;
}
