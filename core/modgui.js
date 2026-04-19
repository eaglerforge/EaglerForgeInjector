const modapi_guikit = "(" + (() => {

  const splashMessages = [
    "EaglerForge Mod Loader",
    "Powered by ModAPI",
    "Welcome to EaglerForge",
    "Manage Your Mods"
  ];

  function extractMetadata(modtxt) {
    const hash = ModAPI.util.hashCode(modtxt);

    // 1. Try original hash-based metadata
    if (ModAPI.meta._titleMap && ModAPI.meta._titleMap[hash]) {
      return {
        title: ModAPI.meta._titleMap[hash],
        version: (ModAPI.meta._versionMap && ModAPI.meta._versionMap[hash]) || "",
        developer: (ModAPI.meta._developerMap && ModAPI.meta._developerMap[hash]) || "",
        description: (ModAPI.meta._descriptionMap && ModAPI.meta._descriptionMap[hash]) || "",
        icon: (ModAPI.meta._iconMap && ModAPI.meta._iconMap[hash]) || null,
        credits: (ModAPI.meta._creditsMap && ModAPI.meta._creditsMap[hash]) || ""
      };
    }

    // 2. Scan mod text for metadata calls
    const meta = {
      title: null,
      version: "",
      developer: "",
      description: null,
      icon: null,
      credits: ""
    };

    const titleMatch = modtxt.match(/ModAPI\.meta\.title\(["'`](.*?)["'`]\)/);
    if (titleMatch) meta.title = titleMatch[1];

    const descMatch = modtxt.match(/ModAPI\.meta\.description\(["'`](.*?)["'`]\)/);
    if (descMatch) meta.description = descMatch[1];

    const iconMatch = modtxt.match(/ModAPI\.meta\.icon\(["'`](data:image\/.*?)[\"'`]\)/);
    if (iconMatch) meta.icon = iconMatch[1];

    const creditsMatch = modtxt.match(/ModAPI\.meta\.credits\(["'`](.*?)["'`]\)/);
    if (creditsMatch) meta.credits = creditsMatch[1];

    const devMatch = modtxt.match(/ModAPI\.meta\.developer\(["'`](.*?)["'`]\)/);
    if (devMatch) meta.developer = devMatch[1];

    if (meta.title) return meta;

    // 3. No metadata
    return null;
  }

  function fallbackName(modtxt) {
    if (!modtxt) return "Unknown Mod";

    if (modtxt.startsWith("http")) {
      const end = modtxt.split("/").pop() || modtxt;
      return ".../" + end;
    }

    if (modtxt.endsWith(".js")) return modtxt;

    if (modtxt.length > 125) {
      try {
        const m = modtxt.match(/data:text\/\S+?;fs=\S+;/m);
        if (m && m[0]) return m[0];
      } catch (e) {}
      return "Unknown Mod.";
    }

    return modtxt;
  }

  function shorten(str, max = 22) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max - 3) + "..." : str;
  }

  const gui = `
  <div id="modapi_gui_container">

    <header>
      <h1 class="title">Mods</h1>
      <h4>{splash}</h4>
    </header>

    <main class="layout">

      <section class="modlist">
        <div class="modlist_header">Installed Mods</div>
        <div id="modlist_entries" class="modlist_entries"></div>
      </section>

      <section class="details">
        <div id="details_panel" class="details_panel">

          <div class="details_header">
            <img id="details_icon" class="details_icon" src="" />
            <div class="details_header_text">
              <h2 class="details_title">No mod selected</h2>
              <h4 class="details_author"></h4>
            </div>
          </div>

          <div class="details_meta">
            <p><strong>Description:</strong></p>
            <p id="details_description" class="details_desc_long">
              Select a mod from the list to view its details.
            </p>

            <p><strong>URL:</strong> <span id="details_url">None</span></p>
            <p><strong>Credits:</strong> <span id="details_credits">Unknown</span></p>
          </div>

          <button id="details_remove" class="btn remove_btn" style="margin-top:12px; display:none;">
            Remove Mod
          </button>

        </div>
      </section>

    </main>

    <div class="bottom_bar">
      <div class="bottom_left">
        <button class="btn" data-action="upload">Upload Mod (.js)</button>
        <button class="btn" data-action="addurl">Add Mod From URL</button>
        <button class="btn" data-action="clear">Clear All Mods</button>
      </div>

      <div class="bottom_right">
        <button class="btn done_btn" data-action="done">Done</button>
      </div>
    </div>

    <footer>
      <p>Original GUI: <a href="https://github.com/TheIdiotPlays" target="_blank">TheIdiotPlays</a></p>
      <p>Modloader Linker: <a href="https://github.com/ZXMushroom63" target="_blank">ZXMushroom63</a></p>
      <p>API: ZXMushroom63, Leah Anderson, radmanplays</p>
      <p>Enhanced by: <a href="https://github.com/21cookej" target="_blank">21CookeJ</a></p>
    </footer>

    <style>

      :root {
        --bg: #1e1e1e;
        --panel: #2a2a2a;
        --panel2: #242424;
        --text: #ffffff;
        --sub: #bdbdbd;

        --btn-normal: url("https://i.postimg.cc/633JpTtp/pixil-frame-0.png");
        --btn-hover: url("https://i.postimg.cc/NMMqjLBf/pixil-frame-0-(1).png");
        --btn-active: url("https://i.postimg.cc/nzzbhMpV/pixil-frame-0-(2).png");
      }

      #modapi_gui_container {
        position: fixed;
        inset: 0;
        background: var(--bg);
        color: var(--text);
        font-family: system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        z-index: 9999;
      }

      header {
        padding: 12px 20px;
        background: #2c2c2c;
        border-bottom: 1px solid #000;
      }

      .title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 600;
      }

      .layout {
        flex: 1;
        display: flex;
        padding: 12px 20px;
        gap: 12px;
      }

      .modlist {
        width: 320px;
        background: var(--panel);
        border: 1px solid #000;
        display: flex;
        flex-direction: column;
      }

      .modlist_header {
        padding: 8px 12px;
        background: var(--panel2);
        border-bottom: 1px solid #000;
        font-size: 0.9rem;
        color: var(--sub);
      }

      .modlist_entries {
        flex: 1;
        overflow-y: auto;
      }

      .mod_entry {
        padding: 8px 12px;
        border-bottom: 1px solid #111;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mod_entry_icon {
        width: 24px;
        height: 24px;
        image-rendering: pixelated;
        flex-shrink: 0;
      }

      .mod_entry_text {
        display: flex;
        flex-direction: column;
      }

      .mod_entry:hover {
        background: #3a3a3a;
      }

      .mod_entry.selected {
        background: #4a4a4a;
      }

      .details {
        flex: 1;
        background: var(--panel);
        border: 1px solid #000;
      }

      .details_panel {
        padding: 16px;
      }

      .details_header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .details_icon {
        width: 48px;
        height: 48px;
        image-rendering: pixelated;
        display: none;
      }

      .details_title {
        margin: 0;
        font-size: 1.3rem;
      }

      .details_author {
        margin: 2px 0 0 0;
        font-size: 0.9rem;
        color: var(--sub);
      }

      .details_meta p {
        margin: 4px 0;
        color: var(--sub);
      }

      .details_desc_long {
        margin: 6px 0 12px 0;
        color: var(--text);
      }

      .btn {
        width: 160px;
        height: 32px;
        background: var(--btn-normal);
        background-size: cover;
        border: 1px solid #000;
        color: var(--text);
        cursor: pointer;
        box-shadow: 0 2px 0 #000;
        transition: 0.1s;
      }

      .btn:hover {
        background: var(--btn-hover);
      }

      .btn:active {
        background: var(--btn-active);
        transform: translateY(1px);
        box-shadow: 0 1px 0 #000;
      }

      .bottom_bar {
        padding: 10px 20px;
        background: #1a1a1a;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
      }

      footer {
        padding: 10px 20px;
        background: #151515;
        border-top: 1px solid #000;
        font-size: 0.8rem;
        color: var(--sub);
      }

      footer a {
        color: #3fa6ff;
      }
    </style>

  </div>`;

  function selectMod(entry, info, index) {
    document.querySelectorAll(".mod_entry").forEach(e => e.classList.remove("selected"));
    entry.classList.add("selected");

    document.querySelector(".details_title").textContent = info.title;
    document.querySelector(".details_author").textContent = info.developer ? "By " + info.developer : "";
    document.getElementById("details_description").textContent = info.description || "No description.";
    document.getElementById("details_url").textContent = info.url || "None";
    document.getElementById("details_credits").textContent = info.credits || info.developer || "Unknown";

    const iconEl = document.getElementById("details_icon");
    if (info.icon) {
      iconEl.src = info.icon;
      iconEl.style.display = "block";
    } else {
      iconEl.style.display = "none";
    }

    const removeBtn = document.getElementById("details_remove");
    removeBtn.style.display = "block";
    removeBtn.onclick = async () => {
      await removeMod(index);
      window.modapi_displayModGui();
    };
  }

  window.modapi_displayModGui = async function (cb) {
    if (!getMods) return;

    if (document.querySelector("#modapi_gui_container")) {
      cb ||= document.querySelector("#modapi_gui_container")._cb;
      document.querySelector("#modapi_gui_container").remove();
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = gui.replace("{splash}", splashMessages[Math.floor(Math.random() * splashMessages.length)]);
    document.body.appendChild(wrapper);

    wrapper._cb = cb;

    const mods = await getMods();
    const list = document.getElementById("modlist_entries");

    let first = null;

    mods.forEach((modtxt, index) => {
      if (!modtxt) return;

      const meta = extractMetadata(modtxt);

      let title, version, developer, description, icon, credits;

      if (meta) {
        title = meta.title;
        version = meta.version;
        developer = meta.developer;
        description = meta.description;
        icon = meta.icon;
        credits = meta.credits;
      } else {
        title = fallbackName(modtxt);
        version = "";
        developer = "";
        description = "";
        icon = null;
        credits = "";
      }

      const entry = document.createElement("div");
      entry.className = "mod_entry";

      const iconImg = document.createElement("img");
      iconImg.className = "mod_entry_icon";
      if (icon) {
        iconImg.src = icon;
        iconImg.style.display = "block";
      } else {
        iconImg.style.display = "none";
      }

      const textWrap = document.createElement("div");
      textWrap.className = "mod_entry_text";
      textWrap.innerHTML = `
        <div>${shorten(title)}</div>
        <div style="font-size:0.8rem;color:#bdbdbd">${version}</div>
      `;

      entry.appendChild(iconImg);
      entry.appendChild(textWrap);

      const info = {
        title,
        version,
        developer,
        description,
        url: null,
        credits,
        icon
      };

      entry.onclick = () => selectMod(entry, info, index);

      list.appendChild(entry);

      if (!first) first = { entry, info, index };
    });

    if (first) selectMod(first.entry, first.info, first.index);

    document.querySelector("[data-action='upload']").onclick = window.modapi_uploadmod;
    document.querySelector("[data-action='addurl']").onclick = window.modapi_addmod;
    document.querySelector("[data-action='clear']").onclick = window.modapi_clearmods;

    document.querySelector("[data-action='done']").onclick = () => {
      if (cb) cb();
      wrapper.remove();
    };
  };

  window.modapi_clearmods = async () => {
    await resetMods();
    window.modapi_displayModGui();
  };

  window.modapi_addmod = async () => {
    const url = prompt("Paste mod URL:");
    if (!url) return;
    await addMod(url);
    window.modapi_displayModGui();
  };

  async function fileToText(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.addEventListener("error", rej);
      fr.addEventListener("load", () => res(fr.result));
      fr.readAsText(file);
    });
  }

  window.modapi_uploadmod = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "text/javascript";
    input.multiple = true;

    input.oninput = async () => {
      if (input.files.length < 1) return;
      for (const file of input.files) {
        const text = await fileToText(file);
        await addFileMod(file.name, text);
      }
      window.modapi_displayModGui();
    };

    input.click();
  };

}).toString() + ")();";

if (globalThis.process) {
  module.exports = { modapi_guikit };
}
