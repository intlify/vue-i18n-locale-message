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
 *  Locale Message Meta to squeeze / infuse.
 *    e.g.
 *    {
 *      contentPath: '/path/to/project1/src/components/common/Modal.vue',
 *      content: `
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
 *      component: 'Modal',
 *      messagePath: '/components/common'
 *    }
 */

export type LocaleMessageMeta = {
  contentPath: string
  content: string
  component: string
  messagePath: string
}
