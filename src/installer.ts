import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpm from '@actions/http-client';

import * as path from 'path';
import * as os from 'os';

import * as sys from './system';

interface ILuaReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface IGitHubRelease {
  tag_name: string;
  assets: ILuaReleaseAsset[];
}

interface IDownloadInfo {
  version: string;
  fileName: string;
  url: string;
}

export async function installLua(version: string, installPath: string) {
  const arch: string = sys.getArch();
  const platform: string = sys.getPlatform();

  core.info(`Attempting to download Lua ${version}`);
  const info = await getLuaDownloadInfo(version, platform, arch);
  if (!info) {
    throw new Error(`Unable to find Lua version '${version}' for platform ${platform} and architecture ${arch}.`);
  }

  try {
    core.info('Installing from archive');
    return await installLuaVersion(info, installPath);
  } catch (err) {
    throw new Error(`Failed to download version ${version}: ${err}`);
  }
}

export async function installLuarocks(version: string, installPath: string, luaPath: string): Promise<string> {
  core.info(`Attempting to download Luarocks ${version}`);
  const info = await getLuarocksDownloadInfo(version);
  if (!info) {
    throw new Error(`Unable to find Luarocks version '${version}'.`);
  }

  try {
    core.info('Installing from archive');
    return await installLuarocksVersion(info, installPath, luaPath);
  } catch (err) {
    throw new Error(`Failed to download version ${version}: ${err}`);
  }
}

async function installLuaVersion(info: IDownloadInfo, installPath: string): Promise<string> {
  core.info(`Downloading Lua ${info.version} from ${info.url}`);
  const downloadPath = await tc.downloadTool(info.url);

  const extractionPath = await extractArchive(downloadPath, path.join(installPath, 'lua'));
  core.info(`Extracted Lua to ${extractionPath}`);

  return extractionPath;
}

async function installLuarocksVersion(info: IDownloadInfo, installPath: string, luaPath: string): Promise<string> {
  core.info(`Downloading Luarocks ${info.version} from ${info.url}`);
  const downloadPath = await tc.downloadTool(info.url);

  const extractionPath = await extractArchive(downloadPath, os.tmpdir());
  core.info(`Extracted Luarocks to ${extractionPath}`);

  const sourcePath = path.join(extractionPath, `luarocks-${info.version}`);

  const platform = sys.getPlatform();
  if (platform === 'windows') {
    await execIn(`.\\install.bat /P ${installPath} /SELFCONTAINED /LUA ${luaPath} /NOREG /NOADMIN /Q`, sourcePath);
  } else {
    await execIn(`./configure --prefix=${installPath} --with-lua=${luaPath}`, sourcePath);
    await execIn('make -s', sourcePath);
    await execIn('make -s install', sourcePath);
  }

  return installPath;
}

async function extractArchive(archivePath: string, destPath: string): Promise<string> {
  const archiveSuffix = sys.getArchiveSuffix();
  if (archiveSuffix === 'zip') {
    return await tc.extractZip(archivePath, destPath);
  }
  return await tc.extractTar(archivePath, destPath);
}

async function getGitHubRelease(releaseUrl: string): Promise<IGitHubRelease | null> {
  const http: httpm.HttpClient = new httpm.HttpClient('setup-lua', [], {
    allowRedirects: true,
    maxRedirects: 3
  });
  const response = await http.getJson<IGitHubRelease>(releaseUrl);
  return response.result;
}

async function getLuaDownloadInfo(version: string, platform: string, arch: string): Promise<IDownloadInfo | undefined> {
  const releaseUrl: string = `https://api.github.com/repos/luadevkit/build/releases/tags/v${version}`;
  const githubRelease: IGitHubRelease | null = await getGitHubRelease(releaseUrl);
  if (!githubRelease) {
    return;
  }

  const archiveSuffix = sys.getArchiveSuffix();
  const targetAssetName: string = `lua-${version}-${platform}-${arch}.${archiveSuffix}`;
  for (const asset of githubRelease.assets) {
    if (asset.name == targetAssetName)
      return <IDownloadInfo>{
        version: version,
        fileName: asset.name,
        url: asset.browser_download_url
      };
  }
}

async function getLuarocksDownloadInfo(version: string): Promise<IDownloadInfo | undefined> {
  const archiveSuffix = sys.getArchiveSuffix();
  const targetAssetName: string = `v${version}.${archiveSuffix}`;
  return <IDownloadInfo>{
    version: version,
    fileName: targetAssetName,
    url: `https://github.com/luarocks/luarocks/archive/${targetAssetName}`
  };
}

async function execIn(cmd: string, cwd: string) {
  await exec.exec(cmd, undefined, {cwd: cwd});
}
