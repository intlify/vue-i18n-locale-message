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
const ESC = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;'
};
function escape(s) {
    return s.replace(/[<>"&]/g, escapeChar);
}
exports.escape = escape;
function escapeChar(a) {
    return ESC[a] || a;
}
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
        return {
            ...parsePath(basePath, target.path),
            raw: target.content,
            customBlocks,
            template,
            script,
            styles
        };
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
exports.parsePath = parsePath;
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
function stringifyContent(content, lang, options) {
    var _a, _b;
    const indent = ((_a = options) === null || _a === void 0 ? void 0 : _a.intend) || 2;
    const eof = ((_b = options) === null || _b === void 0 ? void 0 : _b.eof) || '\n';
    let result = '';
    switch (lang) {
        case 'yaml':
        case 'yml':
            result = js_yaml_1.default.safeDump(content, { indent });
            break;
        case 'json5':
            result = json5_1.default.stringify(content, null, indent);
            break;
        case 'json':
        default:
            result = JSON.stringify(content, null, indent);
            break;
    }
    if (!result.endsWith(eof)) {
        result += eof;
    }
    return result;
}
exports.stringifyContent = stringifyContent;
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
