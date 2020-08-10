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
exports.installLuarocks = exports.installLua = void 0;
const tc = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const httpm = __importStar(require("@actions/http-client"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const sys = __importStar(require("./system"));
function installLua(version, installPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const arch = sys.getArch();
        const platform = sys.getPlatform();
        core.info(`Attempting to download Lua ${version}`);
        const info = yield getLuaDownloadInfo(version, platform, arch);
        if (!info) {
            throw new Error(`Unable to find Lua version '${version}' for platform ${platform} and architecture ${arch}.`);
        }
        try {
            core.info('Installing from archive');
            return yield installLuaVersion(info, installPath);
        }
        catch (err) {
            throw new Error(`Failed to download version ${version}: ${err}`);
        }
    });
}
exports.installLua = installLua;
function installLuarocks(version, installPath, luaPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info(`Attempting to download Luarocks ${version}`);
        const info = yield getLuarocksDownloadInfo(version);
        if (!info) {
            throw new Error(`Unable to find Luarocks version '${version}'.`);
        }
        try {
            core.info('Installing from archive');
            return yield installLuarocksVersion(info, installPath, luaPath);
        }
        catch (err) {
            throw new Error(`Failed to download version ${version}: ${err}`);
        }
    });
}
exports.installLuarocks = installLuarocks;
function installLuaVersion(info, installPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info(`Downloading Lua ${info.version} from ${info.url}`);
        const downloadPath = yield tc.downloadTool(info.url);
        const extractionPath = yield extractArchive(downloadPath, path.join(installPath, 'lua'));
        core.info(`Extracted Lua to ${extractionPath}`);
        return extractionPath;
    });
}
function installLuarocksVersion(info, installPath, luaPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info(`Downloading Luarocks ${info.version} from ${info.url}`);
        const downloadPath = yield tc.downloadTool(info.url);
        const extractionPath = yield extractArchive(downloadPath, os.tmpdir());
        core.info(`Extracted Luarocks to ${extractionPath}`);
        const sourcePath = path.join(extractionPath, `luarocks-${info.version}`);
        const platform = sys.getPlatform();
        if (platform === 'windows') {
            yield execIn(`.\\install.bat /P ${installPath} /SELFCONTAINED /LUA ${luaPath} /NOREG /NOADMIN /Q`, sourcePath);
        }
        else {
            yield execIn(`./configure --prefix=${installPath} --with-lua=${luaPath}`, sourcePath);
            yield execIn('make -s', sourcePath);
            yield execIn('make -s install', sourcePath);
        }
        return installPath;
    });
}
function extractArchive(archivePath, destPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const archiveSuffix = sys.getArchiveSuffix();
        if (archiveSuffix === 'zip') {
            return yield tc.extractZip(archivePath, destPath);
        }
        return yield tc.extractTar(archivePath, destPath);
    });
}
function getGitHubRelease(releaseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const http = new httpm.HttpClient('setup-lua', [], {
            allowRedirects: true,
            maxRedirects: 3
        });
        const response = yield http.getJson(releaseUrl);
        return response.result;
    });
}
function getLuaDownloadInfo(version, platform, arch) {
    return __awaiter(this, void 0, void 0, function* () {
        const releaseUrl = `https://api.github.com/repos/luadevkit/build/releases/tags/v${version}`;
        const githubRelease = yield getGitHubRelease(releaseUrl);
        if (!githubRelease) {
            return;
        }
        const archiveSuffix = sys.getArchiveSuffix();
        const targetAssetName = `lua-${version}-${platform}-${arch}.${archiveSuffix}`;
        for (const asset of githubRelease.assets) {
            if (asset.name == targetAssetName)
                return {
                    version: version,
                    fileName: asset.name,
                    url: asset.browser_download_url
                };
        }
    });
}
function getLuarocksDownloadInfo(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const archiveSuffix = sys.getArchiveSuffix();
        const targetAssetName = `v${version}.${archiveSuffix}`;
        return {
            version: version,
            fileName: targetAssetName,
            url: `https://github.com/luarocks/luarocks/archive/${targetAssetName}`
        };
    });
}
function execIn(cmd, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec(cmd, undefined, { cwd: cwd });
    });
}
