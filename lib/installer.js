"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.installLua = installLua;
exports.installLuarocks = installLuarocks;
const tc = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const semver = __importStar(require("semver"));
const sys = __importStar(require("./system"));
async function extractArchive(archivePath, destPath) {
    const archiveSuffix = sys.getArchiveSuffix();
    if (archiveSuffix === 'zip') {
        return await tc.extractZip(archivePath, destPath);
    }
    return await tc.extractTar(archivePath, destPath);
}
function getLuaDownloadUrl(version) {
    const platform = sys.getPlatform();
    const arch = sys.getArch();
    const archiveSuffix = sys.getArchiveSuffix();
    const targetAssetName = `lua-${version}-${platform}-${arch}.${archiveSuffix}`;
    const major = semver.major(version);
    const minor = semver.minor(version);
    return `https://github.com/dwenegar/lua${major}${minor}/releases/download/v${version}/${targetAssetName}`;
}
function getLuarocksDownloadUrl(version) {
    const archiveSuffix = sys.getArchiveSuffix();
    const targetAssetName = `v${version}.${archiveSuffix}`;
    return `https://github.com/luarocks/luarocks/archive/${targetAssetName}`;
}
async function installLua(authToken, version, installPath) {
    try {
        core.info(`Attempting to install Lua ${version}`);
        const url = getLuaDownloadUrl(version);
        core.info(`Downloading Lua ${version} from ${url}`);
        const downloadPath = await tc.downloadTool(url, undefined, authToken);
        return await extractArchive(downloadPath, path.join(installPath, 'lua'));
    }
    catch (err) {
        throw new Error(`Failed to install Lua version ${version}: ${err}`);
    }
}
async function execIn(cmd, cwd) {
    await exec.exec(cmd, undefined, { cwd: cwd });
}
async function installLuarocks(authToken, version, installPath, luaPath) {
    try {
        core.info(`Attempting to install Luarocks ${version}`);
        const url = getLuarocksDownloadUrl(version);
        core.info(`Downloading Luarocks ${version} from ${url}`);
        const downloadPath = await tc.downloadTool(url, undefined, authToken);
        const extractionPath = await extractArchive(downloadPath, os.tmpdir());
        const sourcePath = path.join(extractionPath, `luarocks-${version}`);
        const platform = sys.getPlatform();
        if (platform === 'windows') {
            await execIn(`.\\install.bat /P ${installPath} /SELFCONTAINED /LUA ${luaPath} /NOREG /NOADMIN /Q`, sourcePath);
        }
        else {
            await execIn(`./configure --prefix=${installPath} --with-lua=${luaPath}`, sourcePath);
            await execIn('make -s', sourcePath);
            await execIn('make -s install', sourcePath);
        }
        return installPath;
    }
    catch (err) {
        throw new Error(`Failed to install version ${version}: ${err}`);
    }
}
