import * as core from '@actions/core';
import {getInputs} from './input-helper';
import {installLua, installLuarocks} from './installer';

import {join} from 'path';
import {execSync} from 'child_process';

import * as sys from './system';

export async function setupLua() {
  try {
    const inputs = getInputs();

    const installPrefix = join(process.cwd(), '.install');
    const luaInstallPath = join(installPrefix);
    const luarocksInstallPath = join(installPrefix, 'luarocks');

    const luaVersion = inputs.luaVersion;
    core.info(`Setup Lua version ${luaVersion}`);

    const luaPath = await installLua(luaVersion, luaInstallPath);
    const luaBinPath = join(luaPath, 'bin');
    core.addPath(luaBinPath);
    core.info(`Added ${luaBinPath} to the path`);

    const luarocksVersion = inputs.luarocksVersion;
    if (luarocksVersion) {
      core.info(`Setup Luarocks version ${luarocksVersion}`);
      const luarocksPath = await installLuarocks(luarocksVersion, luarocksInstallPath, luaPath);

      const platform = sys.getPlatform();
      const luarocksBinPath = platform === 'windows' ? luarocksPath : join(luarocksPath, 'bin');
      core.addPath(luarocksBinPath);
      core.info(`Added ${luarocksBinPath} to the path`);

      let luarocksSystemPath = execSync('luarocks path --lr-bin', {encoding: 'utf-8'}).trim();
      core.addPath(luarocksSystemPath);
      core.info(`Added ${luarocksSystemPath} to the path`);

      let luarocksLuaPath = execSync('luarocks path --lr-path', {encoding: 'utf-8'}).trim();
      core.exportVariable('LUA_PATH', ';;' + luarocksLuaPath);
      core.info(`Set LUA_PATH to ${luarocksLuaPath}`);

      let luarocksLuaCPath = execSync('luarocks path --lr-cpath', {encoding: 'utf-8'}).trim();
      core.exportVariable('LUA_CPATH', ';;' + luarocksLuaCPath);
      core.info(`Set LUA_CPATH to ${luarocksLuaCPath}`);

      core.info(`Successfully setup Luarocks ${luarocksVersion}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
