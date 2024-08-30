globalThis.modapi_guikit = `// ModAPI GUI made by TheIdiotPlays
// https://github.com/TheIdiotPlays
(()=>{
    var splashes = [
         "Now with A.I.D.S (automatically injected dedicated server)",
         "Only causes death 90% of the time!",
         "HTML is better.", 
         "https://github.com/EaglerForge",
         "hey you should check out https://github.com/ZXMushroom63/scratch-gui",
         "99% of people stop gambling before they win big."
        ];
    var gui = \`<div id="modapi_gui_container">
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
              URL
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
        <button class="button" onclick="this.parentElement.parentElement.remove();">Done</button>
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
    </div>\`;
    window.modapi_displayModGui = async function () {
        if (!getMods) {
            return;
        }
        if (document.querySelector("#modapi_gui_container")) {
            document.querySelector("#modapi_gui_container").remove();
        }
        var element = document.createElement("div");
        
        element.innerHTML = gui.replace("{splash_msg}", splashes[Math.floor(Math.random() * splashes.length)]);

        document.body.appendChild(element);

        var modsList = await getMods();
        var tbody = document.querySelector("#modapi_gui_container .modTable tbody");
        tbody.innerHTML = "";
        modsList.forEach((modtxt, i) => {
            var tr = document.createElement("tr");
            var mod = document.createElement("td");
            mod.innerText = modtxt;
            var spacer = document.createElement("td");
            spacer.appendChild("nothing");
            var controls = document.createElement("td");

            var button = document.createElement("button");
            button.classList.add("button");
            controls.appendChild(button);
            tr.appendChild(mod);
            tr.appendChild(spacer);
            tr.appendChild(button);
            tbody.appendChild(tr);
        });
        
    }
})();`;