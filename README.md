# EaglerForgeInjector
An advanced modding API injector for unminified, unobfuscated, unsigned eaglercraft builds.
Current features:
- Method hooking/monkey patching
- Reflection
- Custom classes
- Modify the dedicated server

### How to use:
#### Online
Go to https://eaglerforge.github.io/EaglerForgeInjector/ and upload an unminified, unobfuscated, unsigned EaglercraftX offline download.

#### Portable Offline
Download this repository as a .zip, and extract it. Open index.html with your preferred browser (use `ctrl` + `O` on a new tab) and upload an unminified, unobfuscated, unsigned EaglercraftX offline download.

#### How does it work?
This tool matches patterns in eaglercraft builds and adds patching code to let you modify how the code works at runtime. It then adds a [corelib](./postinit.js) that initialises the `ModAPI` object.

#### History
EaglerForgeInjector is a replacement for the `ModAPI` in the [old eaglerforge](https://github.com/EaglerForge/EaglerForge-old), which was maintained by @radmanplays. The legacy eaglerforge was a port of [OtterDev's EaglerReborn (dmca'd)](https://github.com/EaglerReborn/reborn)'s `PluginAPI` (created by me, @ZXMushroom63) to run on newer versions of Eaglercraft, with a few improvements and new features. Unlike EaglerForgeInjector, both legacy eaglerforge and eaglerreborn manually exposed properties and methods one by one.

## Discord server
[https://discord.gg/rbxN7kby5W](https://discord.gg/rbxN7kby5W)
