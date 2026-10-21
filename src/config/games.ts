const zipList = [
  {
    name: "HLDM (85M)",
    packageName: "hldm.zip",
    // The engine defaults to c0a0.bsp for the "valve" game, which this demo
    // does not ship. Deathmatch's own map has to be requested explicitly.
    map: "crossfire",
    // This is a deathmatch map, so it needs opponents. The multiplayer menu
    // that normally offers "LAN Game" with bots lives in a separate library
    // that has no WebAssembly build, so the demo would otherwise start as a
    // one-player server on a single-player game mode.
    bots: 3,
  },
  {
    name: "Uplink (45M)",
    packageName: "uplink.zip",
    // Same as above: the demo ships hldemo1-3 instead of the campaign maps.
    map: "hldemo1",
  },
  {
    name: "Day One (78M)",
    packageName: "dayone.zip",
    // This demo does ship the campaign maps, so the engine default works.
    map: "c0a0",
  },
];

export default zipList;
