export default [{
  contentPath: '/path/to/project1/src/components/Modal.vue',
  blocks: [{
    type: 'i18n',
    content: `
    {
       // modal contents
       "ok": "OK",
       cancel: "Cancel"
    }
    `,
    attrs: { locale: 'en', lang: 'json5' }
  }, {
    type: 'i18n',
    content: `
    {
       "ok": "OK",
       "cancel": "キャンセル"
    }
    `,
    attrs: { locale: 'ja' }
  }],
  component: 'Modal',
  hierarchy: ['components', 'Modal']
}]
