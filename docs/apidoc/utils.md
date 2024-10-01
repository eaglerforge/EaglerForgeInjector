## ModAPI.util

ModAPI.util provides and exposes a large number of utilities for interacting with ModAPI.

Properties:

- `StaticProps_ProxyConf: ProxyConfiguration`
  - This is the proxy configuration used for exposing `ModAPI.items`, `ModAPI.blocks`, `ModAPI.enchantments` and `ModAPI.materials`
  - See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy
- `TeaVM_to_BaseData_ProxyConf: ProxyConfiguration`
  - This is a non-recursive proxy config for removing prefixes from java objects.
- `TeaVM_to_Recursive_BaseData_ProxyConf: ProxyConfiguration`
  - This is a recursive proxy config for removing prefixes from java objects. It handles properties (both object and array) as well as function outputs. Used for `ModAPI.player`, `ModAPI.mc`, `ModAPI.world`, `ModAPI.network` and more.
- `TeaVMArray_To_Recursive_BaseData_ProxyConf: ProxyConfiguration`
  - This is a recursive proxy config for handling arrays from `TeaVM_to_Recursive_BaseData_ProxyConf`

Methods:

- `ModAPI.util.str(jsString: String) : java.lang.String`
  - Converts a javascript string to a java string, for use in java methods and constructors.
  - Alias: `ModAPI.util.string()`
- `ModAPI.util.unstr(jclString: java.lang.String) : String`
  - Converts a java string to a javascript string.
  - Alias: `ModAPI.util.ustr()`
  - Alias: `ModAPI.util.unstring()`
  - Alias: `ModAPI.util.jclStrToJsStr()`
- `ModAPI.util.getMethodFromPackage(classId: String, methodName: String) : String`
  - Takes a class id (eg: `net.minecraft.client.Minecraft`) and a method name (eg: `middleClickMouse`) and returns its key in `ModAPI.hooks.methods`.
- `ModAPI.util.stringToUint16Array(string: String) : Uint16Array`
  - Encodes a string into a uint16array.
- `ModAPI.util.setStringContent(jclString: java.lang.String, contents: String) : void`
  - Writes a new javascript string into the contents of a java string.
- `ModAPI.util.getMethodFromPackage(classId: String, methodName: String) : String`
  - Takes a class id (eg: `net.minecraft.client.Minecraft`) and a method name (eg: `middleClickMouse`) and returns its key in `ModAPI.hooks.methods`.
- `ModAPI.util.hashCode(string: String) : String`
  - Returns the hash of a string.
- `ModAPI.util.isCritical() : boolean`
  - Checks wether the thread is in a critical state.
  - When patching methods, it is good practice to allow the method to resume as usual if this is `true`, to avoid stack implosions. (yes, those are real)
- `ModAPI.util.createArray(class, jsArray) : Object[]`
  - Makes a java array from a class and a javascript array.
  - The class parameter can be retrieved via reflect: `ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").class`
- `ModAPI.util.wrap(obj: Object) : object`
  - Returns a wrapper around native java objects, removing prefixes and fixing method outputs.
- `ModAPI.util.getNearestProperty(object: Object, property: string) : string`
  - Finds the nearest property name to the one you specify (suffix based). This is used to mitigate teavm adding random suffixes to properties.
- `ModAPI.util.modifyFunction(fn: Function, patcherFunction: Function) : string`
  - Returns a modifies version of a function, where the patcher function can be used to modify the contents of a function. Example:
  ```javascript
    function add(a, b) {
      return a + b;
    }
    var multiply = ModAPI.util.modifyFunction(add, (code)=>{
      return code.replaceAll("a + b", "a * b");
    });
    console.log(multiply(2, 3));
    //Logs 6
  ```