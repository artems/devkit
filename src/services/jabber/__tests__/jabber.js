import xmppMock from '../__mocks__/xmpp';
import proxyquire from 'proxyquire';

describe('services/jabber/class', function () {

  let xmpp, info, options, Jabber;
  beforeEach(function () {
    xmpp = xmppMock();

    info = sinon.stub();

    Jabber = proxyquire('../jabber', {
      'node-xmpp-client': xmpp
    }).default;

    options = {
      auth: { login: 'login', password: 'password' },
      info: info
    };
  });

  describe('#constructor', function () {

    it('should return Jabber', function () {
      const jabber = new Jabber(options);

      assert.property(jabber, 'send');
      assert.property(jabber, 'close');
      assert.property(jabber, 'connect');
    });

    it('should throw an error if login and password is not set', function () {
      assert.throws(() => new Jabber({}), /login and password/);
    });

  });

  describe('#connect', function () {

    let jabber;
    beforeEach(function () {
      jabber = new Jabber(options);
    });

    it('should initiate connection to jabber host', function (done) {
      // TODO check interval with fake

      jabber.connect()
        .then(() => assert.called(xmpp.connect))
        .then(() => jabber.close())
        .then(done, done);
    });

    it('should log errors', function (done) {
      xmpp.on.withArgs('error').callsArgWith(1, new Error());

      jabber.connect()
        .then(() => assert.called(info))
        .then(() => jabber.close())
        .then(done, done);

    });

    it('should log when goes online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };
      xmpp.on.withArgs('online').callsArgWith(1, data);

      sinon.stub(jabber, 'checkQueue');

      jabber.connect()
        .then(() => jabber.close())
        .then(done, done);
    });

    it('should log when goes offline', function (done) {
      xmpp.on.withArgs('offline').callsArgWith(1);

      jabber.connect()
        .then(() => assert.called(info))
        .then(() => jabber.close())
        .then(done, done);
    });

    it('should log when receive message', function (done) {
      xmpp.on.withArgs('stanza').callsArgWith(1, 'stanza');

      jabber.connect()
        .then(() => assert.called(info))
        .then(() => jabber.close())
        .then(done, done);
    });

  });

  describe('#send', function () {
  });

});
