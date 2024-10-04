## ModAPI.promisify()
Some methods in java are asynchronous, meaning that they don't return a value/modify state immediately. Calling them in an event or in a patch to a normal function will cause a stack implosion, characterised by the client/dedicated server hanging without any error messages.

In order to call them properly from javascript, you need to use the `ModAPI.promisify()` function.

For example, here we have a simple client-side command that will try to use the `PlatformRuntime` class to download data from a URI:
```javascript
ModAPI.addEventListener("sendchatmessage", function downloadSomething(e) {
    if (e.message.toLowerCase().startsWith("/downloadtest")) {
        var arraybuffer = ModAPI.hooks.methods.nlevi_PlatformRuntime_downloadRemoteURI(ModAPI.util.str("data:text/plain,hi"));
        console.log(arraybuffer);
    }
});
```
This will cause the client to hang. The correct way of calling this asynchronous method is like this:
```javascript
ModAPI.addEventListener("sendchatmessage", function downloadSomething(e) {
    if (e.message.toLowerCase().startsWith("/downloadtest")) {
        ModAPI.promisify(ModAPI.hooks.methods.nlevi_PlatformRuntime_downloadRemoteURI)(ModAPI.util.str("data:text/plain,hi")).then(arraybuffer => {
            console.log(arraybuffer);
        });
    }
});
```

You can replace the argument with any other method or constructor, including non asynchronous ones.