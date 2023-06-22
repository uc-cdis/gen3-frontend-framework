'use strict';

const crosswalk = require('..');
const assert = require('assert').strict;

assert.strictEqual(crosswalk(), 'Hello from crosswalk');
console.info('crosswalk tests passed');
