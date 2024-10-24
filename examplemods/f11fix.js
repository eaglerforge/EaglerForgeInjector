(() => {
    ModAPI.meta.title("Fullscreen Fixer");
    ModAPI.meta.credits("By ZXMushroom63");
    var oldF11 = HTMLElement.prototype.requestFullscreen;
    HTMLElement.prototype.requestFullscreen = function () {
        if (this instanceof HTMLBodyElement) {
            oldF11.apply(this, []);
        } else {
            document.body.requestFullscreen();
        }
    }
})();