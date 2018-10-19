const postcss = require('postcss');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const plugin = require('../');

function compare(filename, warnings, options) {
  const actualFilePath = path.resolve(__dirname, `fixtures/${filename}/actual.css`);
  const actual = fs.readFileSync(actualFilePath, { encoding: 'utf8' });
  const expected = fs.readFileSync(
    path.resolve(__dirname, `fixtures/${filename}/expected.css`),
    { encoding: 'utf8' }
  );

  return postcss([plugin(options)])
    .process(actual, { from: actualFilePath })
    .then((result) => {
      assert.equal(result.css, expected);
      if (warnings) {
        assert.deepEqual(result.warnings().map(item => item.text), warnings);
      }
      if (options && options.silence === true) {
        assert.equal(result.warnings().length, 0);
      }
      return result;
    });
}

describe('postcss-viewport-units', () => {
  it('should automatically append `content` property', () => compare('default-options'));

  it('should only process `calc` value if `options.onlyCalc` is true',
    () => compare('given-options', null, { onlyCalc: true }));

  it('should give a warning if there is already a `content` property', () => (
    compare('with-content', [
      '\'.hero:after\' already has a \'content\' property, give up to overwrite it.',
    ])
  ));

  it('should not give a warning when `options.silence` is true even though there is already a `content` property',
    () => compare('with-content', null, { silence: true }));

  it('should not continue to process if `options.filterFile` returns `false`', () => compare(
    'filter-file-option',
    null,
    { filterFile: file => !file.includes('filter-file-option') }
  ));

  it('should only continue to process valid rules if `options.filterRule` is specified', () => compare(
    'filter-rule-option',
    null,
    { filterRule: rule => !rule.selector.includes('::after') }
  ));
});
