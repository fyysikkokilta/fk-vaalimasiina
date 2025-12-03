import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginPrettier,
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'public/**',
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'playwright/.cache/**'
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false }
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/jsx-no-literals': 'error',
      'no-restricted-imports': [
        'error',
        {
          name: 'next/link',
          message: 'Please import from `@/i18n/routing` instead.'
        },
        {
          name: 'next/navigation',
          importNames: [
            'redirect',
            'permanentRedirect',
            'useRouter',
            'usePathname'
          ],
          message: 'Please import from `@/i18n/routing` instead.'
        }
      ]
    }
  }
])

export default eslintConfig
