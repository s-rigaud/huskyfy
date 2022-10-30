declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line
  const component: DefineComponent<any, any, any>
  export default component
}
