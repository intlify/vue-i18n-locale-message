<template>
  <form class="login">
    <div class="userid">
      <label for="userid">{{ $t('id') }}:</label>
      <input id="userid" type="text" value="userid">
    </div>
    <div class="password">
      <label for="password">{{ $t('password') }}:</label>
      <input id="password" type="password" value="">
    </div>
    <div class="confirm">
      <label for="confirm">{{ $t('confirm') }}:</label>
      <input id="confirm" type="password" value="">
    </div>
    <input type="submit" :value="$t('button')">
  </form>
</template>

<script>
export default {
  name: "Login"
}
</script>

<i18n>
{
  "ja": {
    "id": "ユーザーID",
    "password": "パスワード",
    "confirm": "パスワードの確認入力",
    "button": "ログイン"
  }
}
</i18n>
