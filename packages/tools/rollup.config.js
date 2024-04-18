import { swc } from 'rollup-plugin-swc3';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import executable from "rollup-plugin-executable"
export default [
  {
    input: './src/buildColors/buildColors.ts',
    output: [
      {
        file: 'dist/buildColors.esm.js',
        format: 'esm',
        name: 'buildColors',
      },
    ],
    external: ['tinycolor2', 'node:util', 'node:fs', 'node:path'],
    plugins: [
      peerDepsExternal(),
      swc({
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: 'tsconfig.json',
        jsc: {},
      }),
    ],
  },
  {
    input: './src/bundleIcons/bundleIcons.js',
    output: [
      {
        file: 'dist/bundleIcons.esm.js',
        format: 'esm',
        name: 'bundleIcons',
      },
    ],
    external: [
      '@iconify/tools/src/import/directory',
      '@iconify/tools/src/svg/cleanup',
      '@iconify/tools/src/colors/parse',
      '@iconify/tools/src/optimise/svgo',
      'fs',
      'node:path',
      'node:util',
      '@iconify/tools/lib/colors/parse',
      '@iconify/tools/lib/import/directory',
      '@iconify/tools/lib/svg/cleanup',
      '@iconify/tools/lib/optimise/svgo',
    ],
    plugins: [
      peerDepsExternal(),
      swc({
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: 'tsconfig.json',
        jsc: {},
      }),
    ],
  },
  {
    input: './src/dictionary/getSchema.ts',
    output: [
      {
        file: 'dist/getSchema.esm.js',
        format: 'esm',
        name: 'getSchema',
      },
    ],
    external: [
      'https',
      'http',
      'node:fs',
      'node:util',
      'fetch-retry',
      'node-fetch',
      'path', 'url',
      'graphql',
    ],
    plugins: [peerDepsExternal(), swc(), executable()],
  },
  {
    input: './src/drsResolver/getDRSToHostname.ts',
    output: [
      {
        file: 'dist/getDRSToHostname.esm.js',
        format: 'esm',
        name: 'getDRSToHostname',
      },
    ],
    external: [
      'https',
      'http',
      'node:fs',
      'node:util',
      'fetch-retry',
      'node-fetch',
      'path', 'url',
    ],
    plugins: [peerDepsExternal(), swc()],
  }
];
