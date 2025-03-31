import * as path from 'path';
import * as webpack from 'webpack';
import type { StorybookConfig } from '@storybook/nextjs';

const nextJsPresetPath = require.resolve('@storybook/nextjs');

const config: StorybookConfig = {
  stories: [
    '../../frontend/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-deep-controls',
  ],
  typescript: {
    check: false,
    checkOptions: {},
    skipCompiler: false,
  },
  framework: {
    name: '@storybook/nextjs',
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

    config.plugins.push(
      new webpack.DefinePlugin(
        Object.keys(process.env)
          .filter((key) => key.startsWith('NEXT_PUBLIC_'))
          .reduce(
            (state, nextKey) => ({ ...state, [nextKey]: process.env[nextKey] }),
            {},
          ),
      ),
    );

    return config;
  },
};
export default config;
