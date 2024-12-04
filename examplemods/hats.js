//Metadata for the mod
ModAPI.meta.title("SimpleHats");
ModAPI.meta.credits("Made with ❤️ by ZXMushroom63");
ModAPI.meta.description("Use /hat to wear whatever you are holding!");

// Run the code on the server
ModAPI.dedicatedServer.appendCode(function () {
    // Find the constructor for the held item change packet that has only one argument.
    // This will be used to notify the client that their hotbar has been updated.
    var makePacketItemChange = ModAPI.reflect.getClassByName("S09PacketHeldItemChange").constructors.find(x => x.length === 1);

    // When the server is processing a command
    ModAPI.addEventListener("processcommand", (event) => {
        // If the command starts with /hat
        if (event.command.toLowerCase().startsWith("/hat")) {
            // Cancel if the sender isn't a player
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return };

            // Otherwise, get the current held item
            var heldItem = event.sender.inventory.getCurrentItem();

            // Get the contents of the helmet slot
            var armorItem = event.sender.inventory.armorInventory[3];

            // Get the inventory index of the current held item
            var hotbarIdx = event.sender.inventory.currentItem;

            // Set the helmet slot to heldItem.getRef() (raw java object) if heldItem exists, otherwise set it to null
            event.sender.inventory.armorInventory[3] = heldItem ? heldItem.getRef() : null;

            // Set the hotbar slot to the previous value of the helmet slot
            event.sender.inventory.mainInventory[hotbarIdx] = armorItem ? armorItem.getRef() : null;

            // Use the sendPacket method to send a item change packet to the client.
            event.sender.playerNetServerHandler.sendPacket(makePacketItemChange(hotbarIdx));

            event.preventDefault = true;
        }
    });
});