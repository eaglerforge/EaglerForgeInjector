## ModAPI.dedicatedServer

This is the dedicated server module, used for modding singleplayer in more powerful ways.

ModAPI.dedicatedServer has the following methods:

- `appendCode(code: Function | String) : void`
  - Injects provided code into the dedicated server.


### Modding the dedicated server
Eaglercraft runs the dedicated server in a service worker. This means that in order to run code to mod the dedicated server, you have to change context into the service worker.

`ModAPI.dedicatedServer.appendCode()` allows you to inject code into the dedicates server before startup. The code injected will throw errors if it attempts to access resources outside the functions context.

For example, take a look at this mod, which will inject some code that does nothing into the dedicated server:
```javascript
var myVariable = 4;
function myServerSideModCode() {
    function subfunction() {
        console.log("serverside!!!");
    }
    subfunction();
    //Successfully running serverside
    //However, we cannot access `myVariable`
}
ModAPI.dedicatedServer.appendCode(myServerSideModCode);
```

Once serverside, you can only access server side events, like `serverstart` or `tick`.