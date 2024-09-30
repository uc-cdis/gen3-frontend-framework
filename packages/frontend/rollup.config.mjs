import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
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
  glob: 'glob',
  '@gen3/core': 'gen3Core',
  'jsonpath-plus': 'jsonpathPlus',
  '@mantine/notifications': 'mantineNotifications',
  '@mantine/hooks': 'mantineHooks',
  '@mantine/core': 'mantineCore',
  '@mantine/form': 'mantineForm',
  '@mantine/modals': 'mantineModals',
  '@tabler/icons-react': 'tablerIcons',
  'react-icons/ai': 'reactIcons',
  'react-icons/bs': 'reactIcons',
  'react-icons/fi': 'reactIcons',
  'react-icons/lu': 'reactIcons',
  'react-icons/md': 'reactIcons',
  'react-icons/io': 'reactIcons',
  'react-icons/ri': 'reactIcons',
  'react-icons/ti': 'reactIcons',
  'react-minisearch': 'reactMinisearch',
  'lodash/uniq': 'lodashUniq',
  'lodash/sum': 'lodashSum',
  'react-cookie': 'reactCookie',
  yaml: 'yaml',
  'file-saver': 'fileSaver',
  'universal-cookie': 'universalCookie',
  jose: 'jose',
  'cookies-next': 'cookies-next',
  cookie: 'cookie',
  'next/head': 'nextHead',
  'next/navigation': 'nextNavigation',
  'react-markdown': 'reactMarkdown',
  'remark-gfm': 'remark-gfm',
  'default-composer': 'default-composer',
  filesize: 'filesize',
  'tailwind-merge': 'tailwind-merge',
  util: 'util',
  swc: 'swc',
};

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        globals,
        sourcemap: true,
      },
      {
        dir: 'dist/esm',
        format: 'esm',
        globals,
        sourcemap: true,
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
      'react-icons/bi',
      'react-icons/fa',
      'react-icons/im',
      'react-icons/pi',
      'use-deep-compare',
      'tinycolor2',
      'tailwind-styled-components',
      '@graphiql/plugin-explorer',
      'mantine-react-table',
      'victory',
      'echarts',
      '@gen3/core',
      'swr',
    ],
    plugins: [
      peerDepsExternal(),
      json(),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        modules: true, // Enable CSS Modules
        extract: 'styles.css',
        extensions: ['.css'],
        sourceMap: true, // Generate source map for the CSS
        plugins: [
          postcssImport(), // Handle @import rules in CSS
          autoprefixer(), // Add vendor prefixes automatically
        ],
        inject: {
          insertAt: 'top',
        },
      }),
      swc(
        {
          sourceMaps: true,
          include: /\.[mc]?[json]?[jt]sx?$/,
          exclude: /node_modules/,
          tsconfig: 'tsconfig.json',
          jsc: {},
        },
        swcPreserveDirectives(),
        json(),
      ),
    ],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts(),
      postcss(),
      copy({
        targets: [
          {
            src: ['dist/esm/styles.css'],
            dest: 'dist',
          },
        ],
      }),
    ],
  },
];

export default config;
