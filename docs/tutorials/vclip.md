## VClip Exploit with ModAPI
Most minecraft servers have an exploit where you can trick the server into clipping you up to 10 blocks up or down through ceilings or floors.

### Part 1: Setup

Make a new file in your editor, and call it something like `vclip.js`
First, let's setup a basic [IIFE (immediately invoked function expression)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) around our mod code. This ensures that we don't leak variables that can interfere wiht other mods.\
Example of the issue: if mod A and mod B both use `var myVariable = 0`, the value for myVariable will get overwritten.

```javascript
(function VClipExploit() {
    //Future code here
})(); //We define a function, called VClipExploit, which we wrap in parantheses () and immediately execute.
```
This allows us to use variables without worrying about mod compatibility, as variables are scoped to the function.

\
Then, we'll add some basic [metadata](../apidoc/meta.md) for the mod loader (note that this is optional, but makes the mod look a lot better in the GUI once the game is loaded.)\
We'll also require the player, so the `ModAPI.player` global is generated.

```javascript
(function VClipExploit() {
    ModAPI.meta.title("VClip Exploit");
    ModAPI.meta.description("todo: add description.");
    ModAPI.meta.credits("By author_name");

    ModAPI.require("player");


})();
```

### Part 2: VClip Exploit
Our VClip exploit will be triggered by a client-side command, `.vclip <amount>`.
Let's start off with the vclip command by adding an event listener to when the player sends a chat message:
```javascript
(function VClipExploit() {
    ModAPI.meta.title("VClip Exploit");
    ModAPI.meta.description("todo: add description.");
    ModAPI.meta.credits("By author_name");

    ModAPI.require("player");

    ModAPI.addEventListener("sendchatmessage", (ev) => {
        // handler code here
    });
})();
```
In this event handler, we can get the content of the message by using `event.message`, process it, and check whether it is using the `.vclip` command. We can do this by casting the string to lowercase, using [`string.toLowerCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase), checking if the result of that is a call to the `.vclip` command using [`string.startsWith()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith).

If it is a call to the VClip command, we can use [`string.split(" ")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split) to get all the arguments, find the vclip amount, and change the player's position.

```javascript
(function VClipExploit() {
    ModAPI.meta.title("VClip Exploit");
    ModAPI.meta.description("todo: add description.");
    ModAPI.meta.credits("By author_name");

    ModAPI.require("player");

    ModAPI.addEventListener("sendchatmessage", (ev) => {
        var string = ev.message.toLowerCase(); //Get the lower case version of the command
        if (string.startsWith(".vclip")) { //does the chat message start with .vclip?
            ev.preventDefault = true; //we don't want this being sent into chat as a message
            var yOffset = 1; //The offset on the y axis
            var args = string.split(" ");
            if (args[1]) { //If the second argument to .vclip exists (the vclip <amount>)
                yOffset = parseFloat(args[1]) || 0; //Convert the second argument into a number. We use || to replace NaN (invalid numbers) with 0. Then, store it into the y offset.
            } //This allows you to just type .vclip to clip upwards 1 block.
            
            ModAPI.player.setPosition( //This function sets the players position to an XYZ coordinate
                ModAPI.player.posX,
                ModAPI.player.posY + yOffset, //All XYZ elements are the same, except we add the yOffset variable to the y axis.
                ModAPI.player.posZ
            ); 

            //Finally, log the amount we've VClipped into the chat.
            ModAPI.displayToChat("[VClip] VClipped " + yOffset + " blocks.");
        }
    });
})();
```