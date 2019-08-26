"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const squeezer_1 = __importDefault(require("../squeezer"));
const fs_1 = __importDefault(require("fs"));
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
        .option('output', {
        type: 'string',
        alias: 'o',
        default: outputDefault,
        describe: 'path to output squeezed locale messages'
    });
};
exports.handler = (args) => {
    const targetPath = utils_1.resolve(args.target);
    const messages = squeezer_1.default(targetPath, utils_1.readSFC(targetPath));
    writeLocaleMessages(utils_1.resolve(args.output), messages);
};
function writeLocaleMessages(output, messages) {
    // TODO: async implementation
    fs_1.default.writeFileSync(output, JSON.stringify(messages, null, 2));
}
exports.default = {
    command: exports.command,
    aliases: exports.aliases,
    describe: exports.describe,
    builder: exports.builder,
    handler: exports.handler
};
