export default [{
  contentPath: '/path/to/project1/src/components/Modal.vue',
  blocks: [{
    type: 'i18n',
    content: `
      ok: "OK"
      cancel: "Cancel"
    `,
    attrs: { locale: 'en', lang: 'yaml' }
  }, {
    type: 'i18n',
    content: `
      ok: OK
      cancel: キャンセル
    `,
    attrs: { locale: 'ja', lang: 'yml' }
  }],
  component: 'Modal',
  hierarchy: ['components', 'Modal']
}]
