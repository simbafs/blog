// @ts-check

import eslint from '@eslint/js'
import type { TSESLint } from '@typescript-eslint/utils'
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

const config: TSESLint.FlatConfig.ConfigArray = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  // Ignore files
  {
    ignores: ['public/scripts/*', 'scripts/*', '.astro/', 'src/env.d.ts']
  }
]

export default config
