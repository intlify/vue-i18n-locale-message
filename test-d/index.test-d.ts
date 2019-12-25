import { expectType } from 'tsd'
import {
  MetaLocaleMessage,
  squeeze,
  infuse,
  SFCFileInfo
} from '../types'

const files: SFCFileInfo[] = [{
  path: '/path/to/target/src/components/Hello.vue',
  content: `
    <template>
      <!-- template contents is here ... -->
    </template>

    <script>
      // script codes is here ...
    </script>

    <style scoped>
      // css style codes is here ...
    </style>

    <i18n>
    {
      "en": {
        "ok": "OK",
        "cancel": "Cancel"
      },
      "ja": {
        "ok": "OK",
        "cancel": "キャンセル"
      }
    }
    </i18n>
`
}]

expectType<MetaLocaleMessage>(squeeze('/path/to/target', files))

const metaLocaleMessage: MetaLocaleMessage = {
  target: '/path/to/target',
  components: {
    '/path/to/project1/src/App.vue': [
      {
        lang: 'json',
        messages: {
          ja: {
            title: 'アプリケーション',
            lang: '言語切り替え'
          },
          en: {
            title: 'Application',
            lang: 'Change languages'
          }
        }
      }
    ],
    '/path/to/project1/src/components/Modal.vue': [
      {
        lang: 'yaml',
        locale: 'ja',
        messages: {
          ja: {
            ok: 'OK',
            cancel: 'キャンセル'
          }
        }
      }
    ]
  }
}

expectType<SFCFileInfo[]>(infuse('/path/to/target', files, metaLocaleMessage, { intend: 2, eof: '\n' }))
