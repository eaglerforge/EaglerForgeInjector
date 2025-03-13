var backgroundLogs = document.createElement("div");
backgroundLogs.style = `
    color: lime;
    opacity: 0.1;
    font-family: monospace;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    overflow: none;
    user-select: none;
    `;
const bgLogsList = [];
document.documentElement.appendChild(backgroundLogs);
var dirty = true;
function backgroundLog(text, unSuppress) {
    var linesExcess = backgroundLogs.scrollHeight - window.innerHeight;
    for (i = 0; i < linesExcess; i++) {
        bgLogsList.shift();
    }
    bgLogsList.push(text);
    dirty = true;
    if (!unSuppress) {
        return;
    }
    dirty = false;
    backgroundLogs.innerText = bgLogsList.join("\n");
}
backgroundLog("Awaiting input...");