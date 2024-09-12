//Test to make sure I can set a block
ModAPI.dedicatedServer.appendCode(function () {
    var blockPosConstructor = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find((x) => { return x.length === 3 });
    ModAPI.addEventListener("processcommand", (event) => {
        if (event.command.toLowerCase().startsWith("/testcmd")) {
            var blockPos = blockPosConstructor(0, 0, 0);
            var blockType = ModAPI.blocks["dirt"]; //blockType
            var block = blockType.getDefaultState().getRef();
            event.sender.getServerForPlayer().setBlockState(blockPos, block, 3);
            event.preventDefault = true;
        }
    });
});