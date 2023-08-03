/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',

    // VUE + TS
    '@vue/standard',
    '@vue/typescript/recommended',

    // PLUGINS
    'plugin:vue/vue3-recommended',
    'plugin:@intlify/vue-i18n/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'ATTR_DYNAMIC',
          'OTHER_DIRECTIVES',
          // 'OTHER_ATTR',
          ['ATTR_STATIC', 'ATTR_SHORTHAND_BOOL'],
          'EVENTS',
          'CONTENT'
        ],
        alphabetical: true
      }
    ],
    // Ignore rules
    camelcase: 'off',
    'no-useless-escape': 'off', // REGEX
    '@intlify/vue-i18n/no-raw-text': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/valid-v-slot': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-template-shadow': 'off' // props shadowing between Vuetify and Composition API
  },
  settings: {
    'vue-i18n': {
      localeDir: './src/locales/*.{json}',
      messageSyntaxVersion: '^9.0.0'
    }
  }
}
