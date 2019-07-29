"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_compiler_utils_1 = require("@vue/component-compiler-utils");
const compiler = __importStar(require("vue-template-compiler"));
const path_1 = __importDefault(require("path"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-extract-locale-messages');
const messages = [{
        fullPath: '/project1/src/App.vue',
        content: `
  <i18n>
  {
    "en": { "title": "Application" },
    "ja": { "title": "アプリケーション" }
  }
  </i18n>
  `
    }, {
        fullPath: '/project1/src/components/Modal.vue',
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
  `
    }, {
        fullPath: '/project1/src/components/nest/RankingTable.vue',
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
  `
    }, {
        fullPath: '/project1/src/pages/Login.vue',
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
  `
    }];
function parseTargets(base, targets) {
    const messages = {};
    targets.forEach(target => {
        const nestKeypaths = parsePath(base, target);
        debug('nestKeypaths', nestKeypaths);
        const blockMessages = parseI18nBlock(target.content);
        const locales = Object.keys(blockMessages);
        const collects = locales.reduce((messages, locale) => {
            const ret = nestKeypaths.reduce((messages, key) => {
                return Object.assign({}, { [key]: messages });
            }, blockMessages[locale]);
            return Object.assign(messages, { [locale]: ret });
        }, {});
        debug('collects', collects);
        locales.forEach(locale => {
            messages[locale] = messages[locale] || {};
            messages[locale] = Object.assign(messages[locale], collects[locale]);
        });
    });
    return messages;
}
exports.parseTargets = parseTargets;
function parsePath(base, target) {
    const pathObj = path_1.default.parse(target.fullPath);
    const [_, keypathRaw] = pathObj.dir.split(base);
    const keypaths = keypathRaw.split(path_1.default.sep);
    keypaths.shift();
    return [pathObj.name, ...keypaths.reverse()];
}
function parseI18nBlock(content) {
    const desc = component_compiler_utils_1.parse({
        source: content,
        compiler: compiler
    });
    return desc.customBlocks.reduce((messages, block) => {
        if (block.type === 'i18n') {
            const obj = JSON.parse(block.content);
            if (block.attrs.locale) {
                return Object.assign(messages, { [block.attrs.locale]: obj });
            }
            else {
                return Object.assign(messages, obj);
            }
        }
        else {
            return messages;
        }
    }, {});
}
const res = parseTargets('/project1/src', messages);
console.log('extract locale messages', JSON.stringify(res, null, 2));
function add(a, b) {
    return a + b;
}
exports.default = add;
