import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
