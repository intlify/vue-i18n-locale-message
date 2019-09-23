"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const squeezer_1 = __importDefault(require("../squeezer"));
const fs_1 = __importDefault(require("fs"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:commands:squeeze');
exports.command = 'squeeze';
exports.aliases = 'sqz';
exports.describe = 'squeeze locale messages from single-file components';
exports.builder = (args) => {
    const outputDefault = `${process.cwd()}/messages.json`;
    return args
        .option('target', {
        type: 'string',
        alias: 't',
        describe: 'target path that single-file components is stored',
        demandOption: true
    })
        .option('split', {
        type: 'boolean',
        alias: 's',
        default: false,
        describe: 'split squeezed locale messages with locale'
    })
        .option('output', {
        type: 'string',
        alias: 'o',
        default: outputDefault,
        describe: 'path to output squeezed locale messages'
    });
};
exports.handler = (args) => {
    const targetPath = utils_1.resolve(args.target);
    const meta = squeezer_1.default(targetPath, utils_1.readSFC(targetPath));
    const messages = generate(meta);
    writeLocaleMessages(messages, args);
};
function generate(meta) {
    const { target, components } = meta;
    let messages = {};
    const assignLocales = (locales, messages) => {
        return locales.reduce((messages, locale) => {
            !messages[locale] && Object.assign(messages, { [locale]: {} });
            return messages;
        }, messages);
    };
    for (const [component, blocks] of Object.entries(components)) {
        debug(`generate component = ${component}`);
        const parsed = utils_1.parsePath(target, component);
        messages = blocks.reduce((messages, block) => {
            debug(`generate current messages = ${JSON.stringify(messages)}`);
            const locales = Object.keys(block.messages);
            messages = assignLocales(locales, messages);
            locales.reduce((messages, locale) => {
                if (block.messages[locale]) {
                    const localeMessages = messages[locale];
                    const localeBlockMessages = block.messages[locale];
                    let target = localeMessages;
                    const hierarchy = parsed.hierarchy.concat();
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
                }
                return messages;
            }, messages);
            return messages;
        }, messages);
    }
    return messages;
}
function writeLocaleMessages(messages, args) {
    // TODO: async implementation
    const split = args.split;
    const output = utils_1.resolve(args.output);
    if (!split) {
        fs_1.default.writeFileSync(output, JSON.stringify(messages, null, 2));
    }
    else {
        splitLocaleMessages(output, messages);
    }
}
function splitLocaleMessages(path, messages) {
    const locales = Object.keys(messages);
    const write = () => {
        locales.forEach(locale => {
            fs_1.default.writeFileSync(`${path}/${locale}.json`, JSON.stringify(messages[locale], null, 2));
        });
    };
    try {
        fs_1.default.mkdirSync(path);
        write();
    }
    catch (err) {
        if (err.code === 'EEXIST') {
            write();
        }
        else {
            console.error(err.message);
            throw err;
        }
    }
}
exports.default = {
    command: exports.command,
    aliases: exports.aliases,
    describe: exports.describe,
    builder: exports.builder,
    handler: exports.handler
};
