"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchiveSuffix = exports.getArch = exports.getPlatform = void 0;
let os = require('os');
function getPlatform() {
    let platform = os.platform();
    if (platform === 'win32') {
        return 'windows';
    }
    return platform;
}
exports.getPlatform = getPlatform;
function getArch() {
    let arch = os.arch();
    if (arch === 'x64') {
        return 'amd64';
    }
    else if (arch === 'x32') {
        return '386';
    }
    return arch;
}
exports.getArch = getArch;
function getArchiveSuffix() {
    let platform = os.platform();
    if (platform === 'win32') {
        return 'zip';
    }
    return 'tar.gz';
}
exports.getArchiveSuffix = getArchiveSuffix;
