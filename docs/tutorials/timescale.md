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
Finally, due to our `BigInt` rounding shenanigans on the server, we have to replicate the rounding inaccuracy on the client.

