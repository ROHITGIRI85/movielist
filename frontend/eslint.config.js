import react from 'eslint-plugin-react';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        console: 'readonly', document: 'readonly', window: 'readonly', sessionStorage: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly', URL: 'readonly', Event: 'readonly',
        describe: 'readonly', test: 'readonly', expect: 'readonly', vi: 'readonly',
      },
    },
    plugins: { react },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], 'react/jsx-uses-vars': 'error' },
  },
];