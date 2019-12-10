"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:commands:infuse');
exports.command = 'push';
exports.aliases = 'ph';
exports.describe = 'push locale messages to localization service';
exports.builder = (args) => {
    return args
        .option('target', {
        type: 'string',
        alias: 't',
        describe: 'target path that locale messages file is stored',
        demandOption: true
    })
        .option('locale', {
        type: 'string',
        alias: 'l',
        describe: `the locale of locale messages file specified with --target, if it's specified single-file`
    })
        .option('match', {
        type: 'string',
        alias: 'm',
        describe: `option should be accepted a regex filenames, must be specified together --target if it's directory path of locale messages`
    })
        .option('provider', {
        type: 'string',
        alias: 'p',
        describe: 'the target localization service provider',
        demandOption: true
    })
        .option('providerConf', {
        type: 'string',
        alias: 'c',
        describe: 'the json file configration of localization service provider'
    });
};
exports.handler = (args) => {
    const targetPath = utils_1.resolve(args.target);
    const provider = loadProvider(args.provider);
    if (provider === null) {
        // TODO: should be showd console message
        return;
    }
};
function loadProvider(provider) {
    let mod = null;
    try {
        mod = require(require.resolve(provider));
    }
    catch (e) { }
    return mod;
}
async function loadProviderConf(confPath) {
    let conf = null;
    try {
        conf = await Promise.resolve().then(() => __importStar(require(confPath)));
    }
    catch (e) { }
    return conf;
}
function push() {
    return false;
}
exports.default = {
    command: exports.command,
    aliases: exports.aliases,
    describe: exports.describe,
    builder: exports.builder,
    handler: exports.handler
};
