import { SFCFileInfo } from '../types'
import reflectLocaleMessageMeta from '../src/reflector'

test('reflectLocaleMessageMeta', () => {
  const componentInfo: SFCFileInfo = {
    path: '/path/to/project1/src/components/common/Modal.vue',
    content: `
      <template>
        <!-- template contents is here ... -->
      </template>
      
      <script>
        // script codes is here ...
        export default {}
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
  }

  const metaInfo = reflectLocaleMessageMeta('/path/to/project1/src', [componentInfo])
  expect(metaInfo.length).toBe(1)
  const [meta] = metaInfo
  expect(meta.contentPath).toBe(componentInfo.path)
  expect(meta.component).toBe('Modal')
  expect(meta.hierarchy).toEqual(['components', 'common'])
  expect(meta.blocks.length).toBe(1)
})
