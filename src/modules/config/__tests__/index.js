import proxyquire from 'proxyquire';

describe('modules/config', function () {

  let parseConfig, existsStub, readFileSyncStub;

  beforeEach(function () {
    existsStub = sinon.stub();
    readFileSyncStub = sinon.stub();

    existsStub.returns(false);
    readFileSyncStub.returns('{}');

    parseConfig = proxyquire('../index', {
      fs: {
        existsSync: existsStub,
        readFileSync: readFileSyncStub
      }
    }).default;
  });

  it('should read default config', function () {
    const defaultConfig = '{ "port": 80 }';

    existsStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 80 });
  });

  it('should read env config and extend default config if env config exists', function () {
    const defaultConfig = '{ "port": 80 }';
    const developmentConfig = '{ "port": 8080 }';

    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 8080 });
  });

  it('should merge configs properly', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const developmentConfig = '{ "http": { "debug": true } }';

    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', http: { port: 80, debug: true } });
  });

  it('should parse #include directive properly', function () {
    const defaultConfig = '{ "port": 80, "#include:test": "include.json" }';
    const includeConfig = '{ "port": 8080, "params": [true, false] }';

    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/include.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/include.json').returns(includeConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 8080, params: [true, false] });

  });

  it('should throw an error if json file is not valid', function () {
    const defaultConfig = '{ "port" 80 }';

    existsStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    assert.throws(() => { parseConfig('.'); }, /cannot parse/i);
  });

});
