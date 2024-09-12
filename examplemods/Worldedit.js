//WIP worldedit by radmanplays

ModAPI.addEventListener("lib:libcustomitems:loaded", () => {
    console.log("Registered worldedit custom items.");
    LibCustomItems.registerItem({
        tag: "worldedit:wand",
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
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) {return}
            if (event.command.toLowerCase().startsWith("//wand")) {
                    // Create a new ItemStack for the custom item
                    const ItemStackClass = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack");
                    const itemStack = ItemStackClass.constructors[4](
                        ModAPI.items["wooden_axe"].getRef(), 1
                    );
                    
                    // Create NBT data for the item
                    const NBTTagCompoundClass = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound");
                    itemStack.$stackTagCompound = NBTTagCompoundClass.constructors[0]();
                    const displayTag = NBTTagCompoundClass.constructors[0]();
                    itemStack.$stackTagCompound.$setTag(ModAPI.util.str("display"), displayTag);
    
                    // Set item name
                    displayTag.$setString(ModAPI.util.str("Name"), ModAPI.util.str("Wand"));
    
                    // Set item lore
                    var loreList = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagList").constructors[0]();
                    loreList.$appendTag(ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagString").constructors.filter(x => { return x.length === 1 })[0](ModAPI.util.str("worldedit:wand")));
                    displayTag.$setTag(ModAPI.util.str("Lore"), loreList);
    
                    // Add the item to the sender's inventory
                    const player = event.sender;
                    player.inventory.addItemStackToInventory(itemStack);
    
                    // Notify the sender
                    const prefix = "§7[§4worldedit§7] ";
                    const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                    player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "A wand has been added to your inventory.")));
                    
                    event.preventDefault = true;
            }
        });
    });
})();
