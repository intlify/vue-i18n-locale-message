export default [{
  contentPath: '/path/to/project1/src/App.vue',
  content: `
  <i18n>
  {
    "en": { "title": "Application" },
    "ja": { "title": "アプリケーション" }
  }
  </i18n>
  `,
  component: 'App',
  messageHierarchy: ['App']
}, {
  contentPath: '/path/to/project1/src/components/Modal.vue',
  content: `
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
  component: 'Modal',
  messageHierarchy: ['components', 'Modal']
}, {
  contentPath: '/path/to/project1/src/components/nest/RankingTable.vue',
  content: `
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
  component: 'RankingTable',
  messageHierarchy: ['components', 'nest', 'RankingTable']
}, {
  contentPath: '/path/to/project1/src/pages/Login.vue',
  content: `
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
  compnent: 'Login',
  messageHierarchy: ['pages', 'Login']
}]
