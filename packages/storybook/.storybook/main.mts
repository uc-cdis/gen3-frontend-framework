import path from 'path';
import webpack from 'webpack';
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../../frontend/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../frontend/src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)',
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
        useSWC: true,
      },
      image: {
        loading: 'eager',
      },
      nextConfigPath: path.resolve(
        path.dirname(import.meta.url.replace('file://', '')),
        '../next.config.js',
      ),
    },
  },
  staticDirs: ['../../sampleCommons/public'],
  webpackFinal: async (config) => {
    const imageRule = config.module?.rules?.find((rule) => {
      const test = (rule as { test: RegExp }).test;
      return test ? test.test('.svg') : false;
    }) as { [key: string]: any };

    if (imageRule) {
      imageRule.exclude = /\.svg$/;
    }

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

/**
 * Modern ESM helper function that bypasses 'require' completely.
 * Uses Node's native import.meta.resolve to map package paths cleanly.
 */
function getAbsolutePath(value: string): string {
  const resolvedPath = import.meta.resolve(value);
  return path.dirname(resolvedPath.replace('file://', ''));
}
