import path from 'path'

const buildEslintCommand = (filenames: string[]) =>
  `eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const lintStagedConfig = {
  '**/*.ts?(x)': () => 'tsc --noEmit',
  '**/*.{js,jsx,ts,tsx}': [buildEslintCommand]
}

export default lintStagedConfig
