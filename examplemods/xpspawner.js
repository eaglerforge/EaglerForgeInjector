(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            // Check if the sender is a player
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return; }

            // Check if the command is "/spawnsheep"
            if (event.command.toLowerCase().startsWith("/spawnxp")) {
                const world = event.sender.getServerForPlayer();
                const senderPos = event.sender.getPosition();

                // Create a sheep entity
                const EntityXP = ModAPI.reflect.getClassByName("EntityXPOrb");
                const xporb = EntityXP.constructors[0](world.getRef(), senderPos.getX(), senderPos.getY(), senderPos.getZ(), 10);

                if (globalThis.AsyncSink) { //If we can, start the AsyncSink debugger to see filesystem requests
                    AsyncSink.startDebuggingFS();
                }

                // Add the sheep to the world
                ModAPI.promisify(ModAPI.hooks.methods.nmw_World_spawnEntityInWorld)(world.getRef(), xporb).then(result => {
                    // Notify the player that the sheep has been spawned
                    const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                    event.sender.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str("An xp orb has been spawned!")));

                    if (globalThis.AsyncSink) { //Stop debugging when we are done, otherwise the console will get filled up.
                        AsyncSink.stopDebuggingFS();
                    }
                });

                // Prevent the command from executing further
                event.preventDefault = true;
            }
        });
    });
})();