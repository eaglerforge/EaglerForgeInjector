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
        const prefix = "§7[§4worldedit§7] ";
        const pos = blockpos;
        const positions = globalThis.playerPositions[player.getName()] ||= {};
        
        // Save position #2
        positions.pos2 = pos;

        // Send chat message to player
        user.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(
            ModAPI.util.str(prefix + "Pos #2 selected at: " + pos.$x + ", " + pos.$y + ", " + pos.$z)
        ));
        return true;
        `,
        onLeftClickGround: `/*/user, world, itemstack, blockpos/*/
        const prefix = "§7[§4worldedit§7] ";
        const player = user;
        const pos = blockpos;
        const positions = globalThis.playerPositions[player.getName()] ||= {};
        
        // Save position #1
        positions.pos1 = pos;

        // Send chat message to player
        user.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(
            ModAPI.util.str(prefix + "Pos #1 selected at: " + pos.$x + ", " + pos.$y + ", " + pos.$z)
        ));
        return true;
        `
    });
});

(() => {
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) {return}
            const prefix = "§7[§4worldedit§7] ";
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
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "A wand has been added to your inventory!")));
                player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "Left click: select pos #1; Right click: select pos #2")));
                
                event.preventDefault = true;
            }
            if (event.command.toLowerCase().startsWith("//set")) {
                // Parse command parameters
                const params = event.command.substring("//set ".length);
                if (!params) {
                    player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "§cUsage: //set <block_type>")));
                    event.preventDefault = true;
                    return;
                }
    
                const blockType = params;
                const player = event.sender;
                const positions = globalThis.playerPositions[player.getName()];
    
                // Validate block type and positions
                const block = ModAPI.blocks[blockType];
                if (!block) {
                    player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "§cInvalid block type.")));
                    event.preventDefault = true;
                    return;
                }
    
                if (!positions || !positions.pos1 || !positions.pos2) {
                    player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "§cPositions not set. Use left and right click to set positions.")));
                    event.preventDefault = true;
                    return;
                }
    
                const blockState = block.getDefaultState().getRef();
                const world = player.getServerForPlayer().getWorld();
    
                // Get coordinates
                const x1 = Math.min(positions.pos1.$x, positions.pos2.$x);
                const y1 = Math.min(positions.pos1.$y, positions.pos2.$y);
                const z1 = Math.min(positions.pos1.$z, positions.pos2.$z);
                const x2 = Math.max(positions.pos1.$x, positions.pos2.$x);
                const y2 = Math.max(positions.pos1.$y, positions.pos2.$y);
                const z2 = Math.max(positions.pos1.$z, positions.pos2.$z);
    
                // Set blocks in the specified area
                for (let x = x1; x <= x2; x++) {
                    for (let y = y1; y <= y2; y++) {
                        for (let z = z1; z <= z2; z++) {
                            const blockPos = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors[0](x, y, z);
                            world.setBlockState(blockPos, blockState, 3);
                        }
                    }
                }
    
                // Notify the sender
                player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "§aBlocks set successfully.")));
    
                event.preventDefault = true;
        }
        });
    });
})();
