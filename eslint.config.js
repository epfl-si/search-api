'use strict';

const neostandard = require('neostandard')({});
const pluginJest = require('eslint-plugin-jest');

module.exports = [
  ...neostandard,
  {
    languageOptions: {
      sourceType: 'script',
      globals: pluginJest.environments.globals.globals
    },
    plugins: {
      jest: pluginJest
    },
    rules: {
      '@stylistic/comma-dangle': ['error', {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }],
      '@stylistic/max-len': ['error', { code: 80 }],
      '@stylistic/semi': ['error', 'always']
    }
  }
];
