# EaglerForge ModAPI Documentation
The EaglerForge ModAPI is housed in a global JavaScript object stored on `globalThis`, called `ModAPI` or `PluginAPI`. (both are identical)

### Important Notice!
From people used to the doc prior to EaglerForgeInjector, now, when you see something like `ModAPI.world`'s type is `World`, that literally means it is identical to an instance of `net.minecraft.world.World` from java. For easier modding, here are some online javadocs, that explain properties from each individual method and proerty of every 1.8 class:

https://nurmarvin.github.io/Minecraft-1.8-JavaDocs/overview-summary.html - Javadoc for vanilla 1.8
https://eaglerreborn.github.io/javadoc/ - EaglerReborn (EF precursor) javadoc, for EaglercraftX u17 (missing serverside classes, this version didn't have singleplayer)
An up-to-date javadoc for EaglercraftX is coming soon, in the meanwhile, I recommend modding with a local EaglercraftX workspace, so you can inspect the contents of each class.

Additionally, when you se that something like `ModAPI.mcinstance` is `Raw<Minecraft>` this means that it has a lot of TeaVM nonsense like '$' prefixes before everything, as well has making it difficult to call the objects methods.

### Global ModAPI Object:

The global object has the following properties:
 - `ModAPI.player: EntityPlayerSP`
    - Only accessible after `ModAPI.require("player")` is called, this is the local player entity. It is regenerated every time the `update` event is called.
 - `ModAPI.world: WorldClient`
    - Only accessible after `ModAPI.require("world")` is called, this is the client-side world. It is regenerated every time the `update` event is called.
 - `ModAPI.network: NetHandlerPlayClient`
    - Only accessible after `ModAPI.require("network")` is called, this is the client's networking handler. It is regenerated every time the `update` event is called.
 - `ModAPI.settings: GameSettings`
    - This is the Minecraft client's settings. It is generated upon init.
 - `ModAPI.items: Map<String, Item>`
    - This is a key-value dictionary of all of the items in the game. It is generated upon init from the static variables of the `Items` class.
    - For example, to access the item class for `acacia_door`, you can use `ModAPI.items["acacia_door"]`
 - `ModAPI.blocks: Map<String, Block>`
    - This is a key-value dictionary of all of the blocks in the game. It is generated upon init from the static variables of the `Blocks` class.
    - For example, to access the block class for `bedrock`, you can use `ModAPI.blocks["bedrock"]`
 - `ModAPI.materials: Map<String, Material>`
    - This is a key-value dictionary of all of the blocks in the game. It is generated upon init from the static variables of the `Material` class.
    - For example, to access the material class for `portal`, you can use `ModAPI.materials["portal"]`
 - `ModAPI.enchantments: Map<String, Enchantment|Object>`
    - This is a key-value dictionary of all of the enchantments in the game. It is generated upon init from the static variables of the `Enchantment` class.
    - For example, to access the enchantment class for `knockback`, you can use `ModAPI.enchantments["knockback"]`
    - As the enchantment class has other static variables, `Object.keys` will also return non-enchantment keys such as `enchantmentsBookList`.
 - `ModAPI.minecraft: Minecraft`
    - This is the minecraft instance for the client, generated upon init.
    - It can also be accessed using `ModAPI.mc`
 - `ModAPI.mcinstance: Raw<Minecraft>`
    - This is the raw minecraft instance for the client, generated upon init.
    - It can also be accessed using `ModAPI.javaClient`
    - It can also be accessed using `ModAPI.minecraft.getRef()`
    - It can also be accessed using `Minecraft`
      - Only here for compatibility
 - `ModAPI.server: MinecraftServer`
    - This is the dedicated minecraft server in the service worker, generated when the `serverstart`.
    - It can only be accessed in the dedicated server's context. (See `ModAPI.dedicatedServer`)
    - It can also be accessed using `ModAPI.serverInstance`
 - `ModAPI.rawServer: MinecraftServer`
    - This is the dedicated minecraft server in the service worker, generated when the `serverstart` event is fired.
    - It can only be accessed in the dedicated server's context. (See `ModAPI.dedicatedServer`)
    - It can also be accessed using `ModAPI.server.getRef()`
 - `ModAPI.hooks`
    - This is the internal hooking map for ModAPI and can be used to patch, intercept, or rewrite internal functions, and more.
    - More: [HooksDocumentation](hooks.md)
 - `ModAPI.util`
    - This contains utilities for using `ModAPI.hooks`, `ModAPI.reflect`, and more.
    - More: [UtilDocumentation](utils.md)
 - `ModAPI.reflect`
    - This is a wrapper around `ModAPI.hooks`, `ModAPI.hooks._teavm` and `ModAPI.hooks._classMap` that makes accessing and using internal java classes in mods much easier.
    - More: [ReflectDocumentation](reflect.md)
 - `ModAPI.dedicatedServer`
    - This object is used to push code for use in the dedicated server.
    - Once the dedicated server worker has started, it is unuseable.
    - More: [DedicatedServerDocumentation](dedicatedserver.md)
- `ModAPI.meta`
    - This object is used to register metadata for mods such as their title, credits, icon and description.
    - More: [MetaDocumentation](meta.md)
- `ModAPI.array`
    - This object is used to interact and create arrays easily.
    - More: [ArrayDocumentation](array.md)
- `ModAPI.resolution`
    - This object is used to query information about GUI dimensions, to make drawing to the screen easier, generated when the `frame` event is fired.
    - Deprecated alias (please do not use): `ModAPI.ScaledResolution`
    - More: [ArrayDocumentation](array.md)
 - `ModAPI.version: String`
    - The version of ModAPI.
 - `ModAPI.flavour: String`
    - The flavour of ModAPI. Hardcoded to be `"injector"`.

The ModAPI object has the following methods:
 - `addEventListener(eventName: String, callback: Function) : void`
    - More: [EventDocumentation](events.md)
 - `require(componentName: String) : void`
    - Import required modules, such as `player` and `network`.
    - Usage: `ModAPI.require("module")`
 - `displayToChat(message: String) : void`
    - Displays client-side message to user's ingame chat gui.
    - Usage: `ModAPI.displayToChat("Hello World.")`
 - `clickMouse() : void`
    - Triggers a left click ingame.
 - `rightClickMouse() : void`
    - Triggers a right click ingame.
 - `getFPS() : int`
    - Gets the frames per second of the game


## Handling strings, numbers and booleans to and from java.
Java strings and JavaScript strings are not the same. Calling a method like this: `ModAPI.player.sendChatMessage("hello world")`, will not work, as you are running a Java method with a JavaScript string. To convert a JS string to a Java string, use `ModAPI.util.str(yourString)`. For example, the correct version of the above example is `ModAPI.player.sendChatMessage(ModAPI.util.str("hello world"))`. This problem is automatically mitigated on a few functions, namely `ModAPI.displayToChat()`.


---
Java numbers and JavaScript numbers are stored the same way, with no problems with having to cast, like with strings. This is why you can simply do something like `ModAPI.player.motionY = 99999`, without having to do any conversion.


---
Booleans in Java are stored as a number, where `1` means `true` and `0` means `false`. There are no functions for converting inbetween these, because it is very easy to do so (unlike strings). To convert a javascript boolean into a java boolean simply multiply you boolean by 1.

Eg:
```javascript
var myBool = true;
console.log(myBool * 1);
// logs '1'

var myBool = false;
console.log(myBool * 1);
// logs '0'
```

Better yet, if you need to use booleans very often, just store them as numbers directly in javascript. JavaScript if statements already recognise `0` as false, so something like:
```javascript
var condition = 0;
if (condition) {
   console.log("yes");
} else {
   console.log("no");
}
// outputs 'no'
```
will work out of the box.

## Accessing raw data
In ModAPI's architecture, when you request an object like `ModAPI.player`, instead of giving you `ModAPI.mcinstance.$thePlayer`, it will return a `TeaVM_to_Recursive_BaseData_ProxyConf` proxy. These automatically remove the `$` prefixes, make instance methods run with the actaul object, and a variety other features.

However, when calling methods via `ModAPI.hooks`, `ModAPI.reflect`, or even just running a method that takes in object arguments on something like `ModAPI.player`, passing in these ModAPI proxies will cause an error.

To pass in raw java data simply call `getRef()` on the proxy which will return the raw, unmodified version of it.

For example, take the method `setRenderViewEntity()` on `ModAPI.mcinstance`. Instead of passing an entity from `ModAPI.world.loadedEntityList.get(index)` directly, you need to use `ModAPI.world.loadedEntityList.get(index).getRef()`. Demo code:
```javascript
var entityIndex = 1; //Index of the entity to look for. 0 means first, which is usually the player, so 1 is usually a natural entity.
ModAPI.mc.setRenderViewEntity(ModAPI.world.loadedEntityList.get(entityIndex).getRef());
```