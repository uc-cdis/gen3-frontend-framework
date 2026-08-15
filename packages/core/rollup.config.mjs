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
  'redux-persist/integration/react': 'redux-persist-integration-react',
  'redux-persist/lib/storage/createWebStorage':
    'redux-persist-createWebStorage',
  'cookies-next': 'cookies-next',
  queue: 'queue',
  idb: 'idb',
  'use-deep-compare': 'use-deep-compare',
  graphql: 'graphql',
  nanoid: 'nanoid',
};

const external = [
  Object.keys(globals),
  // ... your existing externals
];

// Shared JS build factory
const jsBundle = (input, baseName) => ({
  input,
  output: [
    {
      file: `dist/cjs/${baseName}.js`,
      format: 'cjs',
      globals,
      sourcemap: true,
    },
    {
      file: `dist/esm/${baseName}.js`,
      format: 'esm',
      globals,
      sourcemap: true,
    },
  ],
  external,
  plugins: [
    peerDepsExternal(),
    json(),
    swc(
      {
        sourceMaps: true,
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: 'tsconfig.json',
        jsc: {},
      },
      swcPreserveDirectives(),
      json(),
    ),
  ],
});

const dtsBundle = (input, outFile) => ({
  input,
  output: [{ file: outFile, format: 'es' }],
  plugins: [dts()],
});

const config = [
  // JS builds
  jsBundle('./src/index.ts', 'index'), // default/client entry
  jsBundle('./src/server.ts', 'server'), // server entry
  jsBundle('./src/exports/constants.ts', 'constants'), // constants-only entry

  // Type declarations
  dtsBundle('./dist/dts/index.d.ts', 'dist/index.d.ts'),
  dtsBundle('./dist/dts/server.d.ts', 'dist/server.d.ts'),
  dtsBundle('./dist/dts/constants.d.ts', 'dist/constants.d.ts'),
];

export default config;
