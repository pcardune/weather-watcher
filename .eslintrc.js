module.exports = {
  parser: 'babel-eslint',
  rules: {
    'comma-dangle': 0,
    indent: [2, 2, {SwitchCase: 1}],
    'linebreak-style': [2, 'unix'],
    semi: [2, 'always'],
    'no-console': 0,
    'react/prop-types': 0,
    'react/jsx-filename-extension': 'off',
    'react/no-multi-comp': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/prefer-stateless-function': 'off',
    'react/sort-comp': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
