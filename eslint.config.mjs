import react from 'eslint-plugin-react';
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
      'packages/frontend/.rollup.cache/*',
      'packages/sampleCommons/.next/*',
      'packages/sampleCommons/public/*',
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
      next: next,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/prop-types': 'warn',
    },
  },
];
