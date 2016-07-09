import service from '../';
import serviceMock from '../__mocks__/class';

describe('services/team-manager', function () {

  let imports, options;

  beforeEach(function () {
    options = {};
    imports = {};
  });

  it('the mock object should have the same methods', function () {

    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

});
