// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsLint from '@eslint/js';
import tsLint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';

export default [
  reactRecommended,
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  {
    ignores: [
      '.nx/**/*',
      '**/build/*',
      'packages/core/dist/*',
      'packages/frontend/dist/*',
      'packages/workspaces/dist/*',
      'packages/workspaces/jupyterlite-builds/*',
      'packages/frontend/.rollup.cache/*',
      'packages/sampleCommons/.next/*',
      'packages/sampleCommons/public/*',
      'packages/sampleCommons/jupyter/*',
      'packages/sampleCommons/workspaces/*',
      'packages/storybook/.next/*',
      'packages/tools/dist/*',
      '**/*.css',
      'setupTests.ts',
      '**/node_modules/*',
      'node_modules/*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      reactHooks: reactHooks,
      next: next,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react/prop-types': 'warn',
      'reactHooks/rules-of-hooks': 'error',
      'reactHooks/exhaustive-deps': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@gen3/frontend',
              message:
                "Avoid importing from '@gen3/frontend' (root barrel). Use a specific subpath entrypoint instead.",
            },
          ],
        },
      ],
    },
  },
  // Workspaces package: disallow @/ path aliases (not valid in published npm packages)
  // and allow @gen3/frontend root barrel (needed internally).
  {
    files: [
      'packages/workspaces/**/*.ts',
      'packages/workspaces/**/*.tsx',
      'packages/workspaces/**/*.js',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message:
                "Use relative imports instead of '@/' path aliases in published packages.",
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
];
