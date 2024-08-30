(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("/talkback")) {
                var message = event.command.substring("/talkback ".length);
                if (
                    ModAPI.hooks._teavm.$rt_isInstance(event.sender, ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.entity.player.EntityPlayerMP")].class)
                ) {
                    event.sender.addChatMessage(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.util.ChatComponentText")].constructors[0](ModAPI.util.str(message.toUpperCase())));
                }
                event.preventDefault = true;
            }
        });
    });
})();