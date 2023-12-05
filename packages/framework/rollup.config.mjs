import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { swc } from 'rollup-plugin-swc3';
import swcPreserveDirectives from 'rollup-swc-preserve-directives';

const globals = {
  react: 'React',
  'react-redux': 'reactRedux',
  '@reduxjs/toolkit': 'toolkit',
  '@reduxjs/toolkit/query': 'query',
  '@reduxjs/toolkit/query/react': 'react',
  '@reduxjs/toolkit/dist/query/react': 'react',
  redux: 'redux',
  uuid: 'uuid',
  lodash: 'lodash',
  immer: 'immer',
  'react-cookie': 'reactCookie',
  'swr': 'swr',
  'jsonpath-plus': 'jsonpathPlus',
};

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        globals,
      },
      {
        file: 'dist/index.min.js',
        format: 'iife',
        name: 'gen3Core',
        plugins: [terser()],
        globals,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'gen3Core',
        globals,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: 'gen3Core',
        globals,
      },
    ],
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      json(),
      swc({
        // All options are optional
        include: /\.[mc]?[jt]sx?$/, // default
        exclude: /node_modules/, // default
        tsconfig: 'tsconfig.json', // default
        jsc: {},
      }),
      swcPreserveDirectives(),
    ],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
