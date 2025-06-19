import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

export default ts.config(
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...vue.configs['flat/strongly-recommended'],
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        parser: ts.parser,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
    },
    rules: {
      'vue/no-unused-vars': 'error',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': { descriptionFormat: '^ -- ' },
          'ts-nocheck': { descriptionFormat: '^ -- ' },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'vue/require-default-prop': 'off',
      'vue/component-definition-name-casing': 'off',
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    ...ts.configs.disableTypeChecked,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
  {
    ignores: ['**/dist/*', 'node_modules', 'public', 'src-tauri'],
  },
);

