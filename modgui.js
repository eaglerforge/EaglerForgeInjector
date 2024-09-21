// ModAPI GUI made by TheIdiotPlays
// https://github.com/TheIdiotPlays
(() => {
  var splashes = [
    "Now with A.I.D.S (automatically injected dedicated server)",
    "Only causes death 90% of the time!",
    "HTML is better.",
    "https://github.com/EaglerForge",
    "hey you should check out https://github.com/ZXMushroom63/scratch-gui",
    "99% of people stop gambling before they win big.",
    "Now with free estradiol!"
  ];
  var gui = `<div id="modapi_gui_container">
      <header>
        <h1 class="title">EaglerForge Mod Manager</h1>
        <h4>
          <!-- Now with with A.I.D.S. (automatically injected dedicated server)! -->
           {splash_msg}
        </h4>
        <h5>
          Warning: installing malicious mods can delete your worlds, ip-grab you, or even download more serious malware onto your computer. The EaglerForge developers are not liable for any damage caused by the use of EaglerForge and its related tools.
        </h5>
      </header>

      <table class="modTable">
        <thead>
          <tr>
            <td>
              Mod
            </td>
            <td class="nothing"></td>
            <td>
              Controls
            </td>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>

      <div class="controls">
        <button class="button" onclick="window.modapi_uploadmod()">Upload Mod (.js)</button>
        <button class="button" onclick="window.modapi_addmod()">Add Mod From URL</button>
        <button class="button" style="text-shadow: 0px 0px 10px rgba(255, 0, 0, 0.5)" onclick="window.modapi_clearmods()">Clear All Mods</button>
        <button class="button _doneButton" onclick="this.parentElement.parentElement.remove();">Done</button>
      </div>

      <span>(reload to apply changes)</span>

      <footer>
        <p>
          GUI by <a href="https://github.com/TheIdiotPlays">TheIdiotPlays</a>
        </p>
        <p>
          Modloader linker by
          <a href="https://github.com/ZXMushroom63">ZXMushroom63</a>
        </p>
      </footer>

      <style>
        #modapi_gui_container td:not(.nothing):not(:has(.button)) {
          padding: 0.5rem 1.5rem;
          margin: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        #modapi_gui_container td.nothing {
          user-select: none;
          opacity: 0;
          width: 5rem;
        }
        #modapi_gui_container td {
          text-align: center;
        }
        #modapi_gui_container h4, #modapi_gui_container h5 {
          padding-bottom: 0;
          margin-bottom: 0;
        }
        #modapi_gui_container h5 {
          color: white;
          text-shadow: 0px 0px 10px rgba(255,0,0,0.5);
          font-size: 0.75rem;
        }
        #modapi_gui_container a {
          color: white;
          transition: 1s;
        }
        #modapi_gui_container a:hover {
          color: lightblue;
        }

        #modapi_gui_container {
          overflow-y: scroll;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100vh;
          width: 100vw;
          position: fixed;
          z-index: 9999999999;
          top: 0;
          left: 0;
          font-family: sans-serif;
          background: white;
        }

        #modapi_gui_container header {
          background-color: #333;
          width: 100%;
          padding: 1rem 0;
          text-align: center;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        #modapi_gui_container .title {
          font-size: 3rem;
          margin: 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        #modapi_gui_container .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }

        #modapi_gui_container .button {
          background-color: #555;
          color: white;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        #modapi_gui_container .button:hover {
          background-color: #777;
          transform: translateY(-2px);
        }

        #modapi_gui_container footer {
          width: 100%;
          padding: 1rem;
          background-color: #333;
          text-align: center;
          color: white;
          font-size: 1.25rem;
          box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
        }
      </style>
    </div>`;
    
  async function fileToDataURI(file) {
    return new Promise((res, rej) => {
      var fr = new FileReader();
      fr.addEventListener("error", (e) => { rej(e); });
      fr.addEventListener("load", (e) => { res(fr.result); });
      fr.readAsDataURL(file);
    });
  }
  window.modapi_displayModGui = async function (cb) {
    if (!getMods) {
      return;
    }
    if (document.querySelector("#modapi_gui_container")) {
      cb ||= document.querySelector("#modapi_gui_container")._cb;
      document.querySelector("#modapi_gui_container").remove();
    }

    var element = document.createElement("div");

    element.innerHTML = gui.replace("{splash_msg}", splashes[Math.floor(Math.random() * splashes.length)]);

    document.body.appendChild(element);

    document.querySelector("#modapi_gui_container")._cb = cb;

    var modsList = await getMods();
    var tbody = document.querySelector("#modapi_gui_container .modTable tbody");
    tbody.innerHTML = "";
    modsList.forEach((modtxt, i) => {
      if (!modtxt) { return }
      var hash = ModAPI.util.hashCode(modtxt);
      var tr = document.createElement("tr");
      var mod = document.createElement("td");

      if (ModAPI.meta._titleMap[hash]) {
        //Mod has metadata
        if (ModAPI.meta._iconMap[hash]) {
          var img = document.createElement("img");
          img.style.width = "48px";
          img.style.height = "48px";
          img.style.imageRendering = "pixelated";
          img.src = ModAPI.meta._iconMap[hash];
          mod.appendChild(img);
        }
        var h4 = document.createElement("h4");
        h4.style.margin = 0;
        h4.style.padding = 0;
        h4.innerText = ModAPI.meta._titleMap[hash] + (ModAPI.meta._versionMap[hash] ? " " + ModAPI.meta._versionMap[hash] : "");
        mod.appendChild(h4);
        if (ModAPI.meta._developerMap[hash]) {
          var h6 = document.createElement("h6");
          h6.style.margin = 0;
          h6.style.padding = 0;
          h6.innerText = ModAPI.meta._developerMap[hash];
          mod.appendChild(h6);
        }
        if (ModAPI.meta._descriptionMap[hash]) {
          var span = document.createElement("span");
          span.style.fontSize = "0.65rem";
          span.innerText = ModAPI.meta._descriptionMap[hash];
          mod.appendChild(span);
        }
      } else {
        //Mod does not have metadata
        if (modtxt.length > 125) {
          try {
            mod.innerText = modtxt.match(/data:text\/\S+?;fs=\S+;/m)[0]
          } catch (error) {
            mod.innerText = "Unknown Mod.";
          }
        } else { mod.innerText = modtxt; }
      }

      var spacer = document.createElement("td");
      spacer.classList.add("nothing");
      var controls = document.createElement("td");

      var button = document.createElement("button");
      button.innerText = "Delete";
      button.style.height = "3rem";
      button.style.marginTop = "calc(50% - 1.5rem)";
      button.addEventListener("click", async () => {
        await removeMod(i);
        window.modapi_displayModGui();
      });
      button.classList.add("button");
      controls.appendChild(button);
      tr.appendChild(mod);
      tr.appendChild(spacer);
      tr.appendChild(button);
      tbody.appendChild(tr);
    });
    var once = false;
    if (cb) {
      document.querySelector("#modapi_gui_container ._doneButton").addEventListener("mousedown", ()=>{
        if (once) {
          return;
        }
        once = true;
        cb();
        document.querySelector("#modapi_gui_container").remove();
      })
    }
  }
  
  window.modapi_clearmods = async () => {
    await resetMods();
    window.modapi_displayModGui();
  }
  window.modapi_addmod = async () => {
    var mod = window.prompt("Paste in the URL of the mod you wish to add: ");
    if (!mod || mod.length === 0) {
      return;
    }
    await addMod("web@" + mod);
    window.modapi_displayModGui();
  }
  window.modapi_uploadmod = async () => {
    var f = document.createElement("input");
    f.type = "file";
    f.accept = "text/javascript";
    f.multiple = true;
    f.addEventListener("input", async () => {
      if (f.files.length < 1) {
        return;
      }
      for (let i = 0; i < f.files.length; i++) {
        await addMod("web@" + (await fileToDataURI(f.files[i])).replaceAll(";base64", ";fs=" + f.files[i].name + ";base64"));
      }
      window.modapi_displayModGui();
    });
    f.click();
  }
})();
