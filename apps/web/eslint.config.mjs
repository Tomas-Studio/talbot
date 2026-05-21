// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import stylistic from '@stylistic/eslint-plugin'

export default withNuxt({
  plugins: {
    '@stylistic': stylistic,
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
      },
    ],
    '@typescript-eslint/no-unused-expressions': 'off',
    '@stylistic/max-statements-per-line': 'warn',
    'vue/no-dupe-keys': 'warn',
    '@typescript-eslint/no-dynamic-delete': 'off',
  },
  ignores: ['*.css', '*.png', '*.ico', '*.txt', 'src/public/'],
})
