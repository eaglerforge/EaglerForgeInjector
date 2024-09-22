//SUCCESS - While there is no TeaVM thread actively running, I am able to run an asyncronous function, and get a result.
ModAPI.hooks._teavm.$rt_startThread(() => {
    return ModAPI.hooks.methods.nlevi_PlatformRuntime_downloadRemoteURI(ModAPI.util.str("data:text/plain,hi"))
}, function (...args) { console.log(this, args) })


//WIP - Pausing and resuming client thread
globalThis.suspendTest = function (...args) {
    if (!ModAPI.util.isCritical()) {
        var thread = ModAPI.hooks._teavm.$rt_nativeThread();
        var javaThread = ModAPI.hooks._teavm.$rt_getThread();
        globalThis.testThread = thread;
        console.log("BeforeAnything: ", thread.stack);
        thread.suspend(function () {
            console.log("Pausing for 10 seconds.", thread.stack);
            setTimeout(function () {
                console.log("Resuming...", thread.stack);
                ModAPI.hooks._teavm.$rt_setThread(javaThread);
                thread.resume();
                console.log("After resume: ", thread.stack);
            }, 10000);
        });
    }
    return suspendTest.apply(this, args);
}





function jl_Thread_sleep$_asyncCall_$(millis) {
    var thread = $rt_nativeThread();
    var javaThread = $rt_getThread();
    var callback = function () { };
    callback.$complete = function (val) {
        thread.attribute = val;
        $rt_setThread(javaThread);
        thread.resume();
    };
    callback.$error = function (e) {
        thread.attribute = $rt_exception(e);
        $rt_setThread(javaThread);
        thread.resume();
    };
    callback = otpp_AsyncCallbackWrapper_create(callback);
    thread.suspend(function () {
        try {
            jl_Thread_sleep0(millis, callback);
        } catch ($e) {
            callback.$error($rt_exception($e));
        }
    });
    return null;
}
function jl_Thread_sleep0($millis, $callback) {
    var $current, $handler;
    $current = jl_Thread_currentThread();
    $handler = new jl_Thread$SleepHandler;
    $handler.$thread = $current;
    $handler.$callback = $callback;
    $handler.$scheduleId = otp_Platform_schedule($handler, Long_ge($millis, Long_fromInt(2147483647)) ? 2147483647 : Long_lo($millis));
    $current.$interruptHandler = $handler;
}