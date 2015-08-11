import { decode } from '../routes';

describe('services/badge-costructor', function () {

  describe('#decode', function () {

    describe('should replace `_` to space', function () {

      it('... at the begining', function () {
        assert(decode('_foobar'), ' foobar');
      });

      it('... at the end', function () {
        assert(decode('foobar_'), ' foobar ');
      });

      it('... in the middle', function () {
        assert(decode('foo_bar'), ' foo bar');
      })

    });

    describe('should replace `--` to `-`', function () {

      it('... at the begining', function () {
        assert(decode('--foobar'), '-foobar');
      });

      it('... at the end', function () {
        assert(decode('foobar--'), ' foobar-');
      });

      it('... in the middle', function () {
        assert(decode('foo--bar'), ' foo-bar');
      })

    });

    describe('should replace `__` to `_`', function () {

      it('... at the begining', function () {
        assert(decode('__foobar'), '_foobar');
      });

      it('... at the end', function () {
        assert(decode('foobar__'), ' foobar_');
      });

      it('... in the middle', function () {
        assert(decode('foo__bar'), ' foo_bar');
      })

    });

    it('should combine replacements', function () {
        assert(decode('__foo_bar--'), '_foo bar-');
    });

    it('should make multiple replacements', function () {
        assert(decode('__foo__bar__'), '_foo_bar_');
    });

  });

});
