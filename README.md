# WebXash

https://x8bitrain.github.io/webXash/

Play Half-Life 1 and Counter-Strike 1.6 in your browser with [Xash3d-FWGS-webassembly](https://github.com/yohimik/webxash3d-fwgs)!

![image](https://github.com/user-attachments/assets/46d9265a-8e1a-4f80-8419-f7b04aa7925b)

Please read the [FAQs](https://github.com/x8BitRain/webXash/blob/main/README.md#faqs) before you start!

## How to use

There are three ways to get a game running. Pick whichever fits you:

| | What you need | How to start |
|---|---|---|
| [Bundled demos](#the-bundled-demos) | Nothing | `HALF-LIFE DEMOS` → pick a demo → `Start Demo` |
| [Your own game files](#using-your-own-game-files) | A Half-Life / Counter-Strike install | `OPEN FOLDER` → pick the root folder → `Start Game` |
| [A zip of your game files](#loading-from-a-zip-file) | A zipped copy of your game folder | `OPEN ZIP` → pick the zip → the game launches |

### The bundled demos

Three demos are downloaded on demand, so you can play without owning anything:

| Demo | Size | Contents |
|---|---|---|
| HLDM | 85 MB | Half-Life Deathmatch — the `crossfire` map |
| Uplink | 45 MB | Half-Life: Uplink — `hldemo1` |
| Day One | 78 MB | Half-Life: Day One — the `c0a0` campaign map |

Select `HALF-LIFE` in the `GAMES` window, pick a demo in the `HALF-LIFE DEMOS` window and press `Start Demo`. The demo is fetched, unpacked into the in-browser filesystem and started on its own map — the engine's default map does not exist in these packages, so the demo declares which one to load.

`HLDM` is a deathmatch map, so it gets a `BOTS` field next to the demo list; see [Bots](#bots) below. The other two demos are single player and do not show it. The `VOLUME` field is always there; see [Volume](#volume).

#### The trimmed demo packages

The demo packages upstream are cut down to a minimum, and the cut is not consistent: they reference sounds, weapon models and sprites that they do not ship. The engine reports every one of those as `Error: Could not load sound/model ...` on startup, and the packages also carry a `config.cfg` and a `valve.rc` that were written for Counter-Strike, which the engine answers with `Warning: Unknown command ...`.

This fork repairs both without touching the demo packages themselves:

- Each demo has a small companion archive next to it (`hldm-assets.zip`, `uplink-assets.zip`, `dayone-assets.zip`) holding the files that package references but does not ship, copied from the sibling demo packages that still have them. WebXash unpacks it into the filesystem after the demo itself, so the engine finds them.
- The config files are cleaned up before the game starts: lines with commands this build does not know are dropped, and the missing localization tables are created, so the engine stops complaining about them.

Two messages are left alone, because they are not caused by a missing file: the WebGL renderer's `GL_INVALID_ENUM while uploading *default [2D]`, and Day One's `Couldn't open save data file save/c0a0a.HL1`, which is the engine looking for an autosave that does not exist yet on a first run.

### Using your own game files

You must provide your own game files (e.g., from Steam):

```shell
steamcmd +force_install_dir ./hl +login your_steam_username +app_update 70 validate +quit
```

Or from your `valve` or `cstrike` folders located in your steamapps directory.

#### Loading from a folder

Click the `Open game Folder` button and select your Half-Life or Counter-Strike ROOT folder. The folder must contain a `valve` and/or `cstrike` directory, for example:

```shell
/Half-Life 1
├──┬/valve
│  ├───/file1
│  └───/file2...
└──┬/cstrike
   ├───/file1
   └───/file2...
```

After selecting the folder you'll see a list of game directories to choose from. This sets the launch argument `-game bshift`, for example. You can use the `-game` launch arg in the `LAUNCH OPTIONS` window to override this behavior.

Selecting this folder will persist across visits if you allow permission for the site to access the files. WebXash does not write anything to the selected filesystem folder, it only reads game files and transfers them into a WASM filesystem that lives in memory in the browser during the play session.

#### Loading from a zip file

Zip the `valve` and/or `cstrike` folder from your Half-Life installation. The zip must contain those directories at its root, not the files directly:

```shell
/half-life.zip
├──┬/valve
│  ├───/file1
│  └───/file2...
└──┬/cstrike
   ├───/file1
   └───/file2...
```

Click `Open ZIP` and pick that file. The game launches as soon as the zip has been selected.

### Running Mods

If you are running a Half-Life mod or expansion like Opposing Force, the `valve` folder should always be present in the folder you select; the mod or expansion should sit next to your `valve` folder in the folder you select, or be compressed into a zip. For example:

```shell
/Half-Life Blue Shift
├──┬/valve
│  ├───/file1
│  └───/file2...
└──┬/bshift
   ├───/file1
   └───/file2...
```

Before you select the folder you need to specify which game folder to launch using the `LAUNCH OPTIONS` window. In this example, I would run Blue Shift with `-game bshift`.

## Settings

The `LAUNCH OPTIONS` window takes the options that are passed to the engine on startup:

| Option | Effect |
|---|---|
| `Fullscreen` | Start in fullscreen instead of windowed |
| `sv_cheats 1` | Enable `god`, `noclip`, `impulse` and the other cheat commands |
| `Console` | Open the engine console |
| text field | Raw engine command line arguments, e.g. `-game bshift` or `+map crossfire` |

Anything you type in the text field is appended after the arguments WebXash generates, so you can always override them — a `+map` of your own wins over the demo's map.

### Bots

The `BOTS` field in the `HALF-LIFE DEMOS` window sets how many bots are added to the local server. Set it to `0` to play alone, or raise it for a busier deathmatch. The value is remembered between visits and applies to the demos that support bots.

Bots are added by the game library itself, which means two things have to happen first: the local server has to be a real multiplayer server with free player slots, and the bot commands only exist once that server is up. WebXash therefore raises `maxplayers` before the map is loaded and adds the bots once the server reports that it has started.

### Volume

The `VOLUME` field sets the engine's master sound volume, in percent. It is passed to the engine as `+volume` on startup, so it takes effect before the engine opens its audio device, and it is remembered between visits.

The upstream port hardcoded `+volume 0.05`, which is 5% — inaudible in practice. That default is gone, the field above replaces it.

> **Known issue:** with the current engine build the Web Audio output is silent no matter what the volume is. The engine opens its audio device through SDL and the browser's audio callback only ever receives zeroes, so no sample reaches the speakers. That happens inside the compiled WebAssembly engine, not in WebXash, and there is no setting that works around it. The `VOLUME` field is still there for engine builds that do produce sound.

## Multiplayer

### The `mp` library is not missing

The engine loads a library called `mp` at startup — in Half-Life and Counter-Strike that is the multiplayer/game library, `mp.dll` — and it does so through the same path as every other game library: `dlls/mp_emscripten_wasm32.wasm`. The port has to hand it *something*: if that request is left unanswered the engine aborts and the game never starts.

What the port supplies is the open-source replacement for Valve's `mp.dll`, [ReGameDLL_CS](https://github.com/rehlds/ReGameDLL_CS) (MIT), compiled to WebAssembly. That build is what ships as `cs16-client/dlls/cs_emscripten_wasm32.wasm` and what the `dlls/mp_emscripten_wasm32.wasm` request is answered with. Valve's own `mp.dll` is closed source and was never released, so it cannot be compiled for the browser — but the library the engine needs is present.

### Why the in-game multiplayer menu still does not work

The reason is the network transport, not a missing library. The engine's network layer is UDP (`net_chan.c`, `net_ws.c`, `sv_client.c`), and a browser has no UDP sockets. The port therefore replaces that layer with a WebRTC transport: a websocket server does the signalling and the game traffic is carried over an RTCDataChannel. That transport only exists when you hand the port a server address, which is what the `MULTIPLAYER IP` field is for. The in-game `MULTIPLAYER` menu speaks the engine's own protocol and has no way to be pointed at the signalling server, so it cannot use it.

The two ways that do work:

### Bots (local deathmatch)

Use the `BOTS` field described above. This runs a local deathmatch server with bots on the map.

### A websocket server (LAN and internet)

For real multiplayer you need one of the following servers, running in docker containers from [webxash3d-fwgs](https://github.com/yohimik/webxash3d-fwgs):

- For HL1DM use [hl-web-server](https://github.com/yohimik/webxash3d-fwgs/tree/main/docker/hl-web-server)
- For CS 1.6 use [cs-web-server](https://github.com/yohimik/webxash3d-fwgs/tree/main/docker/cs-web-server)

These servers work over the internet and over LAN.

Once you have set up the server you can enter the server's <ins>***websocket***</ins> IP and port into the `MULTIPLAYER IP` input.

The server's websocket address will be `<ip>:27016` by default.

## Save manager

The save manager captures saves when they're made in-game and stores them in IndexedDB, then categorizes them by the game/mod name it was created under.

Saves added via the add button will be categorized under `xash-custom-saves`.

When you launch a game, the saves under the matching game/mod name will be transferred into the game for you to load. Saves under `xash-custom-saves` will also be transferred into any game/mod launched.

The download button will save the selected save to your local FS.

### Using saves with zipped games

If you launch a zipped folder of HL1 or play any of the zipped demos, the save system still works. If you use, for example, `-game bshift` in the launch arguments, that will tell the save system to capture saves under the corresponding game name, so it would be `bshift/save`.

A demo and your own copy of the same game share one save list, so a save you make while playing the HLDM demo is there when you start Half-Life from your own installation.

### Saving needs a single player server

The engine refuses to save while the local server has more than one player slot, and it says so in the console:

```
Can't save multiplayer games.
```

That is the engine's rule, not a limitation of the save manager: the demo and your own game files are always served by a local server, and the `BOTS` field raises the player slot count to make room for them. Set `BOTS` to `0` and the server has a single slot again, and saving works — the save is written by the game, picked up by the save manager and put into IndexedDB, and handed back to the game the next time you start it.

## Other stuff

- Writing `quit` or `exit` in the console _should_ reload the page. If it doesn't, refresh manually.
- Pressing Ctrl+W (crouch jumping) tries to close the page on most browsers; the only thing possible to prevent the tab from closing is to show a warning message where you can cancel the close. I recommend playing with fullscreen enabled because Ctrl+W does not close the tab in fullscreen.
- Save manager is disabled when CS 1.6 is selected.

## FAQs

#### Why doesn't multiplayer internet server discovery work?

If you want to play multiplayer over the internet like on Steam you should use this version of [Half-Life: Deathmatch on dos.zone](https://dos.zone/hldm/) for now as it's the closest thing to it. Currently you need to provide the IP address directly.

#### Why is "New game" greyed out in the Counter-Strike menu?

Counter-Strike 1.6 is a multiplayer only game, and it says so in its `gameinfo.txt`:

```
"type" "multiplayer_only"
```

The engine reads that and tells the menu library which game mode it is, and the menu greys out the single player entries — `New game`, `Load game` and `Hazard course`. That is what Counter-Strike does on the desktop as well. In the Half-Life menu all of them are available.

#### Why is the Counter-Strike team/character menu missing, and why is the server message of the day shown as HTML source?

Both are the same thing: the Counter-Strike client draws those windows with VGUI, and there is no VGUI support library for the browser.

The engine loads a library called `vgui_support` for that, and the web port has none — the port hands the engine the menu library in its place, which is enough for the menu itself (it brings its own VGUI implementation) but not for the panels the Counter-Strike client creates. The result is a team selection window that never appears — so the player stays a spectator — and HTML that is printed instead of rendered.

Fixing it needs a `vgui_support` build for WebAssembly. The engine has the sources for it and the `internal_vgui_support` option in `gameinfo.txt` exists for games that bring their own UI, but the Counter-Strike client does not, and no published engine package ships such a build. The [reverse engineered Counter-Strike client](https://github.com/Velaron/cs16-client) is the closest thing to a source for it, but it is only built for native platforms at the moment.

#### Why are there no bots in the demos?

The demos are shipped without the `mp` multiplayer client library, so nothing sets up a multiplayer server for you. WebXash does that for the deathmatch demo: it raises `maxplayers` and adds the bots once the server is up. If you are running your own copy of Half-Life and want bots, use the `BOTS` field or start a LAN game on a server that has them.

#### Why is there no sound?

With the current engine build the audio output is silent. The engine opens its audio device through SDL, and the browser's audio callback keeps getting called — hundreds of times per second — but every sample in it is zero. The game is running, the sound files are present and the volume is not the cause: it makes no difference whether the engine is started with `+volume 0.05` or `+volume 1.0`, and neither the browser's autoplay policy nor the `snd_mute_losefocus` cvar changes it. The break is inside the compiled WebAssembly engine, so it cannot be fixed from this front-end.

What this fork does fix is the other half of the problem: the demo packages were missing sound, model and sprite files that the game asks for, so the engine logged an error for each one. Those are restored now — see [The trimmed demo packages](#the-trimmed-demo-packages).

#### Why doesn't my mod work?

If Xash3d doesn't explicitly support it then it probably won't work, you can see their incompatibility list here: https://github.com/FWGS/xash3d-fwgs/blob/master/Documentation/not-supported-mod-list-and-reasons-why.md

#### Why doesn't it work on mobile?

You'd be better off downloading the xash3D [mobile ports](https://github.com/FWGS/xash3d-fwgs/releases) rather than using this. You need a keyboard and mouse attached to play this xash port properly.

#### There is a bug in this game port, do I submit a bug report here?

Nope, I'm not the maintainer of this port, I just wrote a frontend for it, please submit issues to the engine port repo instead: https://github.com/yohimik/webxash3d-fwgs

## Building/developing

Clone the repo:

```bash
git clone https://github.com/x8BitRain/webXash.git

cd webXash

npm install

./setup-xash.sh

npm run dev
```

`setup-xash.sh` copies the engine, game and demo assets out of `node_modules` into `public/`, where the app expects to find them. Run it again whenever those packages change.

Other scripts:

```bash
npm run dev      # dev server
npm run build    # type check and build into dist/
npm run preview  # serve the production build
npm run deploy   # build and publish to GitHub Pages
```
