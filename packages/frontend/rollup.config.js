import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import tailwindcss from 'tailwindcss';

import { default as tailwindConfig } from './tailwind.config.cjs';
import postcss from 'rollup-plugin-postcss';
import { swc } from 'rollup-plugin-swc3';

const globals = {
  react: 'React',
  'react-redux': 'reactRedux',
  '@reduxjs/toolkit': 'toolkit',
  '@reduxjs/toolkit/query': 'query',
  '@reduxjs/toolkit/query/react': 'react',
  '@reduxjs/toolkit/dist/query/react': 'react',
  '@mantine/core ': 'mantineCore',
  redux: 'redux',
  uuid: 'uuid',
  lodash: 'lodash',
  immer: 'immer',
};

const config = [
  {
    input: './src/index.tsx',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        globals,
      },
      {
        file: 'dist/index.min.js',
        format: 'iife',
        name: 'gen3Portal',
        sourcemap: true,
        plugins: [terser()],
        globals,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'gen3Portal',
        sourcemap: true,
        globals,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: 'gen3Portal',
        sourcemap: true,
        globals,
      },
    ],
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      json(),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
        plugins: [tailwindcss(tailwindConfig)],
      }),
      swc({
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: 'tsconfig.json',
        jsc: {},
      }),
    ],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts(), postcss()],
  },
];

export default config;
