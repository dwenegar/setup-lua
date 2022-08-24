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
exports.setupLua = void 0;
const core = __importStar(require("@actions/core"));
const input_helper_1 = require("./input-helper");
const installer_1 = require("./installer");
const path_1 = require("path");
const child_process_1 = require("child_process");
const sys = __importStar(require("./system"));
function exportVariable(name, value) {
    core.exportVariable(name, value);
    core.info(`Set ${name} to ${process.env[name]}`);
}
function addPath(value) {
    core.addPath(value);
    core.info(`Added ${value} to PATH`);
}
async function setupLua() {
    try {
        const inputs = input_helper_1.getInputs();
        const platform = sys.getPlatform();
        const installPrefix = path_1.join(process.cwd(), '.install');
        const luaInstallPath = path_1.join(installPrefix);
        const luarocksInstallPath = path_1.join(installPrefix, 'luarocks');
        const luaVersion = inputs.luaVersion;
        core.info(`Setup Lua version ${luaVersion}`);
        const luaPath = await installer_1.installLua(inputs.repoToken, luaVersion, luaInstallPath);
        const luaBinPath = path_1.join(luaPath, 'bin');
        addPath(luaBinPath);
        const luarocksVersion = inputs.luarocksVersion;
        if (luarocksVersion) {
            core.info(`Setup Luarocks version ${luarocksVersion}`);
            const luarocksPath = await installer_1.installLuarocks(inputs.repoToken, luarocksVersion, luarocksInstallPath, luaPath);
            const luarocksBinPath = platform === 'windows' ? luarocksPath : path_1.join(luarocksPath, 'bin');
            addPath(luarocksBinPath);
            let luarocksSystemPath = child_process_1.execSync('luarocks path --lr-bin', { encoding: 'utf-8' }).trim();
            addPath(luarocksSystemPath);
            let luarocksLuaPath = child_process_1.execSync('luarocks path --lr-path', { encoding: 'utf-8' }).trim();
            exportVariable('LUA_PATH', luarocksLuaPath);
            let luarocksLuaCPath = child_process_1.execSync('luarocks path --lr-cpath', { encoding: 'utf-8' }).trim();
            exportVariable('LUA_CPATH', luarocksLuaCPath);
            core.info(`Successfully setup Luarocks ${luarocksVersion}`);
        }
    }
    catch (e) {
        if (typeof e === 'string') {
            core.setFailed(e);
        }
        else if (e instanceof Error) {
            core.setFailed(e.message);
        }
    }
}
exports.setupLua = setupLua;
