const originalGetBurnTime = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.tileentity.TileEntityFurnace", "getItemBurnTime")];
ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.tileentity.TileEntityFurnace", "getItemBurnTime")] = function (...args) {
    if (args[0].$item === ModAPI.items.string.getRef()) {
        return 50;
    }
    return originalGetBurnTime.apply(this, args);
};