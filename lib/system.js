"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatform = getPlatform;
exports.getArch = getArch;
exports.getArchiveSuffix = getArchiveSuffix;
let os = require('os');
function getPlatform() {
    let platform = os.platform();
    if (platform === 'win32') {
        return 'windows';
    }
    return platform;
}
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
function getArchiveSuffix() {
    let platform = os.platform();
    if (platform === 'win32') {
        return 'zip';
    }
    return 'tar.gz';
}
