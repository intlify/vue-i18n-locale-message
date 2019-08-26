"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:squeezer');
function sqeeze(basePath, files) {
    const descriptors = utils_1.reflectSFCDescriptor(basePath, files);
    return descriptors.reduce((messages, descriptor) => {
        const blockMessages = squeezeFromI18nBlock(descriptor.customBlocks);
        const locales = Object.keys(blockMessages);
        return locales.reduce((messages, locale) => {
            if (!messages[locale]) {
                messages[locale] = {};
            }
            const localeMessages = messages[locale];
            const localeBlockMessages = blockMessages[locale];
            let target = localeMessages;
            const hierarchy = descriptor.hierarchy.concat();
            while (hierarchy.length >= 0) {
                const key = hierarchy.shift();
                if (!key) {
                    break;
                }
                if (!target[key]) {
                    target[key] = {};
                }
                target = target[key];
            }
            Object.assign(target, localeBlockMessages);
            return messages;
        }, messages);
    }, {});
}
exports.default = sqeeze;
function squeezeFromI18nBlock(blocks) {
    return blocks.reduce((messages, block) => {
        debug('i18n block attrs', block.attrs);
        if (block.type === 'i18n') {
            let lang = block.attrs.lang;
            lang = (!lang || typeof lang !== 'string') ? 'json' : lang;
            const obj = utils_1.parseContent(block.content, lang);
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
