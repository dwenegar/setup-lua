# setup-lua

![build](https://github.com/dwenegar/setup-lua/workflows/build/badge.svg)

This action sets up a Lua environment by building a version of Lua and adding it PATH.

## Usage

See [action.yml](action.yml)

Install the latest version of Lua (5.4.4)

```yaml
- uses: luadevkit/setup-lua
```

Install the latest version of Lua (5.4.4) and LuaRocks (3.9.1)

```yaml
- uses: luadevkit/setup-lua
  with:
    luarocks-version: latest
```

Install specific versions of Lua and LuaRocks:

```yaml
- uses: luadevkit/setup-lua
  with:
    lua-version: '5.4'
    luarocks-version: '3.9.1'
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
