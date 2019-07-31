"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json5_1 = __importDefault(require("json5"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:squeezer');
function sqeeze(meta) {
    const messages = {};
    meta.forEach(target => {
        const blockMessages = squeezeFromI18nBlock(target.blocks);
        const locales = Object.keys(blockMessages);
        const collects = locales.reduce((messages, locale) => {
            const ret = target.hierarchy.reduce((messages, key) => {
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
exports.default = sqeeze;
function squeezeFromI18nBlock(blocks) {
    return blocks.reduce((messages, block) => {
        debug('i18n block attrs', block.attrs);
        if (block.type === 'i18n') {
            let lang = block.attrs.lang;
            lang = (!lang || typeof lang !== 'string') ? 'json' : lang;
            const obj = parseContent(block.content, lang);
            const locale = block.attrs.locale;
            if (!locale || typeof locale !== 'string') {
                return Object.assign(messages, obj);
            }
            else {
                return Object.assign(messages, { [locale]: obj });
            }
        }
        else {
            return messages;
        }
    }, {});
}
function parseContent(content, lang) {
    switch (lang) {
        case 'yaml':
        case 'yml':
            return js_yaml_1.default.safeLoad(content);
        case 'json5':
            return json5_1.default.parse(content);
        case 'json':
        default:
            return JSON.parse(content);
    }
}
