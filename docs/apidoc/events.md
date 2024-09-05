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
        - `preventDefault: Boolean`
            - Boolean representing whether or not to cancel processing the command. Default is `false`.