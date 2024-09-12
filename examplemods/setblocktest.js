//Test to make sure I can set a block
ModAPI.dedicatedServer.appendCode(function () {
    var blockPosConstructor = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find((x) => { return x.length === 3 });
    var blockStateConstructor = ModAPI.reflect.getClassByName("BlockState").constructors[0];
    var iproperty = ModAPI.reflect.getClassById("net.minecraft.block.property.IProperty").class;
    ModAPI.addEventListener("processcommand", (event) => {
        if (event.command.toLowerCase().startsWith("/testcmd")) {
            var blockPos = blockPosConstructor(0, 0, 0);
            var blockType = ModAPI.blocks["dirt"]; //blockType
            var block = blockStateConstructor(blockType.getRef(), ModAPI.util.makeArray(iproperty, []));
            event.sender.getServerForPlayer().setBlockState(blockPos, block, 0);
            event.preventDefault = true;
        }
    });
});