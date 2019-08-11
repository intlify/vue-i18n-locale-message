export default [{
  raw: `
  <template>
    <p>template</p>
  </template>
  
  <script>
  export default {}
  </script>

  <i18n>
  {
    "en": { "title": "Application" },
    "ja": { "title": "アプリケーション" }
  }
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
    {
      "en": { "title": "Application" },
      "ja": { "title": "アプリケーション" }
    }
    `,
    attrs: {}
  }],
  contentPath: '/path/to/project1/src/App.vue',
  component: 'App',
  hierarchy: ['App']
}, {
  raw: `
  <template>
    <p>template</p>
  </template>
  
  <script>
  export default {}
  </script>

  <i18n locale="en">
  {
    "ok": "OK",
    "cancel": "Cancel"
  }
  </i18n>
  
  <i18n locale="ja">
  {
    "ok": "OK",
    "cancel": "キャンセル"
  }
  </i18n>
  `,
  template: {
    type: 'template',
    content: `<p>template</p>`,
    attrs: {}
  },
  script: {
    type: 'script',
    content: `export default {}`
  },
  styles: [],
  customBlocks: [{
    type: 'i18n',
    content: `
    {
      "ok": "OK",
      "cancel": "Cancel"
    }
    `,
    attrs: { locale: 'en' }
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
  contentPath: '/path/to/project1/src/components/Modal.vue',
  component: 'Modal',
  hierarchy: ['components', 'Modal']
}, {
  raw: `
  <template>
    <p>template</p>
  </template>
  
  <script>
  export default {}
  </script>

  <i18n locale="en">
  {
    "headers": {
      "rank": "Rank",
      "name": "Name",
      "score": "Score"
    }
  }
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
    {
      "headers": {
        "rank": "Rank",
        "name": "Name",
        "score": "Score"
      }
    }
    `,
    attrs: { locale: 'en' }
  }],
  contentPath: '/path/to/project1/src/components/nest/RankingTable.vue',
  component: 'RankingTable',
  hierarchy: ['components', 'nest', 'RankingTable']
}, {
  raw: `
  <template>
    <p>template</p>
  </template>
  
  <script>
  export default {}
  </script>

  <i18n>
  {
    "ja": {
      "id": "ユーザーID",
      "passowrd": "パスワード",
      "confirm": "パスワードの確認入力",
      "button": "ログイン"
    }
  }
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
    {
      "ja": {
        "id": "ユーザーID",
        "passowrd": "パスワード",
        "confirm": "パスワードの確認入力",
        "button": "ログイン"
      }
    }
    `,
    attrs: {}
  }],
  contentPath: '/path/to/project1/src/pages/Login.vue',
  compnent: 'Login',
  hierarchy: ['pages', 'Login']
}]
