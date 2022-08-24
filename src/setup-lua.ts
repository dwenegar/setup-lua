import * as core from '@actions/core';
import {getInputs} from './input-helper';
import {installLua, installLuarocks} from './installer';

import {join} from 'path';
import {execSync} from 'child_process';

import * as sys from './system';

function exportVariable(name: string, value: string) {
  core.exportVariable(name, value);
  core.info(`Set ${name} to ${process.env[name]}`);
}

function addPath(value: string) {
  core.addPath(value);
  core.info(`Added ${value} to PATH`);
}

export async function setupLua() {
  try {
    const inputs = getInputs();
    const platform = sys.getPlatform();

    const installPrefix = join(process.cwd(), '.install');
    const luaInstallPath = join(installPrefix);
    const luarocksInstallPath = join(installPrefix, 'luarocks');

    const luaVersion = inputs.luaVersion;
    core.info(`Setup Lua version ${luaVersion}`);

    const luaPath = await installLua(inputs.repoToken, luaVersion, luaInstallPath);

    const luaBinPath = join(luaPath, 'bin');
    addPath(luaBinPath);

    const luarocksVersion = inputs.luarocksVersion;
    if (luarocksVersion) {
      core.info(`Setup Luarocks version ${luarocksVersion}`);
      const luarocksPath = await installLuarocks(inputs.repoToken, luarocksVersion, luarocksInstallPath, luaPath);

      const luarocksBinPath = platform === 'windows' ? luarocksPath : join(luarocksPath, 'bin');
      addPath(luarocksBinPath);

      let luarocksSystemPath = execSync('luarocks path --lr-bin', {encoding: 'utf-8'}).trim();
      addPath(luarocksSystemPath);

      let luarocksLuaPath = execSync('luarocks path --lr-path', {encoding: 'utf-8'}).trim();
      exportVariable('LUA_PATH', luarocksLuaPath);

      let luarocksLuaCPath = execSync('luarocks path --lr-cpath', {encoding: 'utf-8'}).trim();
      exportVariable('LUA_CPATH', luarocksLuaCPath);

      core.info(`Successfully setup Luarocks ${luarocksVersion}`);
    }
  } catch (e) {
    if (typeof e === 'string') {
      core.setFailed(e);
    } else if (e instanceof Error) {
      core.setFailed(e.message);
    }
  }
}
