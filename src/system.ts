let os = require('os');

export function getPlatform(): string {
  let platform: string = os.platform();
  if (platform === 'win32') {
    return 'windows';
  }
  return platform;
}

export function getArch(): string {
  let arch: string = os.arch();
  if (arch === 'x64') {
    return 'amd64';
  } else if (arch === 'x32') {
    return '386';
  }
  return arch;
}

export function getArchiveSuffix(): string {
  let platform: string = os.platform();
  if (platform === 'win32') {
    return 'zip';
  }
  return 'tar.gz';
}
