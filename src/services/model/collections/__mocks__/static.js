export default function mock() {

  const model = {
    model: sinon.stub().returnsThis(),
    limit: sinon.stub().returnsThis(),
    find: sinon.stub().returnsThis(),
    sort: sinon.stub().returnsThis(),
    exec: sinon.stub().returnsThis(),

    findOne: sinon.stub().returnsThis(),
    findById: sinon.stub().returnsThis()
  };

  return model;

}
