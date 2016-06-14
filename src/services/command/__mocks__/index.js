export default function mock() {

  return {
    addCommand: sinon.stub(),

    dispatch: sinon.stub.returns(Promise.resolve())
  };

}

export function reviewersMock() {

  return [
    { login: 'Hulk' },
    { login: 'Thor' }
  ];

}
