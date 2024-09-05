## Quirks in TeaVM
When TeaVM compiles code, it sometimes does strange things.

#### Property Suffixes
TeaVM will add suffixes to some variables, seemingly randomly. An example is the property `inGround` of any entity. When accessing this on the `ModAPI.player.fishEntity` object, TeaVM has renamed it to `inGround2`.

#### Collapsing Methods
When I was trying to hook into the server-side processing of chat messages, I found that chat packets were handled by the method `processChatMessage` in `NetHandlerPlayServer`. However, in the compiled JavaScript, this method no longer exists. This is because it is only used once, in the `processPacket` method of `C01PacketChatMessage`. TeaVM automatically saw this, and collapsed one method into the other.