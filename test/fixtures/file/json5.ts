export default [{
  path: '/path/to/project1/src/components/Modal.vue',
  content: `<template>
  <p>template</p>
</template>

<script>
export default {}
</script>

<i18n lang="json5" locale="en">
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
</i18n>`
}]
