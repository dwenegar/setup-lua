"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const LUA_VERSION_ALIASES = {
    '5.1': '5.1.4',
    '5.2': '5.2.4',
    '5.3': '5.3.6',
    '5.4': '5.4.4',
    latest: '5.4.4'
};
const LUAROCKS_VERSION_ALIASES = {
    '3.4': '3.4.0',
    '3.5': '3.5.0',
    '3.6': '3.6.0',
    '3.7': '3.7.0',
    '3.8': '3.8.0',
    '3.9': '3.9.1',
    latest: '3.9.1'
};
function getInputs() {
    const luaVersion = core_1.getInput(constants_1.InputNames.LuaVersion, { required: true });
    const luarocksVersion = core_1.getInput(constants_1.InputNames.LuarocksVersion, { required: false });
    const repoToken = core_1.getInput(constants_1.InputNames.RepoToken, { required: true });
    let resolvedLuaVersion = luaVersion;
    if (LUA_VERSION_ALIASES[luaVersion]) {
        resolvedLuaVersion = LUA_VERSION_ALIASES[luaVersion];
    }
    let resolvedLuarocksVersion = luarocksVersion;
    if (luarocksVersion) {
        if (LUAROCKS_VERSION_ALIASES[luarocksVersion]) {
            resolvedLuarocksVersion = LUAROCKS_VERSION_ALIASES[luarocksVersion];
        }
    }
    return {
        luaVersion: resolvedLuaVersion,
        luarocksVersion: resolvedLuarocksVersion,
        repoToken: repoToken
    };
}
exports.getInputs = getInputs;
