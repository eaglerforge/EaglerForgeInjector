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
                const sheep = EntitySheepClass.constructors[1](world.getRef());

                // Set sheep's position to player's position
                sheep.setPosition(senderPos.$getX(), senderPos.$getY(), senderPos.$getZ());

                // Disable AI (no AI behavior)
                sheep.getDataWatcher().updateObject(15, 1); // AI flag, 15 is the byte for AI, 1 means no AI

                // Disable gravity
                sheep.noGravity = true;

                // Make sheep invincible
                sheep.setEntityInvulnerable(true);

                // Prevent the sheep from taking any damage
                const DamageSourceClass = ModAPI.reflect.getClassById("net.minecraft.util.DamageSource");
                ModAPI.addEventListener("livinghurt", (event) => {
                    if (sheep.equals(event.entityLiving)) {
                        event.setCanceled(true);
                    }
                });

                // Add the sheep to the world
                world.addEntityToWorld(sheep.getEntityId(), sheep);

                // Notify the player that the sheep has been spawned
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("A special sheep has been spawned!")));

                // Add an event listener for when the sheep is right-clicked
                ModAPI.addEventListener("rightclickentity", (clickEvent) => {
                    if (sheep.equals(clickEvent.target)) {
                        // Send message to the player who right-clicked
                        clickEvent.entityPlayer.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("bahhh")));
                    }
                });

                // Prevent the command from executing further
                event.preventDefault = true;
            }
        });
    });
})();
