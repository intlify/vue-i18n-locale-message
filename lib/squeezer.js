"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:squeezer');
function squeeze(basePath, files) {
    const descriptors = utils_1.reflectSFCDescriptor(basePath, files);
    return descriptors.reduce((meta, descriptor) => {
        descriptor.customBlocks.sort((a, b) => { return a.start - b.start; });
        const i18nBlocks = squeezeFromCustomBlocks(descriptor.customBlocks);
        debug('squeezeFromCustomBlocks: i18nBlocks', JSON.stringify(i18nBlocks, null, 2));
        meta.components[descriptor.contentPath] = i18nBlocks;
        return meta;
    }, { target: basePath, components: {} });
}
exports.default = squeeze;
function squeezeFromCustomBlocks(blocks) {
    return blocks.map(block => {
        if (block.type === 'i18n') {
            debug('i18n block attrs', block.attrs);
            let lang = block.attrs.lang;
            lang = (!lang || typeof lang !== 'string') ? 'json' : lang;
            const i18nBlock = {
                lang: lang,
                messages: {}
            };
            const obj = utils_1.parseContent(block.content, lang);
            const locale = block.attrs.locale;
            if (!locale || typeof locale !== 'string') {
                Object.assign(i18nBlock.messages, obj);
            }
            else {
                i18nBlock.locale = locale;
                Object.assign(i18nBlock.messages, { [locale]: obj });
            }
            return i18nBlock;
        }
    }).filter(Boolean);
}
