//WIP worldedit by radmanplays

ModAPI.addEventListener("lib:libcustomitems:loaded", () => {
    console.log("Registered worldedit custom items.");
    LibCustomItems.registerItem({
        tag: "worledit:wand",
        base: "wooden_axe",
        name: "Wand",
        qty: 1,
        recipe: [
            "   ",
            " # ",
            "   "
        ],
        recipeLegend: {
            "#": {
                "type": "item",
                "id": "wooden_axe"
            }
        },
        onRightClickGround: `/*/user, world, itemstack, blockpos/*/
        itemstack.stackSize -= 1;
        if (itemstack.stackSize < 1) {
            user.inventory.mainInventory[user.inventory.currentItem] = null;
        }
        user.setHealth(2);
        `
    });
});

(() => {
    const prefix = "[worldedit] "
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("//wand")) {
                event.sender.sendChatMessage(ModAPI.util.str(`/give @p wooden_axe 1 0 {display:{Name:"Wand",Lore:["worledit:wand"]}}`))
                event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + "a wand has been added to your inventory")));
                event.preventDefault = true;
            }
        });
    });
})();
