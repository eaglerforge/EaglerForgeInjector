## Timescale Mod with ModAPI
This mod will cover adding a new command that controls the speed that Eaglercraft runs at. This tutorial assumes that you have some knowledge on how to use [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) in JavaScript.

Let's get our basic template code down:

```javascript
(function TimescaleCommand() {
    ModAPI.meta.title("Timescale Command");
    ModAPI.meta.description("use /timescale to control time");
    ModAPI.meta.credits("By <author_name>");
})()
```

Our mod is going to be split into 2 distinct parts: client-side and server-side. The client will modify `ModAPI.mc.timer.timerSpeed` when a `/timescale` command is sent, while the server will set the timescale to a global variable, and then modify `net.minecraft.server.MinecraftServer`'s `getCurrentTimeMillis()` to change the rate calculations happen at on the server.\
\
However, there is a slight logistical problem: the server gets the time in milliseconds as a JavaScript [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), which means we can't just multiply it by a number, we have to either multiply or divide it by another BigInt.
```javascript
var x = 1n * 1.0; //TypeError

var x = 1n * 1n; //Success
```
To allow us to both speed up and slow down time, we'll need to check if the speed inputted is greater or equal to 1. If it is, we round it and then convert it to a `BigInt`, which we'll store on the `globalThis` object. If it's less we'll need to find the speed to the power of -1, or `1 / speed`. We can then round this value and convert that to a `BigInt` to store on `globalThis`. We'll also set `globalThis.timeScaleDividing` to `true`, to signal to replaced `getCurrentTimeMillis()` to divide by the `BigInt` speed factor instead of multiply.\
\
Finally, due to our `BigInt` rounding shenanigans on the server, we have to replicate the rounding inaccuracy on the client.\
\
Let's implement the client side part.
```javascript
(function TimescaleCommand() {
    ModAPI.meta.title("Timescale Command");
    ModAPI.meta.description("use /timescale to control time");
    ModAPI.meta.credits("By <author_name>");

    ModAPI.addEventListener("sendchatmessage", (event) => { // before a message gets sent to the server
        if (event.message.toLowerCase().startsWith("/timescale")) { //if it is the timescale command
            var speed = parseFloat(event.message.split(" ")[1]); //get the part of the message after the space
            if (!speed) { //If it doesn't exist, set it to 1.
                speed = 1;
            } else { //If it does exist:
                if (speed < 1) { //When the speed is less than 1, round the denominator (1 over x)
                    speed = 1 / Math.round(1 / speed);
                } else {
                    // When the speed is greater or equal to 1, round the numerator (x over 1)
                    speed = Math.round(speed);
                }
                // Set the speed
                ModAPI.mc.timer.timerSpeed = speed;
            }
            // Log the speed to chat
            ModAPI.displayToChat("[Timescale] Set world timescale to " + speed.toFixed(2) + ".");
        }
    });
})()
```
Now for the serverside part.
```javascript
(function TimescaleCommand() {
    //...

    ModAPI.dedicatedServer.appendCode(function () { // Run on the server
        globalThis.timeScale = 1n; // Initialize globalThis.timeScale
        globalThis.timeScaleDividing = false; // Initialize globalThis.timeScaleDividing

        ModAPI.addEventListener("processcommand", (event) => { // when the server receives a command
            if (event.command.toLowerCase().startsWith("/timescale")) { // if it is a timescale command
                var speed = parseFloat(event.command.split(" ")[1]); // get the second part of the command (the speed of time)
                if (!speed) { // If it doesn't exist, set it to 1.
                    globalThis.timeScale = 1n;
                    globalThis.timeScaleDividing = false;
                } else { // If it does exist:
                    if (speed < 1) {
                        // When the speed is less than 1, round the denominator (1 over x)
                        // And enable division mode
                        globalThis.timeScaleDividing = true;
                        globalThis.timeScale = BigInt(Math.round(1 / speed));
                    } else {
                        // When the speed is greater or equal to 1, round the numerator (x over 1)
                        // And disable division mode
                        globalThis.timeScaleDividing = false;
                        globalThis.timeScale = BigInt(Math.round(speed));
                    }
                }
                if (ModAPI.server) { //If the server is initialized
                    //Bump the current time forward so the server doesn't try to play catch-up
                    ModAPI.server.currentTime = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")]();
                }

                //Prevent the command not found error from appearing
                event.preventDefault = true;
            }
        });
        
        //Monkey patch the getCurrentTime function.
        const original_getCurrentTime = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")];
        ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")] = function () {
            if (globalThis.timeScaleDividing) { //If we are in divide mode
                return original_getCurrentTime() / globalThis.timeScale; //Return the current time divided by the time scale
            } else {
                return original_getCurrentTime() * globalThis.timeScale; //Else, return the current time multiplied by the time scale
            }
        };
    });
})()
```