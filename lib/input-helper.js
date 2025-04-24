"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = getInputs;
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const LUA_VERSION_ALIASES = {
    '5.1': '5.1.4',
    '5.2': '5.2.4',
    '5.3': '5.3.6',
    '5.4': '5.4.7',
    latest: '5.4.7'
};
const LUAROCKS_VERSION_ALIASES = {
    '3.4': '3.4.0',
    '3.5': '3.5.0',
    '3.6': '3.6.0',
    '3.7': '3.7.0',
    '3.8': '3.8.0',
    '3.9': '3.9.2',
    '3.11': '3.11.1',
    latest: '3.11.1'
};
function getInputs() {
    const luaVersion = (0, core_1.getInput)(constants_1.InputNames.LuaVersion, { required: true });
    const luarocksVersion = (0, core_1.getInput)(constants_1.InputNames.LuarocksVersion, { required: false });
    const repoToken = (0, core_1.getInput)(constants_1.InputNames.RepoToken, { required: false });
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
