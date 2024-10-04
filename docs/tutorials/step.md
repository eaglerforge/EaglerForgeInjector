## Step Hack with ModAPI
A step hack allows a player to walk up full blocks (or more) as if they were slabs.

Start by creating a new file in your code editor. Save it to a folder on your device, ensuring that the file extension is `.js`.

Let's start by requiring the player. This will allow us to change attributes on the player:
```javascript
ModAPI.require("player");
```

Now, we have to detect when the player in a world. This will be done with the `update` event, which runs every tick while the player is in a world. In EaglerForge's ModAPI, to run code on an event, you have to create a function. Then, you register the function to an event.
```javascript
ModAPI.require("player");

function stepHackUpdateCode() {
    //We will add code here.
}
ModAPI.addEventListener("update", stepHackUpdateCode);
```

Inside this method, lets change the player's `stepHeight`, which controls how high they can step. By default this is `0.5`, to alow players to walk up slabs or stairs. I'll change it to `2` for demonstration purposes. You can also try any other number, like `0`, `6`, etc.
```javascript
ModAPI.require("player");

function stepHackUpdateCode() {
    ModAPI.player.stepHeight = 2;
}
ModAPI.addEventListener("update", stepHackUpdateCode);
```

Now, to load this mod, open your EaglerForge build, and in the start screen select `Upload Mod (.js)`. Upload the mod you created, and you should now be able to walk up two block tall pillars, or more depending on what `stepHeight` you selected.

Disclaimer: using this on servers may get you banned/kicked for cheating!