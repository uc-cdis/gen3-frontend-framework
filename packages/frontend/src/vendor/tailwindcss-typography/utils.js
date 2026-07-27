/*
 * Vendored from @tailwindcss/typography@0.5.20 (MIT, Tailwind Labs Inc.) — see ./LICENSE.
 * Converted to ESM; postcss-selector-parser is resolved via @gen3/frontend's own
 * dependency (^6.1.4) to avoid CVE-2026-9358.
 */
import parser from 'postcss-selector-parser';

const parseSelector = parser();

export function isObject(value) {
  return typeof value === 'object' && value !== null;
}

export function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  if (Object.getPrototypeOf(value) === null) {
    return true;
  }

  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(value) === proto;
}

export function merge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (Array.isArray(source[key])) {
        if (!target[key]) target[key] = [];
        source[key].forEach((item, index) => {
          if (isPlainObject(item) && isPlainObject(target[key][index])) {
            target[key][index] = merge(target[key][index], item);
          } else {
            target[key][index] = item;
          }
        });
      } else if (isPlainObject(source[key])) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return merge(target, ...sources);
}

export function castArray(value) {
  return Array.isArray(value) ? value : [value];
}

export function isUsableColor(color, values) {
  return isPlainObject(values) && color !== 'gray' && values[600];
}

/**
 * @param {string} selector
 */
export function commonTrailingPseudos(selector) {
  let ast = parseSelector.astSync(selector);

  /** @type {import('postcss-selector-parser').Pseudo[][]} */
  let matrix = [];

  // Put the pseudo elements in reverse order in a sparse, column-major 2D array
  for (let [i, sel] of ast.nodes.entries()) {
    for (const [j, child] of [...sel.nodes].reverse().entries()) {
      // We only care about pseudo elements
      if (child.type !== 'pseudo' || !child.value.startsWith('::')) {
        break;
      }

      matrix[j] = matrix[j] || [];
      matrix[j][i] = child;
    }
  }

  let trailingPseudos = parser.selector();

  // At this point the pseudo elements are in a column-major 2D array
  // This means each row contains one "column" of pseudo elements from each selector
  // We can compare all the pseudo elements in a row to see if they are the same
  for (const pseudos of matrix) {
    // It's a sparse 2D array so there are going to be holes in the rows
    // We skip those
    if (!pseudos) {
      continue;
    }

    let values = new Set(pseudos.map((p) => p.value));

    // The pseudo elements are not the same
    if (values.size > 1) {
      break;
    }

    pseudos.forEach((pseudo) => pseudo.remove());
    trailingPseudos.prepend(pseudos[0]);
  }

  if (trailingPseudos.nodes.length) {
    return [trailingPseudos.toString(), ast.toString()];
  }

  return [null, selector];
}
