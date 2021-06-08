<template>
  <div id="app">
    <h1>{{ $t("title") }}</h1>
    <form>
      <label for="locale">{{ $t('lang') }}:</label>
      <select v-model="$i18n.locale">
        <option value="en">en</option>
        <option value="ja">ja</option>
      </select>
    </form>
    <Login />
  </div>
</template>

<script>
import Login from './pages/Login.vue'

export default {
  name: "app",
  components: {
    Login
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<i18n>
{
  "ja": {
    "title": "アプリケーション",
    "lang": "言語切り替え"
  },
  "en": {
    "title": "Application",
    "lang": "Change languages"
  }
}
</i18n>
