"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const LUA_VERSION_ALIASES = {
    '5.1': '5.1.5',
    '5.2': '5.2.4',
    '5.3': '5.3.6',
    '5.4': '5.4.2',
    latest: '5.4.2'
};
const LUAROCKS_VERSION_ALIASES = {
    '3.0': '3.0.4',
    '3.1': '3.1.3',
    '3.2': '3.2.1',
    '3.3': '3.3.1',
    '3.4': '3.4.0',
    '3.5': '3.5.0',
    latest: '3.5.0'
};
function getInputs() {
    const luaVersion = core_1.getInput(constants_1.InputNames.LuaVersion, { required: true });
    const luarocksVersion = core_1.getInput(constants_1.InputNames.LuarocksVersion, { required: false });
    let resolvedLuaVersion = luaVersion;
    if (LUA_VERSION_ALIASES[luaVersion]) {
        resolvedLuaVersion = LUA_VERSION_ALIASES[luaVersion];
    }
    let resolvedLuarocksVersion = luarocksVersion;
    if (luarocksVersion && LUAROCKS_VERSION_ALIASES[luarocksVersion]) {
        resolvedLuarocksVersion = LUAROCKS_VERSION_ALIASES[luarocksVersion];
    }
    return {
        luaVersion: resolvedLuaVersion,
        luarocksVersion: resolvedLuarocksVersion
    };
}
exports.getInputs = getInputs;
