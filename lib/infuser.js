"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const prettier_1 = __importDefault(require("prettier"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:infuser');
function infuse(basePath, sources, messages) {
    const descriptors = utils_1.reflectSFCDescriptor(basePath, sources);
    const locales = Object.keys(messages);
    return descriptors.map(descriptor => {
        return {
            content: generate(locales, messages, descriptor),
            path: descriptor.contentPath
        };
    });
}
exports.default = infuse;
function generate(locales, messages, descriptor) {
    const target = getTargetLocaleMessages(locales, messages, descriptor);
    debug('target locale messages\n', target);
    const blocks = getBlocks(descriptor);
    blocks.forEach(b => debug(`block: type=${b.type}, start=${b.start}, end=${b.end}`));
    const { raw } = descriptor;
    const content = buildContent(target, raw, blocks);
    debug(`build content:\n${content}`);
    debug(`content size: raw=${raw.length}, content=${content.length}`);
    return format(content, 'vue');
}
function getTargetLocaleMessages(locales, messages, descriptor) {
    return locales.reduce((target, locale) => {
        debug(`processing curernt: locale=${locale}, target=${target}`);
        const obj = messages[locale];
        if (obj) {
            let o = obj;
            let prev = null;
            const hierarchy = descriptor.hierarchy.concat();
            while (hierarchy.length > 0) {
                const key = hierarchy.shift();
                debug('processing hierarchy key: ', key);
                if (!key || !o) {
                    break;
                }
                o = o[key];
                prev = o;
            }
            if (!o && !prev) {
                return target;
            }
            else {
                return Object.assign(target, { [locale]: ((!o && prev) ? prev : o) });
            }
        }
        else {
            return target;
        }
    }, {});
}
function getBlocks(descriptor) {
    const { template, script, styles, customBlocks } = descriptor;
    const blocks = [...styles, ...customBlocks];
    template && blocks.push(template);
    script && blocks.push(script);
    blocks.sort((a, b) => { return a.start - b.start; });
    return blocks;
}
function buildContent(target, raw, blocks) {
    let offset = 0;
    let contents = [];
    let targetLocales = Object.keys(target);
    contents = blocks.reduce((contents, block) => {
        if (block.type === 'i18n') {
            let lang = block.attrs.lang;
            lang = (!lang || typeof lang !== 'string') ? 'json' : lang;
            let messages = null;
            const locale = block.attrs.locale;
            if (!locale || typeof locale !== 'string') {
                const obj = utils_1.parseContent(block.content, lang);
                const locales = Object.keys(obj);
                messages = locales.reduce((messages, locale) => {
                    return Object.assign(messages, { [locale]: target[locale] });
                }, {});
                locales.forEach(locale => {
                    targetLocales = targetLocales.filter(l => l !== locale);
                });
            }
            else {
                messages = Object.assign({}, target[locale]);
                targetLocales = targetLocales.filter(l => l !== locale);
            }
            contents = contents.concat(raw.slice(offset, block.start));
            const serialized = `\n${format(utils_1.stringfyContent(messages, lang), lang)}`;
            contents = contents.concat(serialized);
            offset = block.end;
        }
        else {
            contents = contents.concat(raw.slice(offset, block.end));
            offset = block.end;
        }
        return contents;
    }, contents);
    contents = contents.concat(raw.slice(offset, raw.length));
    if (targetLocales.length > 0) {
        contents = targetLocales.reduce((contents, locale) => {
            contents.push(`\n
<i18n locale="${locale}">
${format(utils_1.stringfyContent(target[locale], 'json'), 'json')}</i18n>`);
            return contents;
        }, contents);
    }
    return contents.join('');
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
