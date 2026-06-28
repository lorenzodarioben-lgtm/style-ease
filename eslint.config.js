import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'prefer-const': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['eslint.config.js', 'vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest
      }
    }
  }
];
