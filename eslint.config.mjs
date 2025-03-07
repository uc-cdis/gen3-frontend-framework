import react from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsLint from '@eslint/js';
import tsLint from 'typescript-eslint';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';

export default [
  reactRecommended,
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ...react.configs.flat.recommended,
    ignores: [
      '**/build/*',
      '**/dist/*',
      '**/*.css',
      'setupTests.ts',
      '**/node_modules/*',
      'node_modules/*',
    ],
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
    },
    rules: {
      'no-explicit-any': 'warn',
    },
  },
];
