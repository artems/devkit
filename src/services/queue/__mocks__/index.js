export default function () {

  return {
    enqueue: sinon.stub(),
    dispatch: sinon.stub().returns(Promise.resolve())
  };

}
