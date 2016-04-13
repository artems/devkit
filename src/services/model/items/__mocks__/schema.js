export default function mock() {

  const virtualGetSet = {
    get: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis()
  };

  const model = {
    set: sinon.stub().returnsThis(),
    path: sinon.stub().returnsThis(),
    virtual: sinon.stub().returns(virtualGetSet),
    methods: {},
    statics: {}
  };

  return model;

}
