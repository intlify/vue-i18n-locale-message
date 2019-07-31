export default [{
  contentPath: '/path/to/project1/src/App.vue',
  blocks: [{
    type: 'i18n',
    content: `
    {
      "en": { "title": "Application" },
      "ja": { "title": "アプリケーション" }
    }
    `,
    attrs: {}
  }],
  component: 'App',
  hierarchy: ['App']
}, {
  contentPath: '/path/to/project1/src/components/Modal.vue',
  blocks: [{
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
  component: 'Modal',
  hierarchy: ['components', 'Modal']
}, {
  contentPath: '/path/to/project1/src/components/nest/RankingTable.vue',
  blocks: [{
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
  component: 'RankingTable',
  hierarchy: ['components', 'nest', 'RankingTable']
}, {
  contentPath: '/path/to/project1/src/pages/Login.vue',
  blocks: [{
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
  compnent: 'Login',
  hierarchy: ['pages', 'Login']
}]
