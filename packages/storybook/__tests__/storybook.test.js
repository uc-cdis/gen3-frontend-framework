'use strict';

const storybook = require('..');
const assert = require('assert').strict;

assert.strictEqual(storybook(), 'Hello from storybook');
console.info('storybook tests passed');
