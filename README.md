# WebXash

https://x8bitrain.github.io/webXash/

Play Half-Life 1 and Counter-Strike 1.6 in your browser with [Xash3d-FWGS-webassembly](https://github.com/yohimik/webxash3d-fwgs)!

![image](https://github.com/user-attachments/assets/46d9265a-8e1a-4f80-8419-f7b04aa7925b)


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
