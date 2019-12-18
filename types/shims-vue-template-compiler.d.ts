import { SFCDescriptor } from 'vue-template-compiler'

// extend for vue-i18n-locale-message
declare module 'vue-template-compiler/types/index' {
  export interface SFCDescriptor {
    raw: string
    contentPath: string
    component: string
    hierarchy: string[]
  }
}
