import { SFCCustomBlock } from '@vue/component-compiler-utils'

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

export type LocaleMessage = string | LocaleMessageObject | LocaleMessageArray
export interface LocaleMessageArray extends Array<LocaleMessage> {}
export interface LocaleMessageObject { [key: string]: LocaleMessage }
export type LocaleMessages = { [key: string]: LocaleMessageObject }

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
 *  Locale Message Meta to squeeze / infuse.
 *    e.g.
 *    {
 *      contentPath: '/path/to/project1/src/components/common/Modal.vue',
 *      blocks: [{
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
 *      component: 'Modal',
 *      messageHierarchy: ['components', 'common', 'Modal']
 *    }
 */

export interface LocaleMessageMeta {
  contentPath: string
  content: string
  blocks: SFCCustomBlock[]
  component: string
  messageHierarchy: string[]
}
