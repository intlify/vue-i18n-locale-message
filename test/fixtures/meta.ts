export default [{
  path: '/path/to/project1/src/App.vue',
  content: `<template>
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
  `
}, {
  path: '/path/to/project1/src/components/Modal.vue',
  content: `<template>
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
  `
}, {
  path: '/path/to/project1/src/components/nest/RankingTable.vue',
  content: `<template>
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
  `
}, {
  path: '/path/to/project1/src/pages/Login.vue',
  content: `<template>
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
`
}]
