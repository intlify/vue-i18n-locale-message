export default [{
  contentPath: '/path/to/project1/src/components/Modal.vue',
  content: `
  <i18n locale="en" lang="json5">
  {
     // modal contents
     "ok": "OK",
     cancel: "Cancel"
  }
  </i18n>
  <i18n locale="ja">
  {
     "ok": "OK",
     "cancel": "キャンセル"
  }
  </i18n>
  `,
  component: 'Modal',
  messageHierarchy: ['components', 'Modal']
}]
