import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

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
};

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
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
      },
    ],
    external: [
      'lodash',
      'uuid',
      'immer',
      'isomorphic-fetch',
      'redux',
      'redux-toolkit',
      'react-cookie',
    ],
    plugins: [
      peerDepsExternal(),
      typescript(),
      json(),
      babel({
        presets: ['@babel/preset-react'],
        babelHelpers: 'runtime',
      }),
    ],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
