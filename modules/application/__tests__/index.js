import Application from '../../application';

describe('modules/application', function () {

    let app, config;

    it('should properly resolve dependencies', function(done) {
      const order = [];

      config = {
        services: {
          serviceA: {
            module: function (o, i, provide) {
              order.push('serviceA');
              provide('moduleA');
            },
            dependencies: ['serviceB']
          },
          serviceB: {
            module: function (o, i, provide) {
              order.push('serviceB');
              provide('moduleB');
            }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .then(function (resolved) {
          assert.deepEqual(order, ['serviceB', 'serviceA']);
          assert.deepEqual(resolved, { serviceA: 'moduleA', serviceB: 'moduleB' });
          done();
        })
        .catch(done);

    });

  it('should properly resolve async dependencies', function(done) {
      const order = [];

      config = {
        services: {
          serviceA: {
            module: function (o, i, provide) {
              setTimeout(function () { provide('moduleA') }, 40);
            },
            dependencies: ['serviceB', 'serviceC']
          },
          serviceB: {
            module: function (o, i, provide) {
              setTimeout(function () { provide('moduleB') }, 60);
            }
          },
          serviceC: {
            module: function (o, i, provide) {
              setTimeout(function () { provide('moduleC') }, 80);
            }
          }
        }
      };

      app = new Application(config);

      app.execute().then(() => done()).catch(done);

    });

    it('should pass options and imports to service', function (done) {
      config = {
        services: {
          serviceA: {
            module: function (o, i, provide) {
              assert.equal(o.A, 'A');
              assert.equal(o.B, 'B');
              assert.equal(i.serviceB, 'moduleB');

              provide('moduleA');
            },
            options: { A: 'A', B: 'B' },
            dependencies: ['serviceB']
          },
          serviceB: {
            module: function (o, i, provide) {
              provide('moduleB');
            }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .then(function () { done(); });

    });

    it('should detect circular dependency', function (done) {
      config = {
        services: {
          serviceA: {
            module: function (o, i, provide) {
              provide('moduleA');
            },
            dependencies: ['serviceB']
          },
          serviceB: {
            module: function (o, i, provide) {
              provide('moduleB');
            },
            dependencies: ['serviceC']
          },
          serviceC: {
            module: function (o, i, provide) {
              provide('moduleC');
            },
            dependencies: ['serviceA']
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .catch(function (e) {
          assert.instanceOf(e, Error);
          assert.match(e.message, /circular dependency detected/i);
          done();
        });

    });

    it('should throw an error if dependency is not found', function (done) {
      config = {
        services: {
          serviceA: {
            module: function (o, i, provide) {
              provide('moduleA');
            },
            dependencies: ['serviceB']
          }
        }
      };

      app = new Application(config);

      app.execute()
        .catch(function (e) {
          assert.instanceOf(e, Error);
          assert.match(e.message, /dependency .* is not found/i);
          done();
        });
    });

    it('should not allow to execute a application twice', function () {
      app = new Application();

      app.execute();

      assert.throws(
        app.execute.bind(app),
        /can not execute a application twice/i
      );
    });

});
