# CS16-Client for Xash3D-FWGS

> Emscripten-compiled WebAssembly (WASM) binaries of the [CS16-Client](https://github.com/Velaron/cs16-client), targeting [Xash3D-FWGS](https://github.com/FWGS/xash3d-fwgs), with zero external dependencies.

## 🚀 Project Overview

This package provides **precompiled CS 1.6 binaries** compiled to **WASM** via **Emscripten**, specifically targeting the [Xash3D-FWGS](https://github.com/FWGS/xash3d-fwgs).

Designed for use with [Xash3D-FWGS Web ports](https://github.com/yohimik/webxash3d-fwgs), this SDK enables fully in-browser gameplay and mod support for classic Counter-Strike 1.6 and its based mods — without requiring any native libraries or installations.

---

## 🧱 Features

- ✅ **WASM only** (no native code)
- ✅ **Compatible with WebXash3D-FWGS**
- ✅ **Drop-in mod support**
- ✅ **Zero runtime dependencies**
- ✅ **Runs entirely in-browser**

---

## 🧩 Usage

To get started quickly, check out the [examples/](https://github.com/yohimik/webxash3d-fwgs/tree/main/packages/examples) folder for real-world usage with:

* WebRTC transport
* File system mount
* Minimal startup with in-memory assets
* Multiplayer setup demo

```typescript
import { Xash3D } from "xash3d-fwgs"
import clientUrl from "cs16-client/cl_dll/client_emscripten_wasm32.wasm"
import menuUrl from "cs16-client/cl_dll/menu_emscripten_wasm32.wasm"
import serverUrl from "cs16-client/dlls/cs_emscripten_wasm32.so"

const x = new Xash3D({
    canvas: document.getElementById('canvas'),
    args: ['-game', 'cstrike'],
    libraries: {
        menu: menuUrl,
        client: clientUrl,
        server: serverUrl
    }
})
await x.init()
x.main()
x.Cmd_ExecuteString('map de_dust2')
x.Cmd_ExecuteString('sv_cheats 1')
x.Cmd_ExecuteString('noclip')
x.Cmd_ExecuteString('kill')
x.quit()
```