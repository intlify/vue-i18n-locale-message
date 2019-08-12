export default [{
  raw: `
  <template>
    <p>template</p>
  </template>
  
  <script>
  export default {}
  </script>

  <i18n lang="yaml" locale="en">
    ok: OK
    cancel: Cancel
  </i18n>

  <i18n lang="yml" locale="ja">
    ok: OK
    cancel: キャンセル
  </i18n>
  `,
  template: {
    type: 'template',
    content: `<p>template</p>`,
    attrs: {}
  },
  script: {
    type: 'script',
    content: `export default {}`,
    attrs: {}
  },
  styles: [],
  customBlocks: [{
    type: 'i18n',
    content: `
      ok: OK
      cancel: Cancel
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
  contentPath: '/path/to/project1/src/components/Modal.vue',
  component: 'Modal',
  hierarchy: ['components', 'Modal']
}]
