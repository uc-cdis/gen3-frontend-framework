import { swc } from 'rollup-plugin-swc3';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

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
      'fs',
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
];
