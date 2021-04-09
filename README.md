# setup-lua

![build](https://github.com/luadevkit/setup-lua/workflows/build/badge.svg)

This action sets up a Lua environment by building a version of Lua and adding it PATH.

## Usage

See [action.yml](action.yml)

Install the default version of Lua (5.4) and LuaRocks (3.4.0).

```yaml
- uses: luadevkit/setup-lua
```

Install specific version of Lua and LuaRocks:

```yaml
- uses: luadevkit/setup-lua
  with:
    lua-version: '5.4'
    luarocks-version: '3.4.0'
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
