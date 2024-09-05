## ModAPI.reflect

ModAPI.reflect supplies a user friendly wrapper for accessing and interacting with java classes from javascript.

Properties:

- `classes: ReflectClass[]`
  - `ModAPI.reflect.classes` is an array of ReflectClasses, representing (almost) every java class.

Methods:

- `ModAPI.reflect.getClassById(classId: String) : ReflectClass`
  - This method is used to find a class by its id.
  - For example, to get the `Minecraft` class, you can use `ModAPI.reflect.getClassById("net.minecraft.client.Minecraft")`
- `ModAPI.reflect.getClassByName(className: String) : ReflectClass`
  - This method is used to find a class by its id.
  - For example, to get the `Minecraft` class, you can use `ModAPI.reflect.getClassById("Minecraft")`
  - This runs slower than `getClassById` because it has to filter through all classes. Make sure to cache the result rather than calling it over and over again.

### ReflectClass Definition

Each `ReflectClass` has the following properties:

- `binaryName: String?`
  - The binary name of the class in question. Eg: `Lnet.minecraft.client.entity.EntityPlayerSP;`
  - Will be `null` if `hasMeta` is equal to `false`
- `class: Class?`
  - The actual class. Cannot be used easily with `new` keyword, this is mostly useful for extending using `prototype`.
  - Will be `null` if `hasMeta` is equal to `false`
- `compiledName: String`
  - The TeaVM compiled name of the class. It is equal to the first letters of the package, an underscore, and the class name. Eg: `nmce_EntityPlayerSP`
- `constructors: Function[]`
  - The constructors for the class.
- `hasMeta: Boolean`
  - Wether or not the class has metadata saved by TeaVM.
- `id: String?`
  - The class id of the class. Eg: `net.minecraft.client.entity.EntityPlayerSP`
  - Will be `null` if `hasMeta` is equal to `false`
- `name: String`
  - The name of the class. Eg: `EntityPlayerSP`
- `methods: Map<String, ReflectMethod>`
- `staticMethods: Map<String, ReflectMethod>`
- `staticVariableNames: String[]`
  - List of all the static variable names for the class.
- `staticVariables: Map<String, *>`
  - key-value dictionary of all the static variables in a class.
- `superclass: String?`
  - The class id of the class's superclass. Eg: `net.minecraft.client.entity.AbstractClientPlayer`
  - Will be `null` if `hasMeta` is equal to `false`

Each `ReflectClass` has the following methods:

- `instanceOf(object: Object)`
  - Checks if the `object` is an instance of the class.

### ReflectMethod Definition

Each `ReflectMethod` has the following properties:

- `methodName: String`
  - The compiled method name of the method. Eg: `nmce_EntityPlayerSP_closeScreen`.
- `methodNameShort: String`
  - The short name of the method. Eg: `closeScreen`.

Each `ReflectClass` has the following methods:
- `method(...)`
  - This is the java method.
  - If it is an instance method (accessed from a ReflectClasses' `methods` property), the first argument should be an instance of the class. Eg: `ModAPI.reflect.getClassByName("EntityPlayerSP").methods.closeScreen.method(ModAPI.player.getRef())`
  - If it is a static method (accessed from a ReflectClasses' `staticMethods` property), call the method as usual. Eg: `ModAPI.reflect.getClassById("net.minecraft.init.Items").staticMethods.getRegisteredItem.method(ModAPI.util.str("apple"))`