# :globe_with_meridians: vue-i18n-locale-message

i18n locale messages management tool / library for vue-i18n

<a href="https://www.patreon.com/kazupon" target="_blank">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
</a>

## :cd: Installation

### npm

```sh
npm install --save-dev vue-i18n-locale-message
```

If you can globally use CLI only, you need `-g` option the below command.

```sh
npm install -g vue-i18n-locale-message
```

### yarn

```sh
yarn add -D vue-i18n-locale-message
```

If you can globally use CLI, you need `global` option the below command.

```sh
yarn global vue-i18n-locale-message
```

## :star: Features

- API
  - squeeze the locale messages from `i18n` custom block
  - infuse the locale messages to `i18n` custom block
- CLI
  - squeeze the locale messages from `i18n` custom block
  - infuse the locale messages to `i18n` custom block

## :rocket: Usages

### API

```js
const fs = require('fs')
const { squeeze, infuse } = require('vue-i18n-locale-message')

// read single-file component contents
// NOTE: about scheme of target contents, see the `SFCInfo` type at `types/index.d.ts
const files = [
  {
    path: '/path/to/src/components/Modal.vue',
    content: `<template>
    ...
    <i18n>
    {
      ...
    }
    <i18n>`
  },
  // ...
]

// squeeze locale messages i18n locale messages of from single-file components
const messages = squeeze('/path/to/src', files)

// write squeezed locale messages
fs.writeFileSync('/path/to/src/messages.json')

// after update locale messages with translation service or your code, it read locale messsages
const translatedMessages = require'/path/to/src/translated')

// infuse locale message to single-file components
const updatedFiles = infuse('/path/to/src', files, translatedMessages)

// write updated single-file component
updateFiles.forEach(file => {
  fs.writeFileSync(file.path, file.content)
})
```

### CLI
#### Squeeze

```sh
vue-i18n-locale-message squeeze --target=./src --output=./messages.json
```

#### Infuse

```sh
vue-i18n-locale-message infuse --target=./src --message=./translated.json
```

## :raising_hand: Motivations

The big motivation is as follows.

- :tired_face: Hard to integrate locale messages for localization services
- :tired_face: Hard to maintain consistency of locale message keys (`eslint-plugin-vue-i18n` need it!)
- :tired_face: Requested by third bender tools (`vue-i18n-ally` and etc ...)

## :notebook: Locale message squeezing rules

The structure of locale messages to be squeezed is layered with the **directory structure** and **single-file component (`.vue`) filename**.

This repotitory `demo` project directory structure:

```sh
cd demo
tree src
src
├── App.vue
├── components
│   ├── Modal.vue
│   └── nest
│       └── RankingTable.vue
├── i18n.js
├── locales
│   ├── en.json
│   └── ja.json
├── main.js
└── pages
    └── Login.vue

4 directories, 8 files
```

You use `vue-cli-locale-message` CLI, run `squeeze` command as follows:

```sh
vue-i18n-locale-message squeeze --target=./src --output=./messages.json
cat ./messages.json
```

You will get the following JSON structure (the following output results are commented To make it easier to understand):

```json5
{
  "ja": { // for `ja` locale`
    "App": { // src/App.vue
      "title": "アプリケーション",
      "lang": "言語切り替え"
    },
    "components": { // src/components
      "Modal": { // src/components/Modal.vue
        "ok": "OK",
        "cancel": "キャンセル"
      }
    },
    "pages": { // src/pages
      "Login": { // src/pages/Login.vue
        "id": "ユーザーID",
        "password": "パスワード",
        "confirm": "パスワードの確認入力",
        "button": "ログイン"
      }
    }
  },
  "en": { // for `en` locale
    "App": { // src/App.vue
      "title": "Application",
      "lang": "Change languages"
    },
    "components": { // src/components
      "Modal": { // src/components/Modal.vue
        "ok": "OK",
        "cancel": "Cancel"
      },
      "nest": { // src/components/nest
        "RankingTable": { // src/components/nest/RankingTable.vue
          "headers": {
            "rank": "Rank",
            "name": "Name",
            "score": "Score"
          }
        }
      }
    }
  }
}
```

## :scroll: Changelog
Details changes for each release are documented in the [CHANGELOG.md](https://github.com/kazupon/vue-i18n-locale-message/blob/master/CHANGELOG.md).


## :exclamation: Issues
Please make sure to read the [Issue Reporting Checklist](https://github.com/kazupon/vue-i18n-locale-mesasge/blob/master/.github/CONTRIBUTING.md#issue-reporting-guidelines) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## :white_check_mark: TODO
Managed with [GitHub Projects](https://github.com/kazupon/vue-i18n-locale-message/issues?q=is%3Aissue+is%3Aopen+label%3Atodo)

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
