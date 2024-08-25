//Very much WIP, still firguring out how to poke the dedicated server.
(()=>{
    PluginAPI.javaClient.$timer.$timerSpeed = 3;
    ModAPI.dedicatedServer.appendCode(`
        const original_getCurrentTime = ModAPI.hooks.methods.nms_MinecraftServer_getCurrentTimeMillis;
        ModAPI.hooks.methods.nms_MinecraftServer_getCurrentTimeMillis = function () {
            return original_getCurrentTime() * 3n;
        };`);
})();