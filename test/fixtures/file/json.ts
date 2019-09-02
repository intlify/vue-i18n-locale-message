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
</i18n>`
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
</i18n>`
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
</i18n>`
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
</i18n>`
}, {
  path: '/path/to/project1/src/pages/Dashboard1.vue',
  content: `<template>
  <p>this is the dashboard1</p>
</template>

<script>
export default {
  name: 'Dashboard1'
}
</script>

<i18n>
{
  "ja": {
    "title": "ダッシュボード"
  }
}
</i18n>

<i18n>
{
  "ja": {
    "loading": "読込中..."
  }
}
</i18n>`
}, {
  path: '/path/to/project1/src/pages/Dashboard2.vue',
  content: `<template>
  <p>this is the dashboard2</p>
</template>

<script>
export default {
  name: 'Dashboard2'
}
</script>

<i18n locale="ja">
{
  "title": "ダッシュボード"
}
</i18n>

<i18n locale="ja">
{
  "loading": "読込中..."
}
</i18n>`
}]
