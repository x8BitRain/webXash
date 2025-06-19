# WebXash

https://x8bitrain.github.io/webXash/

Play Half-Life 1 and Counter-Strike 1.6 in your browser with [Xash3d-FWGS-webassembly](https://github.com/yohimik/webxash3d-fwgs)!

![image](https://github.com/user-attachments/assets/46d9265a-8e1a-4f80-8419-f7b04aa7925b)

Please read the FAQs before you start!

## How to use

You must provide your own game files (e.g., from Steam):

```shell
steamcmd +force_install_dir ./hl +login your_steam_username +app_update 70 validate +quit
```

Or from your `valve` or `cstrike` folders located in your steamapps directory.

### Loading from a folder

Click the `Open game folder` button and select your Half-Life or Counter-Strike ROOT folder, the folder should always contain a `valve` and or `cstrike` directory, for example:

```shell
/Half-Life 1
├──┬/valve                  
│  ├───/file1           
│  └───/file2...  
└──┬/cstrike                  
   ├───/file1           
   └───/file2...  
```

The game should load immediately after allowing access to read the folder.

### Loading from Zip files

Zip and and copy the `valve` folder from your Half-Life installation into the `public/valve.zip`.
Note: zip contents should be like this:
```shell
/valve.zip
├──┬/valve                  
│  ├───/file1           
│  └───/file2...  
└──┬/cstrike                  
   ├───/file1           
   └───/file2...  
```

The click `open zip` to select this zip, if done correctly the game will launch as soon as you've selected the zip.

### Running Mods

If you are running a Half-Life mod or expansion like Opposing Force, the `valve` folder should always be present in the folder you select, the mod or expandion should be next to your `valve` folder in the folder you select or compress into a zip. For example:

```shell
/Half-Life Blue Shift
├──┬/valve                  
│  ├───/file1           
│  └───/file2...  
└──┬/bshift                  
   ├───/file1           
   └───/file2...  
```

Before you select the folder you need to specify which game folder to launch using the `LAUNCH OPTIONS` window, in this example, I would run Blue Shift with `-game bshift`

## FAQs

#### Why doesn't multiplayer work?

If you want to play multiplayer you should use this version of [Half-Life: Deathmatch on dos.zone](https://dos.zone/hldm/). The WASM client needs to proxy its network requests via a websocket in order to do online multiplayer, afaik [Xash3d-FWGS-webassembly](https://github.com/yohimik/webxash3d-fwgs) does not have this ability yet.

#### Why doesn't my mod work?

If Xash3d doesn't explicitly support it then it probaly won't work, you can see their incompatability list here: https://github.com/FWGS/xash3d-fwgs/blob/master/Documentation/not-supported-mod-list-and-reasons-why.md

#### Why doesn't it work on mobile?

You'd be better off downloading the xash3D [mobile ports](https://github.com/FWGS/xash3d/releases) rather than using this.

#### There is a bug in this game port, do I submit a bug report here?

Nope, I'm not the maintainer of this port, I just wrote a frontend for it, please submit issues to the engine port repo instead: https://github.com/yohimik/webxash3d-fwgs

## Building/developing
Clone the repo:

```bash
git clone --recurse-submodules https://github.com/x8BitRain/webXash.git
cd webXash
```

Build and extract the wasm files from webxash3d-fwgs (this takes a while).

```bash
./build-xash.sh
```

Start or build the frontend (I use bun here, but npm also works).

```bash
bun install
bun dev
bun build
```
