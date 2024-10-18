//Metadata about the vclip mod
ModAPI.meta.title("Simple VClip Exploit");
ModAPI.meta.description("Use .vclip <offset> to vertically phase through blocks.");
ModAPI.meta.credits("By ZXMushroom63");

// Require the player entity
ModAPI.require("player");

//When the player tries to send a chat message to the server
ModAPI.addEventListener("sendchatmessage", (ev) => {
    var msg = ev.message.toLowerCase(); //Get the lowercase version of the command
    if (msg.startsWith(".vclip")) { //If it starts with .vclip
        ev.preventDefault = true; //Don't send the chat message to the server
        var yOffset = 1; //Set the default Y offset to 1. This let's you use .vclip with no arguments to "unstuck" yourself;
        if (msg.split(" ")[1]) { //If there is a second part to the command
            yOffset = parseFloat(msg.split(" ")[1]) || 0; //Set the yOffset to that
        }
        ModAPI.player.setPosition(ModAPI.player.posX, ModAPI.player.posY
            + yOffset, ModAPI.player.posZ); //Set the player's position to their current position plus the y offset.
        ModAPI.displayToChat("[SimpleVClip] VClipped " + yOffset + " blocks."); //Display information to the client side chat.
    }
});