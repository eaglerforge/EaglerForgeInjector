(() => {
    PluginAPI.dedicatedServer.appendCode(function () { //Run this code on the server
        PluginAPI.addEventListener("processcommand", (event) => { //Command processing event
            // Check if the sender is a player
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return; }

            // Check if the command is "/spawnxp"
            if (event.command.toLowerCase().startsWith("/spawnxp")) {
                const world = event.sender.getServerForPlayer();
                const senderPos = event.sender.getPosition();

                // Create an xp orb entity
                const EntityXP = ModAPI.reflect.getClassByName("EntityXPOrb");
                const xporb = EntityXP.constructors[0](world.getRef(), senderPos.getX(), senderPos.getY(), senderPos.getZ(), 10);

                // Add the xp orb to the world
                ModAPI.promisify(ModAPI.hooks.methods.nmw_World_spawnEntityInWorld)(world.getRef(), xporb).then(result => {
                    // Notify the player that the xp orb has been spawned

                    // Get the chat component class
                    const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                    // Construct the chat component and send it to the client.
                    event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("An xp orb has been spawned!")));
                });

                // Prevent the command from executing further (stops syntax errors / command does not exist errors)
                event.preventDefault = true;
            }
        });
    });
})();