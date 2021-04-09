import * as core from '@actions/core';
import {getInput} from '@actions/core';
import {InputNames} from './constants';
import {Inputs} from './inputs';

const VALID_LUA_VERSIONS: string[] = [
  '5.1.4',
  '5.1.5',
  '5.2.0',
  '5.2.1',
  '5.2.2',
  '5.2.3',
  '5.2.4',
  '5.3.0',
  '5.3.1',
  '5.3.2',
  '5.3.3',
  '5.3.4',
  '5.3.5',
  '5.3.6',
  '5.4.0',
  '5.4.1',
  '5.4.2',
  '5.4.3'
];

const LUA_VERSION_ALIASES: {[index: string]: string} = {
  '5.1': '5.1.4',
  '5.2': '5.2.4',
  '5.3': '5.3.6',
  '5.4': '5.4.3',
  latest: '5.4.3'
};

const VALID_LUAROCK_VERSIONS: string[] = ['3.4.0', '3.5.0', '3.6.0'];

const LUAROCKS_VERSION_ALIASES: {[index: string]: string} = {
  '3.4': '3.4.0',
  '3.5': '3.5.0',
  '3.6': '3.6.0',
  latest: '3.6.0'
};

export function getInputs(): Inputs {
  const luaVersion = getInput(InputNames.LuaVersion, {required: true});
  const luarocksVersion = getInput(InputNames.LuarocksVersion, {required: false});
  const repoToken = getInput(InputNames.RepoToken, {required: true});

  let resolvedLuaVersion = luaVersion;
  if (LUA_VERSION_ALIASES[luaVersion]) {
    resolvedLuaVersion = LUA_VERSION_ALIASES[luaVersion];
  }

  if (!VALID_LUA_VERSIONS.includes(resolvedLuaVersion)) {
    core.setFailed(`Invalid lua version: ${luaVersion}`);
  }

  let resolvedLuarocksVersion = luarocksVersion;
  if (luarocksVersion) {
    if (LUAROCKS_VERSION_ALIASES[luarocksVersion]) {
      resolvedLuarocksVersion = LUAROCKS_VERSION_ALIASES[luarocksVersion];
    }

    if (!VALID_LUAROCK_VERSIONS.includes(resolvedLuarocksVersion)) {
      core.setFailed(`Invalid luarock version: ${luarocksVersion}`);
    }
  }

  return {
    luaVersion: resolvedLuaVersion,
    luarocksVersion: resolvedLuarocksVersion,
    repoToken: repoToken
  };
}
