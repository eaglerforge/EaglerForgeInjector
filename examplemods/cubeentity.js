(function CubeEntity() {
    ModAPI.meta.title("Cube Entity");
    ModAPI.meta.version("v0");
    ModAPI.meta.description("testing custom entities");
    ModAPI.meta.credits("By ZXMushroom64");

    function registerEntity() {
        

        return {
            EntityCube: null,
            ModelCube: null,
            RenderCube: null
        }
    }

    ModAPI.dedicatedServer.appendCode(registerEntity);
    var data = registerEntity();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        //ModAPI.mc.renderManager.entityRenderMap.put(ModAPI.util.asClass(wellGetThere), new data.RenderCube(ModAPI.mc.renderManager.getRef()))
        AsyncSink.L10N.set("entity.Cube.name", "Cube (TM)");
    });
})();