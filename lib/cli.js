#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
yargs
    .usage('Usage: $0 <command> [options]')
    .commandDir('./commands', {
    extensions: process.env.NODE_ENV === 'development' ? ['js', 'ts'] : ['js']
})
    .demandCommand()
    .help()
    .version()
    .argv;
process.on('uncaughtException', err => {
    console.error(`uncaught exception: ${err}\n`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('unhandled rejection at:', p, 'reason:', reason);
    process.exit(1);
});
