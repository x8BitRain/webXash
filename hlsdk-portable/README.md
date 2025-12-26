# HLSDK-Portable for Xash3D-FWGS

> Emscripten-compiled WebAssembly (WASM) binaries of the [Half-Life SDK Portable](https://github.com/FWGS/hlsdk-portable), targeting [Xash3D-FWGS](https://github.com/FWGS/xash3d-fwgs), with zero external dependencies.

[![Join our Discord](https://img.shields.io/discord/1397890383605927967?color=5865F2&label=Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/cRNGjWfTDd)

## 🚀 Project Overview

This package provides **precompiled HLSDK binaries** compiled to **WASM** via **Emscripten**, specifically targeting the [Xash3D-FWGS](https://github.com/FWGS/xash3d-fwgs).

Designed for use with [Xash3D-FWGS Web ports](https://github.com/yohimik/webxash3d-fwgs), this SDK enables fully in-browser gameplay and mod support for classic Half-Life and its based mods — without requiring any native libraries or installations.

---

## 🧱 Features

- ✅ **WASM only** (no native code)
- ✅ **Compatible with WebXash3D-FWGS**
- ✅ **Drop-in mod support**
- ✅ **Zero runtime dependencies**
- ✅ **Runs entirely in-browser**

---

## 🌐 Discord Community

Need help? Want to share your project or ideas?
**[Join our Discord community](https://discord.gg/cRNGjWfTDd)** to connect with others!

---

## 🧩 Usage

To get started quickly, check out the [examples/](https://github.com/yohimik/webxash3d-fwgs/tree/main/packages/examples) folder for real-world usage with:

* WebRTC transport
* File system mount
* Minimal startup with in-memory assets
* Multiplayer setup demo

```typescript
import { Xash3D } from "xash3d-fwgs"
import clientUrl from "hlsdk-portable/cl_dll/client_emscripten_wasm32.wasm"
import serverUrl from "hlsdk-portable/dlls/hl_emscripten_wasm32.so"

const x = new Xash3D({
    canvas: document.getElementById('canvas'),
    libraries: {
        client: clientUrl,
        server: serverUrl
    }
})
await x.init()
x.main()
x.Cmd_ExecuteString('map crossfire')
x.Cmd_ExecuteString('sv_cheats 1')
x.Cmd_ExecuteString('noclip')
x.Cmd_ExecuteString('kill')
x.quit()
```

## 📝 Changelog

See [CHANGELOG.md](https://github.com/yohimik/webxash3d-fwgs/tree/main/packages/hlsdk-portable/CHANGELOG.md) for a full list of updates and release history.