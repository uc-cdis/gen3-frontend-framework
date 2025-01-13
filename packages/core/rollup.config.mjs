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
  swr: 'swr',
  'jsonpath-plus': 'jsonpathPlus',
  flat: 'flat',
  papaparse: 'papaparse',
  'redux-persist': 'reduxPersist',
  'cookies-next': 'cookies-next',
  queue: 'queue',
  idb: 'idb',
};

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        globals,
        sourcemap: true,
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        globals,
        sourcemap: true,
      },
    ],
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      json(),
      swc({
        // All options are optional
        sourceMaps: true,
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
