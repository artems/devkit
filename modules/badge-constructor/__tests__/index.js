'use strict';

import proxyquire from 'proxyquire';

describe('modules/badge-constructor', function () {

  let BadgeConstructor, existsStub, readFileStub, compileStub;

  beforeEach(function () {
    existsStub = sinon.stub().returns(true);
    readFileStub = sinon.stub().returns('template');

    compileStub = sinon.stub().returns(() => 'stub');

    BadgeConstructor = proxyquire('../../badge-constructor', {
      fs: {
        existsSync: existsStub,
        readFileSync: readFileStub
      },
      ejs: { compile: compileStub }
    });
  });

  it('should call `compile` only once', function () {
    const badge = new BadgeConstructor();

    const result = badge.render('subject', 'status', 'fff');
    badge.render('subject1', 'status2', '000');
    badge.render('subject2', 'status2', '999');

    assert.equal(result, 'stub');
    assert.calledOnce(compileStub);
  });

  it('should receive option `templateName`', function () {
    const badge = new BadgeConstructor({ templateName: 'fancy' });

    badge.render('subject', 'status', 'fff');

    assert.calledWith(readFileStub, 'fancy.ejs');
  });

  it('should receive option `templatePath`', function () {
    const badge = new BadgeConstructor({ templatePath: '/var/template' });

    badge.render('subject', 'status', 'fff');

    assert.calledWith(readFileStub, '/var/template/flat.ejs');
  });

  it('should throw error if template not found', function () {
    existsStub.returns(false);

    const badge = new BadgeConstructor();

    assert.throws(
      badge.render.bind(badge, 'subject', 'status', 'fff'),
      /not found/
    );
  });

});
