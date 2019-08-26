"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const infuser_1 = __importDefault(require("../infuser"));
const fs_1 = __importDefault(require("fs"));
exports.command = 'infuse';
exports.aliases = 'inf';
exports.describe = 'infuse locale messages to single-file components';
exports.builder = (args) => {
    return args
        .option('target', {
        type: 'string',
        alias: 't',
        describe: 'target path that single-file components is stored',
        demandOption: true
    })
        .option('messages', {
        type: 'string',
        alias: 'o',
        describe: 'locale messages path to be infused',
        demandOption: true
    });
};
exports.handler = (args) => {
    const targetPath = utils_1.resolve(args.target);
    const messagesPath = utils_1.resolve(args.messages);
    const newSources = infuser_1.default(targetPath, utils_1.readSFC(targetPath), readLocaleMessages(messagesPath));
    writeSFC(newSources);
};
function readLocaleMessages(path) {
    // TODO: async implementation
    const data = fs_1.default.readFileSync(path, { encoding: 'utf8' });
    return JSON.parse(data);
}
function writeSFC(sources) {
    // TODO: async implementation
    sources.forEach(({ path, content }) => {
        fs_1.default.writeFileSync(path, content);
    });
}
exports.default = {
    command: exports.command,
    aliases: exports.aliases,
    describe: exports.describe,
    builder: exports.builder,
    handler: exports.handler
};
