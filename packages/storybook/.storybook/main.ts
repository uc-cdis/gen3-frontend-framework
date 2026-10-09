import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import path from 'path';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const packageJson = require(
  path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'node_modules',
    '@gen3',
    'frontend',
    'package.json',
  ),
);

const config: StorybookConfig = {
  stories: [
    '../../frontend/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../workspaces/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  env: (config) => ({
    ...config,
    NEXT_PUBLIC_GEN3_VERSION: packageJson.version,
  }),
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-deep-controls'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  typescript: {
    check: false,
    skipCompiler: false,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {
      nextConfigPath: path.resolve(__dirname, '../next.config.js'),
    },
  },
  staticDirs: ['../../sampleCommons/public'],
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const { default: svgr } = await import('vite-plugin-svgr');

    // mergeConfig concatenates alias arrays as [...base, ...ours], so the framework's
    // aliases would win for any shared key. Build the merged config first, then prepend
    // our aliases so they are tested before the framework's.
    const ourAliases = [
      {
        find: '@gen3/core/server',
        replacement: path.resolve(__dirname, '../../core/src/server.ts'),
      },
      {
        find: '@gen3/frontend/app',
        replacement: path.resolve(
          __dirname,
          '../../frontend/src/exports/app.ts',
        ),
      },
      {
        find: '@gen3/frontend/explorerRenderers',
        replacement: path.resolve(
          __dirname,
          '../../frontend/src/exports/explorerRenderers.ts',
        ),
      },
      {
        find: '@gen3/frontend/content',
        replacement: path.resolve(
          __dirname,
          '../../frontend/src/exports/content.ts',
        ),
      },
      {
        find: /^@gen3\/core$/,
        replacement: path.resolve(__dirname, '../../core/src/index.ts'),
      },
      {
        find: /^@gen3\/workspaces$/,
        replacement: path.resolve(__dirname, '../../workspaces/src/index.ts'),
      },
      { find: 'next/router', replacement: 'next-router-mock' },
    ];

    const merged = mergeConfig(config, {
      plugins: [svgr()],
      optimizeDeps: {
        exclude: ['styled-jsx'],
      },
    });

    merged.resolve ??= {};
    const frameworkAliases = Array.isArray(merged.resolve.alias)
      ? merged.resolve.alias
      : [];
    merged.resolve.alias = [...ourAliases, ...frameworkAliases];

    return merged;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}
