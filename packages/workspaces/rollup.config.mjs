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
  lodash: 'lodash',
  immer: 'immer',
  fs: 'fs',
  path: 'path',
  glob: 'glob',
  '@gen3/core': 'gen3Core',
  '@gen3/frontend': 'gen3Frontend',
  'jsonpath-plus': 'jsonpathPlus',
  '@hello-pangea/dnd': '@hello-pangea/dnd',
  '@mantine/notifications': 'mantineNotifications',
  '@mantine/hooks': 'mantineHooks',
  '@mantine/core': 'mantineCore',
  '@mantine/form': 'mantineForm',
  '@mantine/modals': 'mantineModals',
  '@tabler/icons-react': 'tablerIcons',
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
  'use-deep-compare': 'use-deep-compare',
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
  '@gen3/core/server',
  '@gen3/frontend/server',
  '@tanstack/react-table',
  'react-icons/md',
  'react-icons/io5',
  'react-icons/bs',
];

const jsBundle = (input, baseName, additionalExternal) => ({
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
  ...(additionalExternal && { external: [...external, ...additionalExternal] }),
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
  jsBundle('./src/server.ts', 'server'), // default/client entry

  // Type declarations
  dtsBundle('./dist/dts/index.d.ts', 'dist/index.d.ts'),
  dtsBundle('./dist/dts/server.d.ts', 'dist/server.d.ts'),
  {
    // as of now workspaces does not export css but added for completeness
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
          {
            // copy the juypterlite build files
            src: 'jupyterlite-builds/{free-private,remote-private}/{jupyter_lite_config.json,requirements.txt}',
            dest: 'dist/jupyterlite-builds',
            rename: (name, extension, fullPath) => {
              const match = fullPath.match(/jupyterlite-builds\/([^/]+)\//);
              return match
                ? `${match[1]}/${name}.${extension}`
                : `${name}.${extension}`;
            },
          },
          {
            src: 'scripts/*.sh',
            dest: 'dist/jupyterlite-builds/scripts',
          },
        ],
      }),
    ],
  },
];

export default config;
