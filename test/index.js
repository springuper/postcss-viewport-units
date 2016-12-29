const postcss = require('postcss');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const plugin = require('../');

function compare(filename, warnings) {
  const fixture = fs.readFileSync(
    path.resolve(__dirname, `fixtures/${filename}`),
    { encoding: 'utf8' }
  );
  const expected = fs.readFileSync(
    path.resolve(__dirname, `expections/${filename}`),
    { encoding: 'utf8' }
  );

  return postcss([plugin()])
    .process(fixture)
    .then((result) => {
      assert.equal(result.css, expected);
      if (warnings) {
        assert.deepEqual(result.warnings().map(item => item.text), warnings);
      }

      return result;
    });
}

describe('postcss-viewport-units', () => {
  it('should automatically append `content` property', () => compare('style.css'));

  it('should give a warning if there is already a `content` property', () => (
    compare('content.css', [
      '\'.hero:after\' already has a \'content\' property, give up to overwrite it.',
    ])
  ));
});
