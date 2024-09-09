//WIP Blocklook plugin
//If someone can fix the crash, thank you and also i'll add you to credits.
ModAPI.meta.title("BlockLook");
ModAPI.meta.credits("Made with ❤️ by ZXMushroom63");
ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAPlJREFUOE+Fk7EVwjAMRM8TQJEmS0DBBtAwBEtQwBBkCBqGoIEhsgFNGrKDeOdEjuw4Rk1eLN33WbIdAEEmROJl51yuDFyVtFgrVVTKZwEqfAnQAjiPm+dcRQAVfkchnRCg33sCYn0ABLsd0NeTiACFfAC8DSQLoFS6AUDQFQCFDBX7GhHMAPIE3HFqNkGHOhZWAvSuAFC/jlvbkIv/q9AUADdz4Ad8g3xwHHvtBBPNwhEUMHYuAuwArJgoAU5mZm3iIAAAuO2CAwLM4GcOyKeLHIC5cBc2A2gGWA8reiOjMdqGLz2cv1c5GdzkKHmZWhccpEJr0xbn6n64M6oBwREDxAAAAABJRU5ErkJggg==");
ModAPI.meta.description("EaglerForge port of the bukkit BlockLook plugin by GeorgeNotFound. Use /blocklook in a single-player world to toggle the plugin.");
ModAPI.dedicatedServer.appendCode(function () {
    var worldMethodMap = ModAPI.reflect.getClassById("net.minecraft.world.World").methods;
    var rayTraceMethod = worldMethodMap[Object.keys(worldMethodMap).filter(key => {
        return key.startsWith("rayTraceBlocks") && worldMethodMap[key].method.length === 4;
    })].method;
    var blockPosConstructor = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find((x) => { return x.length === 3 });
    var blockStateConstructor = ModAPI.reflect.getClassByName("BlockState").constructors[0];
    var blockTypesList = Object.keys(ModAPI.blocks);
    var iproperty = ModAPI.reflect.getClassById("net.minecraft.block.property.IProperty").class;
    function getPlayerEntitiesAndTheirWorld() {
        var out = [];
        ModAPI.server.worldServers.forEach(x => {
            var list = x.playerEntities;
            var size = list.size();
            for (let i = 0; i < size; i++) {
                const playerEntity = list.get(i);
                if (playerEntity) {
                    out.push({
                        world: x,
                        player: playerEntity
                    });
                }
            }
        });
        return out;
    };
    var active = false;
    ModAPI.addEventListener("processcommand", (event) => {
        if (event.command.toLowerCase().startsWith("/blocklook")) {
            active = !active;
            var playerEntities = getPlayerEntitiesAndTheirWorld();
            playerEntities.forEach(pair => {
                pair.player.addChatMessage(
                    ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(
                        "[BlockLook] Toggled to " + (active ? "on" : off)
                    ))
                )
            });
            event.preventDefault = true;
        }
    });
    ModAPI.addEventListener("tick", () => {
        if (!active) {
            return;
        }
        active = false; //Don't run every tick, for debugging purposes.
        var playerEntities = getPlayerEntitiesAndTheirWorld();
        playerEntities.forEach(pair => {
            var start = pair.player.getPositionEyes(1).getRef();
            var lookVector = pair.player.getLook(1);
            lookVector.xCoord *= 50;
            lookVector.yCoord *= 50;
            lookVector.zCoord *= 50;
            lookVector.addVector(start.$xCoord, start.$yCoord, start.$zCoord);
            var hitResult = rayTraceMethod(pair.world.getRef(), start, lookVector.getRef(), 0);
            console.log("trace complete.");
            if (hitResult) {
                console.log("Attempting to set world state.");
                var blockPos = blockPosConstructor(hitResult.$hitVec.$xCoord, hitResult.$hitVec.$yCoord, hitResult.$hitVec.$zCoord);
                var blockType = blockTypesList[Math.floor(Math.random() * blockTypesList.length)];
                blockType = ModAPI.blocks[blockType];
                pair.world.setBlockState(blockPos, blockStateConstructor(blockType.getRef(), ModAPI.util.makeArray(iproperty, [])), 0);
            }
            console.log("sub complete");
        });
    });
});