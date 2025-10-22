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
  idb: 'idb',
  '@gen3/core': 'gen3Core',
  'jsonpath-plus': 'jsonpathPlus',
  '@hello-pangea/dnd': '@hello-pangea/dnd',
  '@mantine/notifications': 'mantineNotifications',
  'redux-persist/integration/react': 'redux-persist/integration/react',
  'redux-persist/lib/storage/createWebStorage':
    'redux-persist/lib/storage/createWebStorage',
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
  'redux-persist': 'reduxPersist',
  '@hello-pangea': 'pangea',
  'use-deep-compare': 'use-deep-compare',
  graphql: 'graphql',
  'isomorphic-dompurify': 'isomorphic-dompurify',
  '@iconify-icon/react': 'iconify-iconReact',
};

const external = [
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
  'tinycolor2',
  'tailwind-styled-components',
  '@graphiql/plugin-explorer',
  'mantine-react-table',
  'victory',
  'echarts',
  'swr',
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  '@dnd-kit/modifiers',
];

const jsBundle = (input, baseName) => ({
  input,
  output: [
    {
      dir: `dist/${baseName}/cjs`,
      format: 'cjs',
      globals,
      sourcemap: true,
    },
    {
      dir: `dist/${baseName}/esm`,
      format: 'esm',
      globals,
      sourcemap: true,
    },
  ],
  external,
  plugins: [
    peerDepsExternal(),
    json(),
    // If only client entry uses CSS, you can conditionally enable postcss for index only.
    baseName === 'index' &&
      postcss({
        config: { path: './postcss.config.js' },
        modules: true,
        preserveModules: false,
        treeshake: { moduleSideEffects: false },
        extract: 'styles.css',
        extensions: ['.css'],
        sourceMap: true,
        plugins: [postcssImport(), autoprefixer()],
        inject: { insertAt: 'top' },
      }),
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

// DTS bundle factory
const dtsBundle = (input, outFile) => ({
  input,
  output: [{ file: outFile, format: 'es' }],
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
});

const config = [
  // JS builds
  jsBundle('./src/index.ts', 'index'), // default/client entry
  jsBundle('./src/server.ts', 'server'), // server entry

  // Type declarations
  dtsBundle('./dist/dts/index.d.ts', 'dist/index.d.ts'),
  dtsBundle('./dist/dts/server.d.ts', 'dist/server.d.ts'),

  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts(),
      postcss(),
      copy({
        targets: [
          {
            src: ['dist/index/esm/styles.css'],
            dest: 'dist',
          },
        ],
      }),
    ],
  },
];

export default config;
