import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import tailwindcss from 'tailwindcss';
import { default as tailwindConfig } from './src/tailwind.cjs';
import postcss from 'rollup-plugin-postcss';
import { swc } from 'rollup-plugin-swc3';
import swcPreserveDirectives from 'rollup-swc-preserve-directives';

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
  graphiql: 'graphiql',
  lodash: 'lodash',
  immer: 'immer',
  minisearch: 'minisearch',
  tinycolot2: 'tinyColor',
  fs: 'fs',
  path: 'path',
  '@gen3/core': 'gen3Core',
  'jsonpath-plus': 'jsonpathPlus',
  '@mantine/notifications': 'mantineNotifications',
  '@mantine/styles': 'mantineStyles',
  'react-icons/fi': 'reactIcons',
  'react-icons/lu': 'reactIcons',
  'react-icons/md': 'reactIcons',
  'react-minisearch': 'reactMinisearch',
  'lodash/uniq': 'lodashUniq',
  'lodash/sum': 'lodashSum',
};

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        globals,
        sourcemap: true
      },
      {
        dir: 'dist',
        format: 'esm',
        name: 'gen3frontend',
        plugins: [terser()],
        globals,
        sourcemap: true
      },
      {
        dir: 'dist',
        format: 'esm',
        name: 'gen3Core',
        globals,
        sourcemap: true
      },
    ],
    external: [
      ...Object.keys(globals),
      'tailwindcss/plugin',
      '@iconify/react',
      'next/router',
      'next/dynamic',
      'next/link',
      'next/image',
      'react-icons/fa',
      'react-icons/im',
      'tinycolor2',
      'tailwind-styled-components',
      '@graphiql/plugin-explorer',
      'mantine-react-table',
      'victory',
      'echarts'
    ],
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
      swc(
        {
          sourceMaps: true,
          include: /\.[mc]?[json]?[jt]sx?$/,
          exclude: /node_modules/,
          tsconfig: 'tsconfig.json',
          jsc: {},
        },
        swcPreserveDirectives(), json(),
      ),
      copy({
        targets: [
          { src: ['src/features/DataDictionary/data/dictionary.json'], dest: 'dist/features/DataDictionary/data/dictionary.json' },
        ]
      })
    ],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts(), postcss(), json()],
  },
];

export default config;
