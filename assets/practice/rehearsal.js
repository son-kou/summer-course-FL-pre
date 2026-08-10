(() => {
  const REHEARSAL_FEATURE_ENABLED = true;
  const params = new URLSearchParams(window.location.search);
  const practiceMode = params.get("practice") === "1";
  if (!REHEARSAL_FEATURE_ENABLED || !practiceMode) return;

  const state = {
    scripts: new Map(),
    activeId: "",
    activeTab: "key",
    lastFocus: null
  };

  const selectorsToIgnore = "input, textarea, select, [contenteditable='true'], iframe";
  const dataUrl = new URL("assets/practice/slide-scripts.json", document.baseURI);

  const button = document.createElement("button");
  button.type = "button";
  button.id = "rehearsal-toggle";
  button.className = "rehearsal-toggle";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "rehearsal-drawer");
  button.textContent = "Rehearsal Notes";

  const drawer = document.createElement("aside");
  drawer.id = "rehearsal-drawer";
  drawer.className = "rehearsal-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "Bilingual rehearsal notes");
  drawer.setAttribute("hidden", "");
  drawer.innerHTML = `
    <div class="rehearsal-head">
      <div>
        <p class="rehearsal-kicker">Bilingual rehearsal</p>
        <h2 id="rehearsal-title">Rehearsal Notes</h2>
        <p id="rehearsal-meta"></p>
      </div>
      <button type="button" class="rehearsal-close" aria-label="Close rehearsal notes">Close</button>
    </div>
    <div class="rehearsal-tabs" role="tablist" aria-label="Rehearsal note sections">
      <button type="button" role="tab" aria-selected="true" data-tab="key">Key points</button>
      <button type="button" role="tab" aria-selected="false" data-tab="en">English script</button>
      <button type="button" role="tab" aria-selected="false" data-tab="zh">中文讲稿</button>
      <button type="button" role="tab" aria-selected="false" data-tab="delivery">Delivery</button>
    </div>
    <div class="rehearsal-content" tabindex="-1"></div>
    <div class="rehearsal-actions">
      <button type="button" class="rehearsal-exit">Exit rehearsal</button>
      <span>Alt+R toggles · Esc closes</span>
    </div>
  `;

  document.body.append(button, drawer);

  const titleEl = drawer.querySelector("#rehearsal-title");
  const metaEl = drawer.querySelector("#rehearsal-meta");
  const contentEl = drawer.querySelector(".rehearsal-content");
  const closeButton = drawer.querySelector(".rehearsal-close");
  const exitButton = drawer.querySelector(".rehearsal-exit");
  const tabButtons = [...drawer.querySelectorAll("[data-tab]")];

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec ? `${min}m ${sec}s` : `${min}m`;
  }

  function currentSlideId() {
    if (!window.Reveal) return "";
    const current = Reveal.getCurrentSlide();
    if (!current) return "";
    if (current.id) return current.id;
    const stack = current.closest(".stack[id]");
    return stack ? stack.id : "";
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function panelFor(script) {
    if (!script) {
      return `<p>No rehearsal notes are available for this backup slide.</p>`;
    }
    if (state.activeTab === "en") {
      return `
        <section>
          <h3>English script</h3>
          <p>${script.scriptEn}</p>
          <h3>Transition</h3>
          <p>${script.transitionEn}</p>
        </section>
      `;
    }
    if (state.activeTab === "zh") {
      return `
        <section lang="zh-Hans">
          <h3>中文讲稿</h3>
          <p>${script.scriptZh}</p>
          <h3>过渡句</h3>
          <p>${script.transitionZh}</p>
        </section>
      `;
    }
    if (state.activeTab === "delivery") {
      const interaction = script.interactionNotes && script.interactionNotes.length
        ? `<h3>Interaction notes</h3>${list(script.interactionNotes)}`
        : "";
      return `
        <section>
          <h3>Delivery note</h3>
          <p>${script.delivery || "No special delivery note."}</p>
          ${interaction}
          <h3>Skip if late</h3>
          <p>${script.skipIfLate || "No skip note."}</p>
        </section>
      `;
    }
    return `
      <section>
        <h3>English key points</h3>
        ${list(script.keyPointsEn)}
        <h3 lang="zh-Hans">中文要点</h3>
        ${list(script.keyPointsZh)}
      </section>
    `;
  }

  function updateDrawer() {
    state.activeId = currentSlideId();
    const script = state.scripts.get(state.activeId);
    titleEl.textContent = script ? `${script.slideNumber}. ${script.title}` : "Backup slide";
    metaEl.textContent = script ? `Target time: ${formatTime(script.targetSeconds)} · Slide ID: ${script.id}` : `Slide ID: ${state.activeId || "unknown"}`;
    contentEl.innerHTML = panelFor(script);
  }

  function focusable() {
    return [...drawer.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function openDrawer() {
    state.lastFocus = document.activeElement;
    drawer.removeAttribute("hidden");
    button.setAttribute("aria-expanded", "true");
    updateDrawer();
    closeButton.focus();
  }

  function closeDrawer() {
    drawer.setAttribute("hidden", "");
    button.setAttribute("aria-expanded", "false");
    if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function toggleDrawer() {
    if (drawer.hasAttribute("hidden")) openDrawer();
    else closeDrawer();
  }

  function exitRehearsal() {
    const url = new URL(window.location.href);
    url.searchParams.delete("practice");
    window.location.href = url.toString();
  }

  button.addEventListener("click", toggleDrawer);
  closeButton.addEventListener("click", closeDrawer);
  exitButton.addEventListener("click", exitRehearsal);
  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      tabButtons.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      updateDrawer();
      contentEl.focus();
    });
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isInteractive = target && target.closest && target.closest(selectorsToIgnore);
    if (event.altKey && (event.key === "r" || event.key === "R") && !isInteractive) {
      event.preventDefault();
      toggleDrawer();
      return;
    }
    if (event.key === "Escape" && !drawer.hasAttribute("hidden")) {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key === "Tab" && !drawer.hasAttribute("hidden")) {
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function bindReveal() {
    if (!window.Reveal) return;
    Reveal.on("ready", updateDrawer);
    Reveal.on("slidechanged", updateDrawer);
    Reveal.on("fragmentshown", updateDrawer);
    Reveal.on("fragmenthidden", updateDrawer);
    updateDrawer();
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${dataUrl}`);
      return response.json();
    })
    .then((data) => {
      data.slides.forEach((script) => state.scripts.set(script.id, script));
      if (window.Reveal && Reveal.isReady && Reveal.isReady()) bindReveal();
      else document.addEventListener("DOMContentLoaded", bindReveal);
    })
    .catch((error) => {
      console.error(error);
      contentEl.innerHTML = `<p>Rehearsal notes could not be loaded.</p>`;
    });
})();
