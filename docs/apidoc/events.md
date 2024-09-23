## Events
Events broadcast data for use in mods.

- `ModAPI.addEventListener(eventName: String, callback: Function) : void`
    - Used to register an event handler. Eg:
    - ```javascript
        function myHandler(event) {
            console.log(event);
        }
        ModAPI.addEventListener("update", myHandler);
        ```
- `ModAPI.removeEventListener(eventName: String, callback: Function) : void`
    - Used to unregister an event handler. Eg:
    - ```javascript
        function myHandler(event) {
            console.log(event);
        }
        ModAPI.removeEventListener("update", myHandler);
        ```

### Basic Events
- `update`:
    - Called every client side tick.
    - Event object is blank.
- `load`:
    - Called when all mods have finished loading.
    - Event object is blank.
- `sendchatmessage`:
    - Called just before the player sends a chat message.
    - Passes an object with properties:
        - `message: String`
            - String representing the chat message.
        - `preventDefault: Boolean`
            - Boolean representing whether or not to cancel processing the chat message. Default is `false`.
- `event`:
    - Called when any event is called. Passes an object with properties:
    - Passes an object with properties:
        - `event: String`
            - String representing the type of event being fired.
        - `data: Object`
            - Object representing the original arguments to be passed to the callback.
- `frame`:
    - Called just when a frame is rendered on the client.
    - Event object is blank.


### Server Side Events
Can only be used in the context of the dedicated server. More: [DedicatedServerDocumentation](dedicatedserver.md)
- `serverstart`:
    - Called when the dedicated server starts.
    - Event object is blank.
- `serverstop`:
    - Called when the dedicated server stops.
    - Event object is blank.
- `tick`:
    - Called when the server ticks.
    - Passes an object with properties:
        - `preventDefault: Boolean`
            - Boolean representing whether or not to cancel the tick. Default is `false`.
- `receivechatmessage`:
    - Called when the server receives a chat message.
    - Passes an object with properties:
        - `message: String`
            - String representing the chat message.
        - `preventDefault: Boolean`
            - Boolean representing whether or not to cancel processing the chat message. Default is `false`.
- `processcommand`:
    - Called when the server receives a command.
    - Passes an object with properties:
        - `command: String`
            - String representing the command.
        - `sender: ICommandSender`
            - Object that sent the command
        - `preventDefault: Boolean`
            - Boolean representing whether or not to cancel processing the command. Default is `false`.

### Events Global, adding new events
The events global, `ModAPI.events`, allows you to register new event types and call them.

#### ModAPI.events.newEvent(eventName: String)
You can register new events using ModAPI, as long as the event name starts with `custom:` (`lib:` is only useful for library loading). For example, if I want to add a new event that can be used by other mods, I can use `ModAPI.events.newEvent("custom:myevent")`.


#### ModAPI.events.callEvent(eventName: String, data: Object)
You can then call events via `ModAPI.events.callEvent`. For example, to trigger `custom:myevent` with a secret code value, I can run `ModAPI.events.callEvent("custom:myevent", {secretCode: "1234"});`.

Here is an example on using this:
```javascript
// Mod #1, registers event handler for custom event
ModAPI.addEventListener("custom:myevent", (e)=>{
    alert(e.secretCode);
});
```
```javascript
// Mod #2, registers and calls custom event
ModAPI.events.newEvent("custom:myevent");
ModAPI.events.callEvent("custom:myevent", {
    secretCode: "1234"
});
```

#### Using library load events
```javascript
// Mod #2, registers and calls lib event
ModAPI.events.newEvent("lib:mylibrary:loaded");
ModAPI.events.callEvent("lib:mylibrary:loaded", {});
```
```javascript
// Mod #1, registers event handler for lib event
ModAPI.addEventListener("lib:mylibrary:loaded", (e)=>{
    //Lib events function differently to normal events, as when they are called once, any new event listener with automatically fire upon being registered.
});
```