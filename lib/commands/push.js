"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:commands:push');
const DEFUALT_CONF = { provider: {}, pushMode: 'locale-message' };
exports.command = 'push';
exports.aliases = 'ph';
exports.describe = 'push locale messages to localization service';
exports.builder = (args) => {
    return args
        .option('provider', {
        type: 'string',
        alias: 'p',
        describe: 'the target localization service provider',
        demandOption: true
    })
        .option('conf', {
        type: 'string',
        alias: 'c',
        describe: 'the json file configration of localization service provider'
    })
        .option('target', {
        type: 'string',
        alias: 't',
        describe: 'target path that locale messages file is stored, default push with the filename of target path as locale'
    })
        .option('locale', {
        type: 'string',
        alias: 'l',
        describe: `option for the locale of locale messages file specified with --target, if it's specified single-file`
    })
        .option('targetPaths', {
        type: 'string',
        alias: 'T',
        describe: 'target directory paths that locale messages files is stored, Can also be specified multi paths with comma delimiter'
    })
        .option('filenameMatch', {
        type: 'string',
        alias: 'm',
        describe: `option should be accepted a regex filenames, must be specified together --targets if it's directory path of locale messages`
    })
        .option('dryRun', {
        type: 'boolean',
        alias: 'd',
        default: false,
        describe: `run the push command, but do not apply to locale messages of localization service`
    });
};
exports.handler = async (args) => {
    const ProviderFactory = loadProvider(args.provider);
    if (ProviderFactory === null) {
        // TODO: should refactor console message
        console.log(`Not found ${args.provider} provider`);
        return;
    }
    let conf = DEFUALT_CONF;
    if (args.conf) {
        conf = loadProviderConf(utils_1.resolve(args.conf));
    }
    if (!args.target && !args.targetPaths) {
        // TODO: should refactor console message
        console.log('You need to specify either --target or --target-paths');
        return;
    }
    let resource;
    try {
        resource = getProviderPushResource(args, conf.pushMode);
    }
    catch (e) {
        console.log(e.message);
        return;
    }
    const provider = ProviderFactory(conf);
    const ret = await provider.push(resource, args.dryRun);
    if (ret) {
        // TODO: should refactor console message
        console.log('push success');
    }
    else {
        // TODO: should refactor console message
        console.error('push fail');
    }
};
function loadProvider(provider) {
    let mod = null;
    try {
        // TODO: should validate I/F checking & dynamic importing
        const m = require(require.resolve(provider));
        debug('loaderProvider', m);
        if ('__esModule' in m) {
            mod = m.default;
        }
        else {
            mod = m;
        }
    }
    catch (e) { }
    return mod;
}
function loadProviderConf(confPath) {
    let conf = DEFUALT_CONF;
    try {
        // TODO: should validate I/F checking & dynamic importing
        conf = require(confPath);
    }
    catch (e) { }
    return conf;
}
function getProviderPushResource(args, mode) {
    var _a;
    const resource = { mode };
    debug(`getProviderPushResource: mode=${mode}`);
    if (mode === 'locale-message') {
        resource.messages = {};
    }
    else { // 'file-path'
        resource.files = [];
    }
    if (args.target) {
        const targetPath = utils_1.resolve(args.target);
        const parsed = path_1.default.parse(targetPath);
        const locale = args.locale ? args.locale : parsed.name;
        if (mode === 'locale-message') {
            resource.messages = Object.assign(resource.messages, { [locale]: require(targetPath) });
        }
        else { // 'file-path'
            (_a = resource.files) === null || _a === void 0 ? void 0 : _a.push({
                locale,
                path: targetPath
            });
        }
    }
    else if (args.targetPaths) {
        const filenameMatch = args.filenameMatch;
        if (!filenameMatch) {
            // TODO: should refactor console message
            throw new Error('You need to specify together --filename-match');
        }
        const targetPaths = args.targetPaths.split(',').filter(p => p);
        targetPaths.forEach(targetPath => {
            const globedPaths = glob_1.default.sync(targetPath).map(p => utils_1.resolve(p));
            globedPaths.forEach(fullPath => {
                var _a;
                const parsed = path_1.default.parse(fullPath);
                const re = new RegExp(filenameMatch, 'ig');
                const match = re.exec(parsed.base);
                debug('regex match', match, fullPath);
                if (match && match[1]) {
                    const locale = match[1];
                    if (mode === 'locale-message') {
                        resource.messages = Object.assign(resource.messages, { [locale]: require(fullPath) });
                    }
                    else { // 'file-path'
                        (_a = resource.files) === null || _a === void 0 ? void 0 : _a.push({
                            locale,
                            path: fullPath
                        });
                    }
                }
                else {
                    // TODO: should refactor console message
                    console.log(`${fullPath} is not matched with ${filenameMatch}`);
                }
            });
        });
    }
    return resource;
}
exports.default = {
    command: exports.command,
    aliases: exports.aliases,
    describe: exports.describe,
    builder: exports.builder,
    handler: exports.handler
};
