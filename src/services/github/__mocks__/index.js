export default function mock() {

  const pullRequestsMock = {
    get: sinon.stub().callsArg(1),
    update: sinon.stub().callsArg(1),
    getFiles: sinon.stub().callsArg(1)
  };

  return {
    pullRequests: pullRequestsMock
  };

}
