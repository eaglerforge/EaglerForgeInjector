(function MinecartSpeedMod() {
    ModAPI.meta.title("Faster Minecarts");
    ModAPI.meta.description("Faster minecarts! Use /minecart_speed {factor} to edit the minecart's speed. Carts are very prone to being flung off rails.");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.version("v1.0");
   
    ModAPI.dedicatedServer.appendCode(function () {
        ModAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("/minecart_speed")) {
                var speed = parseFloat(event.command.substring("/minecart_speed ".length)) || 1;
                var trueSpeed = speed * 0.4;
                ModAPI.hooks.methods.nmei_EntityMinecart_getMaximumSpeed = () => trueSpeed;
                event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Set minecart speed to "+speed)));
                event.preventDefault = true;
            }
        });
    });
})();