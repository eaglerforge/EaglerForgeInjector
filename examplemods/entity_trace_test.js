(() => {
    ModAPI.meta.title("/ray_trace_test");
    ModAPI.meta.description("Mod to test server-side raycasting.");
    ModAPI.meta.credits("By ZXMushroom63");

    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("/ray_trace_test")) {
                if (
                    ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())
                ) {
                    //raytrace distance = 6
                    //the 0 on the end is for client side view bobbing (frame based). we are on the server so using 0 as default.
                    var movingObjectPosition = event.sender.rayTrace(6, 0).getCorrective();
                    console.log(movingObjectPosition);

                    //var hitVec = movingObjectPosition.hitVec;

                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](
                        movingObjectPosition.toString().getRef() //This is a java string, but that's ok since it goes into a java method.
                    ));
                }
                event.preventDefault = true;
            }
        });
    });
})();