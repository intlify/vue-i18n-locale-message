"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const prettier_1 = __importDefault(require("prettier"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:infuser');
function infuse(basePath, sources, meta) {
    const descriptors = utils_1.reflectSFCDescriptor(basePath, sources);
    return descriptors.map(descriptor => {
        return {
            content: generate(meta, descriptor),
            path: descriptor.contentPath
        };
    });
}
exports.default = infuse;
function generate(meta, descriptor) {
    const i18nBlocks = meta.components[descriptor.contentPath];
    debug('target i18n blocks\n', i18nBlocks);
    const blocks = getBlocks(descriptor);
    blocks.forEach(b => debug(`block: type=${b.type}, start=${b.start}, end=${b.end}`));
    const { raw } = descriptor;
    const content = buildContent(i18nBlocks, raw, blocks);
    debug(`build content:\n${content}`);
    debug(`content size: raw=${raw.length}, content=${content.length}`);
    return format(content, 'vue');
}
function getBlocks(descriptor) {
    const { template, script, styles, customBlocks } = descriptor;
    const blocks = [...styles, ...customBlocks];
    template && blocks.push(template);
    script && blocks.push(script);
    blocks.sort((a, b) => { return a.start - b.start; });
    return blocks;
}
function buildContent(i18nBlocks, raw, blocks) {
    let offset = 0;
    let i18nBlockCounter = 0;
    let contents = [];
    contents = blocks.reduce((contents, block) => {
        if (block.type === 'i18n') {
            let lang = block.attrs.lang;
            lang = (!lang || typeof lang !== 'string') ? 'json' : lang;
            const locale = block.attrs.locale;
            const i18nBlock = i18nBlocks[i18nBlockCounter];
            debug(`meta.lang = ${i18nBlock.lang}, block.lang = ${lang}, meta.locale = ${i18nBlock.locale}, block.locale = ${locale}`);
            let messages = null;
            if (lang === i18nBlock.lang && locale === i18nBlock.locale) {
                if (locale) {
                    messages = i18nBlock.messages[locale];
                }
                else {
                    messages = i18nBlock.messages;
                }
            }
            else {
                debug(`unmatch meta block and sfc block`);
                messages = utils_1.parseContent(block.content, lang);
            }
            contents = contents.concat(raw.slice(offset, block.start));
            const serialized = `\n${format(utils_1.stringfyContent(messages, lang), lang)}`;
            contents = contents.concat(serialized);
            offset = block.end;
            i18nBlockCounter++;
        }
        else {
            contents = contents.concat(raw.slice(offset, block.end));
            offset = block.end;
        }
        return contents;
    }, contents);
    contents = contents.concat(raw.slice(offset, raw.length));
    if (i18nBlocks.length > i18nBlockCounter) {
        i18nBlocks.slice(i18nBlockCounter).reduce((contents, i18nBlock) => {
            contents.push(buildI18nTag(i18nBlock));
            return contents;
        }, contents);
    }
    return contents.join('');
}
function buildI18nTag(i18nBlock) {
    const { locale, lang, messages } = i18nBlock;
    let tag = '<i18n';
    if (locale) {
        tag += ` locale="${utils_1.escape(locale)}"`;
    }
    if (lang !== 'json') {
        tag += ` lang="${utils_1.escape(lang)}"`;
    }
    tag += '>';
    return `\n
${tag}
${format(utils_1.stringfyContent(locale ? messages[locale] : messages, lang), lang)}</i18n>`;
}
function format(source, lang) {
    debug(`format: lang=${lang}, source=${source}`);
    switch (lang) {
        case 'vue':
            return source;
        case 'yaml':
        case 'yml':
            return prettier_1.default.format(source, { parser: 'yaml', tabWidth: 2 });
        case 'json5':
            return prettier_1.default.format(source, { parser: 'json5', tabWidth: 2 });
        case 'json':
        default:
            return prettier_1.default.format(source, { parser: 'json-stringify', tabWidth: 2 });
    }
}
