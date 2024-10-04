## Spider Hack with ModAPI
A spider hack allows players to climb up any wall like a spider.

Start by creating a new file in your code editor. Save it to a folder on your device, ensuring that the file extension is `.js`.

The spider hack has a lot of similarities to the step hack, so lets copy the step hack and rename the `stepHackUpdateCode` function to `spiderHackUpdateCode`:
```javascript
ModAPI.require("player");

function spiderHackUpdateCode() {
    //We will add code here.
}
ModAPI.addEventListener("update", spiderHackUpdateCode);
```

Most spider hacks work by checking if the player is walking into a wall, and then setting their vertical velocity to a constant amount (usually `0.2`, for parity with ladders).
Let's start by checking if the player is walking into a wall, by adding an if statement inside the `spiderHackUpdateCode` function:
```javascript
if (ModAPI.player.isCollidedHorizontally) {

}
```

Now, let's set the player's vertical velocity:
```javascript
if (ModAPI.player.isCollidedHorizontally) {
    ModAPI.player.motionY = 0.2; //Feel free to change this value to something bigger, smaller or even negative.
}
```

Time to see the final code:
```javascript
ModAPI.require("player");

function spiderHackUpdateCode() {
    if (ModAPI.player.isCollidedHorizontally) {
        ModAPI.player.motionY = 0.2; //Feel free to change this value to something bigger, smaller or even negative.
    }
}
ModAPI.addEventListener("update", spiderHackUpdateCode);
```