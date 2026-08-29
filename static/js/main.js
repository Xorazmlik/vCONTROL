const API = "/api";

let selectedGpio = null;
let selectedAction = "ON";
let pollTimer = null;

// Oxirgi so'ralgan ma'lumotlar keshi — til almashtirilganda serverga
// qayta murojaat qilmasdan, xuddi shu ma'lumotni yangi tilda qayta chizish uchun.
let currentSettings = null;
let currentRules = [];
let currentPins = [];
let currentHistory = [];
let lastStatus = null;
let pendingRestartNote = false;

/* ---------- Yordamchi funksiyalar ---------- */

async function apiRequest(url, options) {
  const res = await fetch(url, options);
  let data = {};
  try { data = await res.json(); } catch (e) { /* body bo'lmasligi mumkin */ }
  if (!res.ok) {
    const message = data.error_code ? tError(data.error_code, data.params) : tError("unknown");
    throw new Error(message);
  }
  return data;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Til almashtirish ---------- */

function applyStaticTranslations() {
  document.title = t("page_title");
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.getAttribute("data-i18n-title"));
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.lang === currentLang);
  });
}

function setLanguage(lang) {
  if (lang !== "uz" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("ovc_lang", lang);

  applyStaticTranslations();
  renderPinHeader();
  renderRulesTable();
  updateSubtitle();
  if (currentSettings) {
    renderModelToggle();
    renderWiringTable();
  }
  lastMonitorSignature = ""; // majburiy qayta chizish, til o'zgargani uchun
  renderMonitor(currentHistory);
  if (lastStatus) applyStatusText(lastStatus);

  // Vaqtinchalik forma xatoliklari (formError/micError) biror kod+parametrga
  // bog'lanmagan holda saqlanadi, shuning uchun ularni eski tilda qoldirish
  // o'rniga tozalaymiz — keyingi urinishda to'g'ri tilda qayta chiqadi.
  document.getElementById("formError").textContent = "";
  document.getElementById("micError").textContent = "";
}

/* ---------- GPIO pin-header tanlagichi ---------- */

async function loadPinHeader() {
  currentPins = await apiRequest(`${API}/gpio/available`);
  renderPinHeader();
}

function renderPinHeader() {
  const container = document.getElementById("pinHeader");
  container.innerHTML = "";

  currentPins.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pin-btn" + (p.used ? " used" : "");
    btn.textContent = p.gpio;
    btn.title = `GPIO ${p.gpio} (${p.physical ? "Pin " + p.physical : ""}) ` +
      (p.used ? t("pin_used") : t("pin_free"));
    btn.dataset.gpio = p.gpio;
    btn.addEventListener("click", () => {
      selectedGpio = p.gpio;
      document.getElementById("gpioValue").value = p.gpio;
      container.querySelectorAll(".pin-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    container.appendChild(btn);
  });

  if (selectedGpio !== null) {
    const match = container.querySelector(`[data-gpio="${selectedGpio}"]`);
    if (match) match.classList.add("selected");
  }
}

/* ---------- Amal (ON/OFF) tanlagichi ---------- */

function setupActionToggle() {
  const buttons = document.querySelectorAll(".action-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAction = btn.dataset.action;
      document.getElementById("actionValue").value = selectedAction;
    });
  });
}

/* ---------- Serial Monitor ---------- */

let lastMonitorSignature = "";

function renderMonitor(history) {
  history = history || [];
  const signature = currentLang + "|" + history.map((h) => h.time + h.text).join("|");
  if (signature === lastMonitorSignature) return; // hech narsa o'zgarmagan
  lastMonitorSignature = signature;

  const container = document.getElementById("serialMonitor");
  const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;

  if (history.length === 0) {
    container.innerHTML = `<p class="monitor-empty">${escapeHtml(t("monitor_empty"))}</p>`;
    return;
  }

  container.innerHTML = "";
  history.forEach((h) => {
    const row = document.createElement("div");
    row.className = "monitor-row" + (h.matched ? " matched" : "");
    row.title = t("monitor_row_title");
    row.innerHTML = `
      <span class="monitor-time">${h.time}</span>
      <span class="monitor-text">"${escapeHtml(h.text)}"</span>
      <span class="monitor-arrow">${h.matched ? `\u2192 GPIO ${h.gpio} (${h.action})` : escapeHtml(t("monitor_no_match"))}</span>
      <button type="button" class="monitor-use-btn">${escapeHtml(t("monitor_use_btn"))}</button>
    `;
    row.addEventListener("click", () => useRecognizedWord(h.text, row.querySelector(".monitor-use-btn")));
    container.appendChild(row);
  });

  if (wasAtBottom) container.scrollTop = container.scrollHeight;
}

function useRecognizedWord(text, btnEl) {
  const input = document.getElementById("wordInput");
  input.value = text;
  document.querySelector(".module-form").scrollIntoView({ behavior: "smooth", block: "start" });
  input.focus();
  copyToClipboard(text);

  if (btnEl) {
    const original = btnEl.textContent;
    btnEl.textContent = t("monitor_use_done");
    btnEl.classList.add("copied");
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove("copied");
    }, 1200);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* jim tursin */ }
  document.body.removeChild(ta);
}

/* ---------- Qurilma va mikrofon sozlamalari ---------- */

async function loadSettings() {
  currentSettings = await apiRequest(`${API}/settings`);
  renderModelToggle();
  renderWiringTable();
  fillMicEditFields();
  updateSubtitle();
}

function updateSubtitle() {
  const info = currentSettings && currentSettings.available_models
    ? currentSettings.available_models[currentSettings.pi_model]
    : null;
  const modelLabel = info ? info.label : "Raspberry Pi";
  document.getElementById("subtitle").textContent = `${modelLabel} \u00b7 INMP441 \u00b7 Vosk (${t("offline")})`;
}

function renderModelToggle() {
  const container = document.getElementById("modelToggle");
  container.innerHTML = "";
  const models = currentSettings.available_models;
  Object.keys(models).forEach((key) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "model-btn" + (currentSettings.pi_model === key ? " selected" : "");
    btn.textContent = models[key].label;
    btn.addEventListener("click", () => selectModel(key));
    container.appendChild(btn);
  });
  updateModelNote();
}

function updateModelNote() {
  const noteEl = document.getElementById("modelNote");
  const info = currentSettings.available_models[currentSettings.pi_model];
  let text = "";
  if (info && info.needs_lgpio) {
    text = t("pi5_note");
    noteEl.classList.add("warn");
  } else {
    noteEl.classList.remove("warn");
  }
  if (pendingRestartNote) {
    text += (text ? " " : "") + t("restart_required_note");
  }
  noteEl.textContent = text;
}

async function selectModel(key) {
  try {
    currentSettings = await apiRequest(`${API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pi_model: key }),
    });
    pendingRestartNote = !!currentSettings.restart_required;
    renderModelToggle();
    updateSubtitle();
  } catch (err) {
    alert(err.message);
  }
}

function renderWiringTable() {
  const body = document.getElementById("wiringBody");
  const mp = currentSettings.mic_pins;
  const phys = currentSettings.mic_pins_physical;
  body.innerHTML = `
    <tr><td>VDD</td><td>3.3V</td><td>Pin 1</td></tr>
    <tr><td>GND</td><td>GND</td><td>Pin 9</td></tr>
    <tr><td>L/R</td><td>GND</td><td>Pin 9</td></tr>
    <tr><td>SCK (BCLK)</td><td>GPIO ${mp.sck}</td><td>Pin ${phys.sck}</td></tr>
    <tr><td>WS (LRCLK)</td><td>GPIO ${mp.ws}</td><td>Pin ${phys.ws}</td></tr>
    <tr><td>SD (DIN)</td><td>GPIO ${mp.sd}</td><td>Pin ${phys.sd}</td></tr>
  `;
}

function fillMicEditFields() {
  document.getElementById("micSck").value = currentSettings.mic_pins.sck;
  document.getElementById("micWs").value = currentSettings.mic_pins.ws;
  document.getElementById("micSd").value = currentSettings.mic_pins.sd;
}

async function saveMicPins() {
  const errorEl = document.getElementById("micError");
  errorEl.textContent = "";
  const sck = Number(document.getElementById("micSck").value);
  const ws = Number(document.getElementById("micWs").value);
  const sd = Number(document.getElementById("micSd").value);

  try {
    currentSettings = await apiRequest(`${API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mic_pins: { sck, ws, sd } }),
    });
    renderWiringTable();
    await loadRules(); // band GPIO ro'yxati o'zgargani uchun pin-headerni yangilaymiz
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

/* ---------- Qoidalar jadvali ---------- */

async function loadRules() {
  currentRules = await apiRequest(`${API}/commands`);
  renderRulesTable();
  await loadPinHeader();
}

function renderRulesTable() {
  const tbody = document.getElementById("rulesBody");
  const emptyState = document.getElementById("emptyState");
  const countEl = document.getElementById("ruleCount");

  tbody.innerHTML = "";
  countEl.textContent = currentRules.length ? `(${currentRules.length})` : "";
  emptyState.style.display = currentRules.length ? "none" : "block";

  currentRules
    .slice()
    .sort((a, b) => a.gpio - b.gpio)
    .forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>GPIO ${r.gpio}</td>
        <td>${escapeHtml(r.word)}</td>
        <td><span class="badge badge-${r.action.toLowerCase()}">${r.action}</span></td>
        <td><button class="btn-delete" data-id="${r.id}">${escapeHtml(t("btn_delete"))}</button></td>
      `;
      tbody.appendChild(tr);
    });

  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteRule(btn.dataset.id));
  });
}

async function addRule(event) {
  event.preventDefault();
  const errorEl = document.getElementById("formError");
  errorEl.textContent = "";

  const gpio = document.getElementById("gpioValue").value;
  const word = document.getElementById("wordInput").value.trim();
  const action = document.getElementById("actionValue").value;

  if (!gpio) {
    errorEl.textContent = t("err_select_gpio");
    return;
  }
  if (!word) {
    errorEl.textContent = t("err_enter_word");
    return;
  }

  try {
    await apiRequest(`${API}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpio: Number(gpio), word, action }),
    });
    document.getElementById("wordInput").value = "";
    document.getElementById("wordInput").focus();
    await loadRules();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

async function deleteRule(id) {
  if (!confirm(t("confirm_delete"))) return;
  try {
    await apiRequest(`${API}/commands/${id}`, { method: "DELETE" });
    await loadRules();
  } catch (err) {
    alert(err.message);
  }
}

/* ---------- Dvigatel holati (polling) ---------- */

function applyStatusText(status) {
  const btn = document.getElementById("engineToggleBtn");
  const waveform = document.getElementById("waveform");
  const statusText = document.getElementById("statusText");
  const modelLed = document.getElementById("modelLed");
  const simLed = document.getElementById("simLed");

  btn.disabled = false;

  if (status.running) {
    btn.textContent = t("btn_stop");
    btn.classList.remove("is-off");
    waveform.classList.add("is-listening");
    statusText.textContent = status.simulation_mode ? t("listening_sim") : t("listening");
  } else {
    btn.textContent = t("btn_start");
    btn.classList.add("is-off");
    waveform.classList.remove("is-listening");
    statusText.textContent = status.model_loaded ? t("stopped") : t("model_missing_status");
    if (!status.model_loaded) btn.disabled = true;
  }

  modelLed.className = "led-status " + (status.model_loaded ? "led-on" : "led-off");
  simLed.className = "led-status " + (status.simulation_mode ? "led-warn" : "led-on");

  document.getElementById("liveWord").textContent = status.last_recognized || "\u2014";
  document.getElementById("footerModel").textContent = status.model_loaded
    ? t("model_loaded_footer")
    : t("model_missing_footer");

  document.getElementById("engineError").textContent =
    (!status.running && status.last_error_code)
      ? tError(status.last_error_code, { detail: status.last_error_detail })
      : "";
}

async function toggleEngine() {
  const btn = document.getElementById("engineToggleBtn");
  const errorEl = document.getElementById("engineError");
  errorEl.textContent = "";
  btn.disabled = true;
  try {
    const status = await apiRequest(`${API}/engine/status`);
    if (status.running) {
      await apiRequest(`${API}/engine/stop`, { method: "POST" });
    } else {
      await apiRequest(`${API}/engine/start`, { method: "POST" });
    }
  } catch (err) {
    errorEl.textContent = err.message;
  }
  await pollStatus();
  btn.disabled = false;
}

async function pollStatus() {
  try {
    const status = await apiRequest(`${API}/engine/status`);
    lastStatus = status;
    applyStatusText(status);
    currentHistory = status.history || [];
    renderMonitor(currentHistory);
  } catch (err) {
    console.error(err);
  }
}

/* ---------- Ishga tushirish ---------- */

document.getElementById("addRuleForm").addEventListener("submit", addRule);
document.getElementById("engineToggleBtn").addEventListener("click", toggleEngine);
document.getElementById("saveMicBtn").addEventListener("click", saveMicPins);
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});
setupActionToggle();

applyStaticTranslations();
loadSettings();
loadRules();
pollStatus();
pollTimer = setInterval(pollStatus, 1500);
