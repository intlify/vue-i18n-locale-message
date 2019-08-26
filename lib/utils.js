"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_compiler_utils_1 = require("@vue/component-compiler-utils");
const compiler = __importStar(require("vue-template-compiler"));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const json5_1 = __importDefault(require("json5"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:utils');
function resolve(...paths) {
    return path_1.default.resolve(...paths);
}
exports.resolve = resolve;
function reflectSFCDescriptor(basePath, components) {
    return components.map(target => {
        const { template, script, styles, customBlocks } = component_compiler_utils_1.parse({
            source: target.content,
            filename: target.path,
            compiler: compiler
        });
        return Object.assign({}, parsePath(basePath, target.path), { raw: target.content, customBlocks,
            template,
            script,
            styles });
    });
}
exports.reflectSFCDescriptor = reflectSFCDescriptor;
function parsePath(basePath, targetPath) {
    const { dir, name } = path_1.default.parse(targetPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, target] = dir.split(basePath);
    const parsedTargetPath = target.split(path_1.default.sep);
    parsedTargetPath.shift();
    debug(`parsePath: contentPath = ${targetPath}, component = ${name}, messageHierarchy = ${parsedTargetPath}`);
    return {
        contentPath: targetPath,
        component: name,
        hierarchy: [...parsedTargetPath, name]
    };
}
function parseContent(content, lang) {
    switch (lang) {
        case 'yaml':
        case 'yml':
            return js_yaml_1.default.safeLoad(content);
        case 'json5':
            return json5_1.default.parse(content);
        case 'json':
        default:
            return JSON.parse(content);
    }
}
exports.parseContent = parseContent;
function stringfyContent(content, lang) {
    switch (lang) {
        case 'yaml':
        case 'yml':
            return js_yaml_1.default.safeDump(content);
        case 'json5':
            return json5_1.default.stringify(content, null, 2);
        case 'json':
        default:
            return JSON.stringify(content, null, 2);
    }
}
exports.stringfyContent = stringfyContent;
function readSFC(target) {
    const targets = resolveGlob(target);
    debug('readSFC: targets = ', targets);
    // TODO: async implementation
    return targets.map(target => {
        const data = fs_1.default.readFileSync(target);
        return {
            path: target,
            content: data.toString()
        };
    });
}
exports.readSFC = readSFC;
function resolveGlob(target) {
    // TODO: async implementation
    return glob_1.default.sync(`${target}/**/*.vue`);
}
