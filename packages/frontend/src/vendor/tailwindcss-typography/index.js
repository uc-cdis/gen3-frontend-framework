/*
 * Vendored from @tailwindcss/typography@0.5.20 (MIT, Tailwind Labs Inc.) — see ./LICENSE.
 * Converted to ESM. This local copy exists so that @gen3/frontend controls the
 * postcss-selector-parser version (^6.1.4) and does not pull the vulnerable 6.0.10
 * that @tailwindcss/typography pins (CVE-2026-9358).
 */
import plugin from 'tailwindcss/plugin';
import styles from './styles.js';
import { castArray, commonTrailingPseudos, isObject, merge } from './utils.js';

const computed = {
  // Reserved for future "magic properties", for example:
  // bulletColor: (color) => ({ 'ul > li::before': { backgroundColor: color } }),
};

function inWhere(selector, { className, modifier, prefix }) {
  let prefixedNot = prefix(`.not-${className}`).slice(1);
  let selectorPrefix = selector.startsWith('>')
    ? `${modifier === 'DEFAULT' ? `.${className}` : `.${className}-${modifier}`} `
    : '';

  // Parse the selector, if every component ends in the same pseudo element(s) then move it to the end
  let [trailingPseudo, rebuiltSelector] = commonTrailingPseudos(selector);

  if (trailingPseudo) {
    return `:where(${selectorPrefix}${rebuiltSelector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))${trailingPseudo}`;
  }

  return `:where(${selectorPrefix}${selector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))`;
}

function configToCss(config = {}, { target, className, modifier, prefix }) {
  function updateSelector(k, v) {
    if (target === 'legacy') {
      return [k, v];
    }

    if (Array.isArray(v)) {
      return [k, v];
    }

    if (isObject(v)) {
      let nested = Object.values(v).some(isObject);
      if (nested) {
        return [
          inWhere(k, { className, modifier, prefix }),
          v,
          Object.fromEntries(
            Object.entries(v).map(([k, v]) => updateSelector(k, v)),
          ),
        ];
      }

      return [inWhere(k, { className, modifier, prefix }), v];
    }

    return [k, v];
  }

  return Object.fromEntries(
    Object.entries(
      merge(
        {},
        ...Object.keys(config)
          .filter((key) => computed[key])
          .map((key) => computed[key](config[key])),
        ...castArray(config.css || {}),
      ),
    ).map(([k, v]) => updateSelector(k, v)),
  );
}

export default plugin.withOptions(
  ({ className = 'prose', target = 'modern' } = {}) => {
    return function ({ addVariant, addComponents, theme, prefix }) {
      let modifiers = theme('typography');

      let options = { className, prefix };

      for (let [name, ...selectors] of [
        ['headings', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'],
        ['h1'],
        ['h2'],
        ['h3'],
        ['h4'],
        ['h5'],
        ['h6'],
        ['p'],
        ['a'],
        ['blockquote'],
        ['figure'],
        ['figcaption'],
        ['strong'],
        ['em'],
        ['kbd'],
        ['code'],
        ['pre'],
        ['ol'],
        ['ul'],
        ['li'],
        ['dl'],
        ['dt'],
        ['dd'],
        ['table'],
        ['thead'],
        ['tr'],
        ['th'],
        ['td'],
        ['img'],
        ['picture'],
        ['video'],
        ['hr'],
        ['lead', '[class~="lead"]'],
      ]) {
        selectors = selectors.length === 0 ? [name] : selectors;

        let selector =
          target === 'legacy'
            ? selectors.map((selector) => `& ${selector}`)
            : selectors.join(', ');

        addVariant(
          `${className}-${name}`,
          target === 'legacy'
            ? selector
            : `& :is(${inWhere(selector, options)})`,
        );
      }

      addComponents(
        Object.keys(modifiers).map((modifier) => ({
          [modifier === 'DEFAULT'
            ? `.${className}`
            : `.${className}-${modifier}`]: configToCss(modifiers[modifier], {
            target,
            className,
            modifier,
            prefix,
          }),
        })),
      );
    };
  },
  () => {
    return {
      theme: { typography: styles },
    };
  },
);
