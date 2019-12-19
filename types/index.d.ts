/**
 *  Locale Message Recursive Structure
 *    e.g.
 *    {
 *      "en": {  // 'en' Locale
 *        "key1": "this is message1", // basic
 *        "nested": { // nested
 *          "message1": "this is nested message1"
 *        },
 *        "errors": [ // array
 *          "this is 0 error code message",
 *          {  // object in array
 *            "internal1": "this is internal 1 error message"
 *          },
 *          [  // array in array
 *            "this is nested array error 1"
 *          ]
 *        ]
 *      },
 *      "ja": { // 'ja' Locale
 *        // ...
 *      }
 *    }
 */

export type Locale = string
export type LocaleMessage =
  | string
  | { [property: string]: LocaleMessage }
  | LocaleMessage[]
export type LocaleMessages = Record<Locale, LocaleMessage>

/**
 *  Locale Message Meta Structure
 *    e.g.
 *    {
 *     "target": "/path/to/project1",
 *     "components": { // flat component paths
 *       "/path/to/project1/src/App.vue": [ // use array for mutliple i18n blocks
 *         {
 *           "lang": "json", // or "yaml", "json5"
 *           "messages": { // messages
 *             "ja": { // languages
 *               "title": "アプリケーション",
 *               "lang": "言語切り替え"
 *             },
 *             "en": {
 *               "title": "Application",
 *               "lang": "Change languages"
 *             }
 *           }
 *         }
 *       ],
 *       "/path/to/project1/src/components/Modal.vue": [
 *         {
 *           "lang": "yaml",
 *           "locale": "ja",
 *           "messages": {
 *             "ja": {
 *               "ok": "OK",
 *               "cancel": "キャンセル"
 *             }
 *           }
 *         }
 *       ]
 *     }
 *   }
 */

export type I18nLang = 'json' | 'yaml' | 'yml' | 'json5'
export type SFCI18nBlock = {
  lang: I18nLang,
  locale?: string,
  src?: string,
  messages: LocaleMessages
}
export type MetaLocaleMessage = {
  target: string,
  components: Record<string, SFCI18nBlock[]>
}
export type FormatOptions = {
  intend?: number,
  eof?: string
}

/**
 *  SFC (Single-file component) file info
 *    e.g.
 *    {
 *      path: '/path/to/project1/src/components/common/Modal.vue',
 *      content: `
 *        <template>
 *          <!-- template contents is here ... -->
 *        </template>
 *
 *        <script>
 *          // script codes is here ...
 *        </script>
 *
 *        <style scoped>
 *          // css style codes is here ...
 *        </style>
 *
 *        <i18n>
 *        {
 *          "en": {
 *            "ok": "OK",
 *            "cancel": "Cancel"
 *          },
 *          "ja": {
 *            "ok": "OK",
 *            "cancel": "キャンセル"
 *          }
 *        }
 *        </i18n>
 *      `,
 *    }
 */

export interface SFCFileInfo {
  path: string
  content: string
}

/**
 *  Extend SFCDescriptor, due to squeeze / infuse.
 *    e.g.
 *    {
 *      template: { ... },
 *      script: { ... },
 *      styles: [{ ... }],
 *      customBlocks: [{
 *        type: 'i18n',
 *        content: `
 *        {
 *          "en": {
 *            "ok": "OK",
 *            "cancel": "Cancel"
 *          },
 *          "ja": {
 *            "ok": "OK",
 *            "cancel": "キャンセル"
 *          }
 *        }
 *        `,
 *        attrs: { ... },
 *        start: 10,
 *        end: 30,
 *        map: { ... }
 *      }, ...],
 *      contentPath: '/path/to/project1/src/components/common/Modal.vue',
 *      component: 'Modal',
 *      hierarchy: ['components', 'common', 'Modal']
 *    }
 */

declare function squeeze (basePath: string, files: SFCFileInfo[]): MetaLocaleMessage
declare function infuse (basePath: string, sources: SFCFileInfo[], meta: MetaLocaleMessage, options?: FormatOptions): SFCFileInfo[]

export type ProviderPushMode = 'file-path' | 'locale-message'

export type ProviderPushFileInfo = {
  locale: Locale
  path: string
}

export type ProviderPushResource = {
  mode: ProviderPushMode
  files?: ProviderPushFileInfo[]
  messages?: LocaleMessages
}

export type ProviderPullResource = LocaleMessages

export interface Provider {
  push (resource: ProviderPushResource, dryRun: boolean): Promise<void>
  pull (locales: Locale[], dryRun: boolean): Promise<ProviderPullResource>
}

export type ProviderFactory<T = {}> = (configration: ProviderConfiguration<T>) => Provider

/**
 *  ProviderConfiguration provider fields structure
 *    e.g.
 *    {
 *      "provider": {
 *        "token": "xxx"
 *      },
 *      "pushMode": "file-path"
 *    }
 */

export interface ProviderConfiguration<T = {}> {
  provider: { [key in keyof ProviderConfigurationValue<T>]: ProviderConfigurationValue<T>[key] }
  pushMode: ProviderPushMode
}

export type ProviderConfigurationValue<T = {}> = T & { [prop: string]: unknown }
