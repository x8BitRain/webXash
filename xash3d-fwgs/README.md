# Xash3D-FWGS Emscripten TypeScript

[![Join our Discord](https://img.shields.io/discord/1397890383605927967?color=5865F2&label=Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/cRNGjWfTDd)

A powerful TypeScript wrapper and extension layer for the [Xash3D FWGS](https://github.com/FWGS/xash3d-fwgs) engine compiled with Emscripten. 
This project enables seamless integration of the engine into modern web and cross-platform environments with **zero dependencies**, **network protocol abstraction**, and **JavaScript bindings for direct engine console script execution**.

---

## 🚀 Features

- ✅ **TypeScript-first**: Strong typings and developer-friendly tooling.
- 🔌 **Zero Dependencies**: Lightweight and modular. No external runtime libraries required.
- 🌐 **Pluggable Network Layer**: Abstracted networking stack compatible with any protocol (WebSocket, WebRTC, custom).
- 🧱 **Emscripten Integration**: Wrapper for compiled Xash3D WASM build using Emscripten's `MODULARIZE` & `EXPORT_NAME`.
- 🔄 **Extended Engine APIs**: Optional patches and hooks to extend or override engine behavior from TypeScript.
- 🛠️ **Custom I/O Bindings**: Integrate with custom file systems or asset streams.
- 🧪 **Testing-Friendly**: Clean architecture with clear separation between engine, I/O, and network logic.

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

const x = new Xash3D({
    canvas: document.getElementById('canvas'),
    arguments: ['-game', 'cstrike'],
})
await x.init()
x.main()
x.Cmd_ExecuteString('map de_dust2')
x.Cmd_ExecuteString('sv_cheats 1')
x.Cmd_ExecuteString('noclip')
x.Cmd_ExecuteString('kill')
x.quit()
```

## 📦 SDKs

The following SDKs are available to run specific mods or games:

* [hlsdk-portable](https://www.npmjs.com/package/hlsdk-portable): Run Half-Life and compatible mods.
* [cs16-client](https://www.npmjs.com/package/cs16-client): Run Counter-Strike 1.6 and its based mods.

## 📝 Changelog

See [CHANGELOG.md](https://github.com/yohimik/webxash3d-fwgs/tree/main/packages/xash3d-fwgs/CHANGELOG.md) for a full list of updates and release history.