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
const path_1 = __importDefault(require("path"));
const debug_1 = require("debug");
const debug = debug_1.debug('vue-i18n-locale-message:reflector');
function reflectLocaleMessageMeta(basePath, components) {
    return components.map(target => {
        const desc = component_compiler_utils_1.parse({
            source: target.content,
            filename: target.path,
            compiler: compiler
        });
        const { contentPath, component, hierarchy } = parsePath(basePath, target.path);
        return {
            contentPath,
            blocks: desc.customBlocks,
            component,
            hierarchy
        };
    });
}
exports.default = reflectLocaleMessageMeta;
function parsePath(basePath, targetPath) {
    const parsed = path_1.default.parse(targetPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, target] = parsed.dir.split(basePath);
    const parsedTargetPath = target.split(path_1.default.sep);
    parsedTargetPath.shift();
    debug(`parsePath: contentPath = ${targetPath}, component = ${parsed.name}, messageHierarchy = ${parsedTargetPath}`);
    return {
        contentPath: targetPath,
        component: parsed.name,
        hierarchy: parsedTargetPath
    };
}
