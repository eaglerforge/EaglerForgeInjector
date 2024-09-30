(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            // Check if the sender is a player
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return; }

            // Check if the command is "/spawnnpc"
            if (event.command.toLowerCase().startsWith("/spawnnpc")) {
                const world = event.sender.getServerForPlayer();
                const senderPos = event.sender.getPosition();

                // Create a sheep entity
                const EntitySheepClass = ModAPI.reflect.getClassById("net.minecraft.entity.passive.EntitySheep");
                const sheep = EntitySheepClass.constructors[0](world.getRef());

                // Set sheep's position to player's position
                sheep.$setLocationAndAngles(senderPos.getX(), senderPos.getY(), senderPos.getZ(), senderPos.rotationYaw, senderPos.rotationPitch);

                // Disable AI (no AI behavior)
                sheep.getDataWatcher().updateObject(15, 1); // AI flag, 15 is the byte for AI, 1 means no AI

                // Disable gravity
                sheep.noGravity = 1;

                // Make sheep invincible
                sheep.setEntityInvulnerable(1);

                // Add the sheep to the world
                world.spawnEntityInWorld(sheep);

                // Notify the player that the sheep has been spawned
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("A special sheep has been spawned!")));


                // Prevent the command from executing further
                event.preventDefault = true;
            }
        });
    });
})();
