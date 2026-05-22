// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import path from 'path';
import webpack from 'webpack';
import type { StorybookConfig } from '@storybook/nextjs';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// @ts-ignore
const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    '../../frontend/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../workspaces/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-deep-controls'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  typescript: {
    check: false,
    checkOptions: {},
    skipCompiler: false,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      builder: {
        useSWC: true, // Enables SWC support
      },
      image: {
        loading: 'eager',
      },
      nextConfigPath: path.resolve(__dirname, '../next.config.js'),
    },
  },
  staticDirs: ['../../sampleCommons/public'],
  webpackFinal: async (config) => {
    const imageRule = config.module?.rules?.find((rule) => {
      const test = (rule as { test: RegExp }).test;

      if (!test) {
        return false;
      }

      return test.test('.svg');
    }) as { [key: string]: any };

    imageRule.exclude = /\.svg$/;

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'next/router': 'next-router-mock',
      },
    };

    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin(
        Object.keys(process.env)
          .filter((key) => key.startsWith('NEXT_PUBLIC_'))
          .reduce(
            (state, nextKey) => ({ ...state, [nextKey]: process.env[nextKey] }),
            {},
          ),
      ),
    ];

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}
