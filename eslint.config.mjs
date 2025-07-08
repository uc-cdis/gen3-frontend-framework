import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsLint from '@eslint/js';
import tsLint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import parserTs from '@typescript-eslint/parser';

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
      '@stylistic/ts': stylisticTs,
      languageOptions: {
        parser: parserTs,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/prop-types': 'warn',
      'reactHooks/rules-of-hooks': 'error',
      'reactHooks/exhaustive-deps': 'warn',
      "@typescript-eslint/quotes": [
        "error",
        "single",
        {
          "avoidEscape": true,
          "allowTemplateLiterals": true
        }
      ]
    },
  },
];
