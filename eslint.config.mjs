import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import simpleImportSort from "eslint-plugin-simple-import-sort"
import reactCompiler from 'eslint-plugin-react-compiler'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next', 'eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked', 'prettier'],
  }),
  {
    plugins: {
      'react-compiler': reactCompiler,
      "simple-import-sort": simpleImportSort
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      'react-compiler/react-compiler': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  }
]

export default eslintConfig