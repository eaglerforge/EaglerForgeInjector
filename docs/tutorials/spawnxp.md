## /spawnxp command
This tutorial will cover spawning in entities using the [`ModAPI.promisify()`](../apidoc/promisify.md) API.

As usual, we'll start with the boilerplate:
```javascript
(function SpawnXPMod() {
    ModAPI.meta.title("Spawn XP");
    ModAPI.meta.description("Adds a /spawnxp command.");
    ModAPI.meta.credits("By <author_name>");

    //future code
})();
```
We'll move context to the server, and add a command listener, and ensure the sender is a player:
```javascript
PluginAPI.dedicatedServer.appendCode(function () { //Run this code on the server
    PluginAPI.addEventListener("processcommand", (event) => { //Command processing event
        if (
            !ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP")
                .instanceOf(event.sender.getRef())
        ) {
            return;
        }
    });
});
```

Next, we'll check that the command is /spawnxp. If it is, we'll get the current dimension of the player, and spawn an XP orb at the sender's position. To construct the XP orb, we'll get the `EntityXPOrb` class and get the [first constructor](https://nurmarvin.github.io/Minecraft-1.8-JavaDocs/net/minecraft/entity/EntityXPOrb.html)
```javascript
PluginAPI.dedicatedServer.appendCode(function () { //Run this code on the server
    PluginAPI.addEventListener("processcommand", (event) => { //Command processing event
        if (
            !ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP") //If it isn't a player, exit the method
                .instanceOf(event.sender.getRef())
        ) {
            return;
        }

        if (event.command.toLowerCase().startWith("/spawnxp")) {
            const world = event.sender.getServerForPlayer(); //get the current dimension
            const senderPos = event.sender.getPosition(); //get the player's current position

            const EntityXP = ModAPI.reflect.getClassByName("EntityXPOrb"); // Get the entity xp orb class
            
            const xporb = EntityXP.constructors[0](world.getRef(), senderPos.getX(), senderPos.getY(), senderPos.getZ(), 10); //Construct the first constructor, with arguments, World, x, y, z, xp value

            //Get the spawn entity in world method
            var spawnEntityInWorldMethod = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.world.World", "spawnEntityInWorld")];
            //Because this method reads and writes data to chunks, it tries to save and load the eaglercraft state, which won't work if eaglercraft is also running its own code.
            //To work around this issue, use ModAPI.promisify() to convert the method into one that returns a promise
            spawnEntityInWorldMethod = ModAPI.promisify(spawnEntityInWorldMethod);

            //we can now use the spawnEntityInWorld method
            //wherever you see getRef(), it means to retrieve the raw, untouched data that TeaVM can use.
            spawnEntityInWorldMethod(world.getRef(), xporb).then(result => {
                // Get the chat component class
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");

                // Construct the chat component and send it to the client.
                event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("An xp orb has been spawned!")));
            });

            //Stop the unknown command error
            event.preventDefault = true;
        }
    });
});