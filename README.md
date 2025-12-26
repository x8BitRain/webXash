# WebXash

https://x8bitrain.github.io/webXash/

Play Half-Life 1 and Counter-Strike 1.6 in your browser with [Xash3d-FWGS-webassembly](https://github.com/yohimik/webxash3d-fwgs)!

![image](https://github.com/user-attachments/assets/46d9265a-8e1a-4f80-8419-f7b04aa7925b)

Please read the [FAQs](https://github.com/x8BitRain/webXash/blob/main/README.md#faqs) before you start!

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

After selecting the folder you'll see a list of game directories to choose from, this basically sets the launch argument `-game bshift`, for example. You can use the `-game` launch arg in the settings box to override this behavior.

Selecting this folder will persist across visits if you allow permission for the site to access the files. WebXash does not write anything to the selected filesystem folder, it only reads game files and transfers them into a WASM filesystem that lives in memory in the browser during the play session.

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

## Save manager

The save manager captures saves when they're made in-game and stores them in indexedDB, then categorizes them by the game/mod name it was created under.

Saves added via the save button will be categorized under `xash-custom-saves`.

When you launch a game, the saves under the matching game/mod name will be transferred into the game for you to load. Saves under `xash-custom-saves` will also be transferred into any game/mod launched.

The download button will save the selected save to your local FS.

### Using saves with zipped games.

If you launch a zipped folder of HL1 or play any of the zipped demos, the save system still works, if you use, for example, `-game bshift` in the launch arguments, that will tell the save system to capture saves from the corresponding game name, so it would be `bshift/save`.

## Other stuff

- Writing `quit` or `exit` in the console _should_ reload the page. If it doesn't, refresh manually.
- Pressing Ctrl+W (crouch jumping) tries to close the page on most browsers, the only thing possible to prevent the tab from closing is to show a warning message where you can cancel the close. I recommend playing with fullscreen enabled because as Ctrl+W does not close the tab in fullscreen. 
- Save manager is disabled when CS 1.6 is selected.

## FAQs

#### Why doesn't multiplayer work?

If you want to play multiplayer you should use this version of [Half-Life: Deathmatch on dos.zone](https://dos.zone/hldm/) or look into using https://github.com/yohimik/goxash3d-fwgs. The WASM client needs to proxy its network requests via a websocket in order to do online multiplayer.

#### Why doesn't my mod work?

If Xash3d doesn't explicitly support it then it probably won't work, you can see their incompatibility list here: https://github.com/FWGS/xash3d-fwgs/blob/master/Documentation/not-supported-mod-list-and-reasons-why.md

#### Why doesn't it work on mobile?

You'd be better off downloading the xash3D [mobile ports](https://github.com/FWGS/xash3d/releases) rather than using this. You need a keyboard and mouse attached to play this xash port properly.

#### There is a bug in this game port, do I submit a bug report here?

Nope, I'm not the maintainer of this port, I just wrote a frontend for it, please submit issues to the engine port repo instead: https://github.com/yohimik/webxash3d-fwgs

## Building/developing
Clone the repo:

```bash
git clone https://github.com/x8BitRain/webXash.git

cd webXash

./setup-xash.sh

npm run dev
```
