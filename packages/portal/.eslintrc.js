module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['jsx-a11y', 'react', 'react-hooks', '@typescript-eslint'],
  rules: {
    // disable these because we're using React 17+ with the jsx transform
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    //keep this until issue in next js is resolved https://github.com/vercel/next.js/discussions/32233
    'jsx-a11y/anchor-is-valid': [ 'error', {
      'components': [ 'Link' ],
      'specialLink': [ 'hrefLeft', 'hrefRight' ],
      'aspects': [ 'invalidHref', 'preferButton' ]
    }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
