import { fixupConfigRules } from '@eslint/compat'
import reactRefresh from 'eslint-plugin-react-refresh'
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
      'prettier'
    )
  ),
  {
    plugins: {
      'react-refresh': reactRefresh
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
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true
        }
      ],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }]
    }
  }
]
