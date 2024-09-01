## ModAPI.hooks
- To replace a function with another, you can use:
        - `ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("com.package.abc.MyClass", "myMethod")] = function () {}`
    - To intercept inputs to a function, you can us
        - `ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("com.package.abc.MyClass", "myMethod")] = function () {}`