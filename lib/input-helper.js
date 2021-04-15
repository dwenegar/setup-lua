"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core = __importStar(require("@actions/core"));
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const VALID_LUA_VERSIONS = [
    '5.1.4',
    '5.1.5',
    '5.2.0',
    '5.2.1',
    '5.2.2',
    '5.2.3',
    '5.2.4',
    '5.3.0',
    '5.3.1',
    '5.3.2',
    '5.3.3',
    '5.3.4',
    '5.3.5',
    '5.3.6',
    '5.4.0',
    '5.4.1',
    '5.4.2',
    '5.4.3'
];
const LUA_VERSION_ALIASES = {
    '5.1': '5.1.4',
    '5.2': '5.2.4',
    '5.3': '5.3.6',
    '5.4': '5.4.3',
    latest: '5.4.3'
};
const VALID_LUAROCK_VERSIONS = ['3.4.0', '3.5.0', '3.6.0'];
const LUAROCKS_VERSION_ALIASES = {
    '3.4': '3.4.0',
    '3.5': '3.5.0',
    '3.6': '3.6.0',
    '3.7': '3.7.0',
    latest: '3.7.0'
};
function getInputs() {
    const luaVersion = core_1.getInput(constants_1.InputNames.LuaVersion, { required: true });
    const luarocksVersion = core_1.getInput(constants_1.InputNames.LuarocksVersion, { required: false });
    const repoToken = core_1.getInput(constants_1.InputNames.RepoToken, { required: true });
    let resolvedLuaVersion = luaVersion;
    if (LUA_VERSION_ALIASES[luaVersion]) {
        resolvedLuaVersion = LUA_VERSION_ALIASES[luaVersion];
    }
    if (!VALID_LUA_VERSIONS.includes(resolvedLuaVersion)) {
        core.setFailed(`Invalid lua version: ${luaVersion}`);
    }
    let resolvedLuarocksVersion = luarocksVersion;
    if (luarocksVersion) {
        if (LUAROCKS_VERSION_ALIASES[luarocksVersion]) {
            resolvedLuarocksVersion = LUAROCKS_VERSION_ALIASES[luarocksVersion];
        }
        if (!VALID_LUAROCK_VERSIONS.includes(resolvedLuarocksVersion)) {
            core.setFailed(`Invalid luarock version: ${luarocksVersion}`);
        }
    }
    return {
        luaVersion: resolvedLuaVersion,
        luarocksVersion: resolvedLuarocksVersion,
        repoToken: repoToken
    };
}
exports.getInputs = getInputs;
