# Compiling Eaglercraft with support for EFI
In recent updates of eaglercraft, compiling for EaglerForgeInjector has become a great deal more complicated. To enable reflection and disable obfuscation, follow these steps once you have an EaglercraftX workspace set up:


1. In any files named `build.gradle`, set the `obfuscate` property to `false`.
2. In any files named `build.gradle`, find any code that looks like this:
    ```javascript
    tasks.named("generateJavaScript") {
        doLast {
        
            // NOTE: This step may break at any time, and is not required for 99% of browsers
            
            def phile = file(folder + "/" + name)
            def dest = phile.getText("UTF-8")
            def i = dest.substring(0, dest.indexOf("=\$rt_globals.Symbol('jsoClass');")).lastIndexOf("let ")
            dest = dest.substring(0, i) + "var" + dest.substring(i + 3)
            def j = dest.indexOf("function(\$rt_globals,\$rt_exports){")
            dest = dest.substring(0, j + 34) + "\n" + file(folder + "/ES6ShimScript.txt").getText("UTF-8") + "\n" + dest.substring(j + 34)
            phile.write(dest, "UTF-8")
        }
    }
    ```
    and delete it.
3. Inside of the `src/teavm/java/net/lax1dude/eaglercraft/v1_8/internal/teavm/` folder, create a new file called `ForceReflection.java`, with these contents:
    ```java
    package net.lax1dude.eaglercraft.v1_8.internal.teavm;

    public class ForceReflection {
        public static Object myObject;

        public static Object forceInit(Class iClass) {
            myObject = new ReflectiveClass();
            try {
                myObject = iClass.newInstance();
            } catch (Exception e) {
                // TODO: handle exception
            }
            return myObject;
        }

        public static class ReflectiveClass {
        }
    }
    ```
4. In the same folder, edit `MainClass.java` edit the start of the `main(String[] args)` method to look like this:
    ```java
    public static void main(String[] args) {
		ForceReflection.forceInit(ForceReflection.class);
		if(args.length == 1) {
        //... rest of method
    ```
5. Finally, build an offline download by using `CompileJS.bat`/`CompileJS.sh` and then `MakeOfflineDownload.bat`/`MakeOfflineDownload.sh`.
6. You can then upload the `EaglercraftX_1.8_Offline_en_US.html` into EaglerForgeInjector.