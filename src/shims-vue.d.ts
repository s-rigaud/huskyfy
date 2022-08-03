declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Expansion
declare module 'vue/types/vue' {
  interface Vue {
    $i18n: Object,
    $t: Object,
  }
}
