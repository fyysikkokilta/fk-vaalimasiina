import { fixupConfigRules } from '@eslint/compat'
import simpleImportSort from "eslint-plugin-simple-import-sort"
import reactCompiler from 'eslint-plugin-react-compiler'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: ['**/dist', '**/eslint.config.js']
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:react-hooks/recommended',
      'plugin:@next/next/recommended',
      'prettier'
    )
  ),
  {
    plugins: {
      'react-compiler': reactCompiler,
      "simple-import-sort": simpleImportSort
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },

      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },

    rules: {
      'react-compiler/react-compiler': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    }
  }
]
