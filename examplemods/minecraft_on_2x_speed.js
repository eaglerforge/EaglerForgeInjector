//Very much WIP, still firguring out how to poke the dedicated server.
(()=>{
    //PluginAPI.javaClient.$timer.$timerSpeed = 4;
    ModAPI.dedicatedServer.appendCode(`console.log(ModAPI.hooks._rippedStaticProperties[ModAPI.util.getCompiledNameFromPackage("net.lax1dude.eaglercraft.v1_8.sp.server.EaglerIntegratedServerWorker")].currentProcess)`);
})();