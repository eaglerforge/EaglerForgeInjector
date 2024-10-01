ModAPI.meta.title("Simple VClip Exploit");
ModAPI.meta.description("Use .vclip <offset> to vertically phase through blocks.");
ModAPI.meta.credits("By ZXMushroom63");
ModAPI.require("player");
ModAPI.addEventListener("sendchatmessage", (ev) => {
    var msg = ev.message.toLowerCase();
    if (msg.startsWith(".vclip")) {
        ev.preventDefault = true;
        var yOffset = 1;
        if (msg.split(" ")[1]) {
            yOffset = parseFloat(msg.split(" ")[1]) || 0;
        }
        ModAPI.player.setPosition(ModAPI.player.posX, ModAPI.player.posY
            + yOffset, ModAPI.player.posZ);
        ModAPI.displayToChat("[SimpleVClip] VClipped " + yOffset + " blocks.");
    }
});