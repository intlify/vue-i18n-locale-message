import { SFCDescriptor } from '@vue/compiler-sfc'

// extend for vue-i18n-locale-message
declare module '@vue/compiler-sfc' {
  export interface SFCDescriptor {
    raw: string
    contentPath: string
    component: string
    hierarchy: string[]
  }
}
