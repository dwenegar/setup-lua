import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpm from '@actions/http-client';

import * as path from 'path';
import * as os from 'os';

import * as sys from './system';

async function extractArchive(archivePath: string, destPath: string): Promise<string> {
  const archiveSuffix = sys.getArchiveSuffix();
  if (archiveSuffix === 'zip') {
    return await tc.extractZip(archivePath, destPath);
  }
  return await tc.extractTar(archivePath, destPath);
}

function getLuaDownloadUrl(version: string): string {
  const platform: string = sys.getPlatform();
  const arch: string = sys.getArch();
  const archiveSuffix = sys.getArchiveSuffix();
  const targetAssetName: string = `lua-${version}-${platform}-${arch}.${archiveSuffix}`;
  return `https://github.com/luadevkit/versions/releases/download/v${version}/${targetAssetName}`;
}

function getLuarocksDownloadUrl(version: string): string {
  const archiveSuffix = sys.getArchiveSuffix();
  const targetAssetName: string = `v${version}.${archiveSuffix}`;
  return `https://github.com/luarocks/luarocks/archive/${targetAssetName}`;
}

export async function installLua(authToken: string, version: string, installPath: string) {
  try {
    core.info(`Attempting to install Lua ${version}`);
    const url: string = getLuaDownloadUrl(version);

    core.info(`Downloading Lua ${version} from ${url}`);
    const downloadPath: string = await tc.downloadTool(url, undefined, authToken);
    return await extractArchive(downloadPath, path.join(installPath, 'lua'));
  } catch (err) {
    throw new Error(`Failed to install Lua version ${version}: ${err}`);
  }
}

async function execIn(cmd: string, cwd: string) {
  await exec.exec(cmd, undefined, {cwd: cwd});
}

export async function installLuarocks(
  authToken: string,
  version: string,
  installPath: string,
  luaPath: string
): Promise<string> {
  try {
    core.info(`Attempting to install Luarocks ${version}`);
    const url: string = getLuarocksDownloadUrl(version);

    core.info(`Downloading Luarocks ${version} from ${url}`);
    const downloadPath: string = await tc.downloadTool(url, undefined, authToken);
    const extractionPath = await extractArchive(downloadPath, os.tmpdir());
    const sourcePath = path.join(extractionPath, `luarocks-${version}`);

    const platform = sys.getPlatform();
    if (platform === 'windows') {
      await execIn(`.\\install.bat /P ${installPath} /SELFCONTAINED /LUA ${luaPath} /NOREG /NOADMIN /Q`, sourcePath);
    } else {
      await execIn(`./configure --prefix=${installPath} --with-lua=${luaPath}`, sourcePath);
      await execIn('make -s', sourcePath);
      await execIn('make -s install', sourcePath);
    }

    return installPath;
  } catch (err) {
    throw new Error(`Failed to install version ${version}: ${err}`);
  }
}
