## Quirks in TeaVM
When TeaVM compiles code, it sometimes does strange things.

#### Property Suffixes
TeaVM will add suffixes to some variables, seemingly randomly. An example is the property `inGround` of any entity. When accessing this on the `ModAPI.player.fishEntity` object, TeaVM has renamed it to `inGround2`.

#### Collapsing Methods
When I was trying to hook into the server-side processing of chat messages, I found that chat packets were handled by the method `processChatMessage` in `NetHandlerPlayServer`. However, in the compiled JavaScript, this method no longer exists. This is because it is only used once, in the `processPacket` method of `C01PacketChatMessage`. TeaVM automatically saw this, and collapsed one method into the other.

#### Dedicated Server Not Responding / Client Not Responding
Incorrectly patching methods with ModAPI.hooks (such as returning `false` instead of `0`, or a javascript string without using `ModAPI.str()`) will effectively cause the memory stack to implode, along with all crash handlers. I came across this when I was using the `processcommand` event with preventDefault set to true. I didn't return any value when patching methods for the event being `preventDefault`ed, when the output expected was a java boolean (`0`/`1`). This would cause the dedicated server to freeze/lock up, without triggering any form of crash.

Update 13/09/2024:
Any form of incorrect data type, even passing the wrong values, can cause this sort of hang. I encountered this when trying to set a block in the world to any form of wood or leaf block, without adding iproperties to the tree type.

Update 13/09/2024:
Calling methods while the TeaVM thread is in a critical transition state (see `ModAPI.util.isCritical()`) will shift the call stack, cause methods to access the incorrect values at runtime, and also cause the stack to implode. Gotta love TeaVM.