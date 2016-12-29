const postcss = require('postcss');

const regViewportUnit = /\d(vw|vh|vmax|vmin)\b/;
const CONTENT_PROP = 'content';
const PREFIX = 'viewport-units-buggyfill';

module.exports = postcss.plugin('postcss-viewport-units', () => (root, result) => {
  root.walkRules((rule) => {
    let hasContent;
    const viewportUnitDecls = [];

    rule.nodes.slice(0).forEach((decl) => {
      if (decl.prop === CONTENT_PROP && !hasContent) {
        hasContent = true;
      }

      if (regViewportUnit.test(decl.value)) {
        viewportUnitDecls.push(`${decl.prop}: ${decl.value}`);
      }
    });

    if (hasContent) {
      rule.warn(result, `'${rule.selector}' already has a 'content' property, give up to overwrite it.`);
    } else if (viewportUnitDecls.length > 0) {
      rule.append({
        prop: CONTENT_PROP,
        value: `'${[PREFIX].concat(viewportUnitDecls).join('; ')}'`,
      });
    }
  });
});