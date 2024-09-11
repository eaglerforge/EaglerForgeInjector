//WIP worldedit by radmanplays

(() => {
    const prefix = "[worldedit] "
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("//wand")) {
                event.sender.sendChatMessage(ModAPI.util.str("/give @s wooden_axe"))
                event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + "a wand has been added to your inventory")));
                event.preventDefault = true;
            }
        });
    });
})();
