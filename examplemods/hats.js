ModAPI.meta.title("SimpleHats");
ModAPI.meta.credits("Made with ❤️ by ZXMushroom63");
ModAPI.meta.description("Use /hat to wear whatever you are holding!");
ModAPI.dedicatedServer.appendCode(function () {
    var makePacketItemChange = ModAPI.reflect.getClassByName("S09PacketHeldItemChange").constructors.find(x => x.length === 1);
    var sendPacket = ModAPI.reflect.getClassByName("NetHandlerPlayServer").methods.sendPacket.method;

    ModAPI.addEventListener("processcommand", (event) => {
        if (event.command.toLowerCase().startsWith("/hat")) {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return };
            var heldItem = event.sender.inventory.getCurrentItem();
            var armorItem = event.sender.inventory.armorInventory[3];
            var hotbarIdx = event.sender.inventory.currentItem;

            event.sender.inventory.armorInventory[3] = heldItem ? heldItem.getRef() : null;
            event.sender.inventory.mainInventory[hotbarIdx] = armorItem ? armorItem.getRef() : null;
            sendPacket(event.sender.playerNetServerHandler.getRef(), makePacketItemChange(hotbarIdx));
            event.preventDefault = true;
        }
    });
});