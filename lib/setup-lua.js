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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLua = void 0;
const core = __importStar(require("@actions/core"));
const input_helper_1 = require("./input-helper");
const installer_1 = require("./installer");
const path_1 = require("path");
const child_process_1 = require("child_process");
const sys = __importStar(require("./system"));
function setupLua() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = input_helper_1.getInputs();
            const installPrefix = path_1.join(process.cwd(), '.install');
            const luaInstallPath = path_1.join(installPrefix);
            const luarocksInstallPath = path_1.join(installPrefix, 'luarocks');
            const luaVersion = inputs.luaVersion;
            core.info(`Setup Lua version ${luaVersion}`);
            const luaPath = yield installer_1.installLua(luaVersion, luaInstallPath);
            const luaBinPath = path_1.join(luaPath, 'bin');
            core.addPath(luaBinPath);
            core.info(`Added ${luaBinPath} to the path`);
            const luarocksVersion = inputs.luarocksVersion;
            if (luarocksVersion) {
                core.info(`Setup Luarocks version ${luarocksVersion}`);
                const luarocksPath = yield installer_1.installLuarocks(luarocksVersion, luarocksInstallPath, luaPath);
                const platform = sys.getPlatform();
                const luarocksBinPath = platform === 'windows' ? luarocksPath : path_1.join(luarocksPath, 'bin');
                core.addPath(luarocksBinPath);
                core.info(`Added ${luarocksBinPath} to the path`);
                let luarocksSystemPath = child_process_1.execSync('luarocks path --lr-bin', { encoding: 'utf-8' }).trim();
                core.addPath(luarocksSystemPath);
                core.info(`Added ${luarocksSystemPath} to the path`);
                let luarocksLuaPath = child_process_1.execSync('luarocks path --lr-path', { encoding: 'utf-8' }).trim();
                core.exportVariable('LUA_PATH', ';;' + luarocksLuaPath);
                core.info(`Set LUA_PATH to ${luarocksLuaPath}`);
                let luarocksLuaCPath = child_process_1.execSync('luarocks path --lr-cpath', { encoding: 'utf-8' }).trim();
                core.exportVariable('LUA_CPATH', ';;' + luarocksLuaCPath);
                core.info(`Set LUA_CPATH to ${luarocksLuaCPath}`);
                core.info(`Successfully setup Luarocks ${luarocksVersion}`);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.setupLua = setupLua;
