(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return; }

            if (event.command.toLowerCase().startsWith("/spawnsteve")) {
                const world = event.sender.getServerForPlayer();
                const senderPos = event.sender.getPosition();

                // Create a fake player GameProfile
                const GameProfileClass = ModAPI.reflect.getClassById("com.mojang.authlib.GameProfile");
                const fakeProfile = GameProfileClass.constructors[2](
                    ModAPI.reflect.getClassById("java.util.UUID").staticMethods.randomUUID(), ModAPI.util.str("Steve")
                );

                // Get the EntityPlayerMP class to spawn the fake player
                const EntityPlayerMPClass = ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP");
                const fakePlayer = EntityPlayerMPClass.constructors[1](
                    world.getMinecraftServer(), world.getRef(), fakeProfile, world.getPlayerInteractionManager()
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
