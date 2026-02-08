import path from 'path'

const buildOxlintCommand = (filenames: string[]) =>
  `oxlint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const buildOxfmtCommand = (filenames: string[]) =>
  `oxfmt --no-error-on-unmatched-pattern ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const lintStagedConfig = {
  '**/*.ts?(x)': () => 'tsc --noEmit',
  '**/*.{js,jsx,ts,tsx}': [buildOxlintCommand],
  '**/*.{js,jsx,ts,tsx,json,css,md}': [buildOxfmtCommand]
}

export default lintStagedConfig
