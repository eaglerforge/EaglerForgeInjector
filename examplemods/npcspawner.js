(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return; }

            if (event.command.toLowerCase().startsWith("/spawnnpc")) {
                if (!globalThis.AsyncSink) {
                    return alert("NPC Spawner relies on the AsyncSink library.");
                }
                const world = event.sender.getServerForPlayer();
                const senderPos = event.sender.getPosition();

                // Create a fake player GameProfile
                const GameProfileClass = ModAPI.reflect.getClassById("net.lax1dude.eaglercraft.v1_8.mojang.authlib.GameProfile");
                var UUID = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.EaglercraftUUID", "randomUUID")]();

                //Not using UUID to make patching easier for now
                
                const fakeProfile = GameProfileClass.constructors[1](null, ModAPI.util.str("Steve"));

                // Get the PlayerInteractionManager class
                const PlayerInteractionManagerClass = ModAPI.reflect.getClassById("net.minecraft.server.management.ItemInWorldManager");
                const playerInteractionManager = PlayerInteractionManagerClass.constructors[0](world.getRef());

                // Get the EntityPlayerMP class to spawn the fake player
                AsyncSink.startDebuggingFS();
                const EntityPlayerMPClass = ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP");
                var worldNameProp = ModAPI.util.getNearestProperty(ModAPI.server.getRef(), "$worldName");
                var worldName = ModAPI.server.getRef()[worldNameProp];
                console.log(ModAPI.util.ustr(worldName));
                const fakePlayer = EntityPlayerMPClass.constructors[0](
                    ModAPI.server.getRef(), world.getRef(), fakeProfile, playerInteractionManager
                );

                // Set the fake player position to be near the command sender
                fakePlayer.setPosition(senderPos.$getX(), senderPos.$getY(), senderPos.$getZ());

                // Add the fake player to the world
                world.addEntityToWorld(fakePlayer.getEntityId(), fakePlayer);

                // Notify the player that the fake player has been spawned
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("Fake Steve has been spawned!")));

                // Prevent the command from executing further
                event.preventDefault = true;
            }
        });
    });
})();
