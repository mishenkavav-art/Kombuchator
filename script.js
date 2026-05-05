const goals = [
  { id: "gentle", icon: "🌿", title: "jemný čajíček", note: "Lehká, jemná chuť.", percent: 0.10, days: "3–5 dní", tasteDay: "4.–5. den" },
  { id: "balanced", icon: "🥃", title: "kombucha jak má být", note: "Vyvážený standard.", percent: 0.13, days: "4–7 dní", tasteDay: "3.–4. den" },
  { id: "tangy", icon: "🍹", title: "kyselejší limonáda", note: "Výraznější říz.", percent: 0.15, days: "6–9 dní", tasteDay: "3. den" },
  { id: "starter", icon: "🫙", title: "startér pro příště", note: "Kyselost je cíl.", percent: 0.18, days: "8+ dní", tasteDay: "5. den" },
  { id: "enemy", icon: "☠️", title: "kyselina pro nepřítele", note: "Spíš čistič než pití.", percent: 0.20, days: "varování", tasteDay: "2. den" }
];

const starterTypes = {
  weak: { label: "slabý", score: -1, taste: "4.–5. den", text: "Bude trvat, než se nakopne." },
  sweet: { label: "sladký", score: -1, taste: "4.–5. den", text: "Tohle je ještě tlamolep, ne motor." },
  normal: { label: "běžný", score: 0, taste: "3.–4. den", text: "Bezpečný standard." },
  vinegar: { label: "octový", score: 2, taste: "2.–3. den", text: "Tohle vystřelí jak raketa." },
  unknown: { label: "nevím", score: 0, taste: "3.–4. den", text: "Dám bezpečný default podle cíle." }
};

const teaTypes = {
  black: { label: "černý", icon: "🍃", main: true, grams: 6 },
  green: { label: "zelený", icon: "🌱", main: true, grams: 5 },
  white: { label: "bílý", icon: "🍂", main: true, grams: 5 },
  oolong: { label: "oolong", icon: "🫖", main: true, grams: 6 },
  rooibos: { label: "rooibos", icon: "🧡", main: false, grams: 6 },
  hibiscus: { label: "ibišek", icon: "🌺", main: false, grams: 3 },
  fruit: { label: "ovocný", icon: "🍓", main: false, grams: 3 },
  herbal: { label: "bylinný", icon: "🌼", main: false, grams: 3 }
};

const pellicles = {
  jelly: { label: "medůzka", icon: "🪼", score: 0.5 },
  palm: { label: "do dlaně", icon: "🥞", score: 1 },
  pancake: { label: "palačinka", icon: "🥞", score: 1.5 },
  tractor: { label: "UFO", icon: "🛞", score: 2 }
};

let teaIdCounter = 0;

function createTeaId() {
  teaIdCounter += 1;
  return `tea-${teaIdCounter}`;
}

const state = {
  mode: "classic",
  goal: "tangy",
  starterType: "normal",
  teas: [
    { id: createTeaId(), enabled: true, type: "black", role: "main", grams: 6, waterMl: "" },
    { id: createTeaId(), enabled: true, type: "green", role: "main", grams: 5, waterMl: "" }
  ],
  pellicleSize: "pancake",
  pellicleCount: 1,
  sugarSource: "perLiter"
};

const els = {
  goalGrid: document.querySelector("#goalGrid"),
  goalStrip: document.querySelector("#goalStrip"),
  volumeTitle: document.querySelector("#volumeTitle"),
  jarLiters: document.querySelector("#jarLiters"),
  targetLiters: document.querySelector("#targetLiters"),
  volumeHint: document.querySelector("#volumeHint"),
  starterMl: document.querySelector("#starterMl"),
  starterType: document.querySelector("#starterType"),
  starterHint: document.querySelector("#starterHint"),
  teaList: document.querySelector("#teaList"),
  addTeaBtn: document.querySelector("#addTeaBtn"),
  teaWarning: document.querySelector("#teaWarning"),
  usePellicle: document.querySelector("#usePellicle"),
  pellicleControls: document.querySelector("#pellicleControls"),
  pellicleSize: document.querySelector("#pellicleSize"),
  pellicleMinus: document.querySelector("#pellicleMinus"),
  pelliclePlus: document.querySelector("#pelliclePlus"),
  pellicleCountLabel: document.querySelector("#pellicleCountLabel"),
  pellicleGrams: document.querySelector("#pellicleGrams"),
  pellicleHint: document.querySelector("#pellicleHint"),
  sugarPanel: document.querySelector("#sugarPanel"),
  sugarPerLiter: document.querySelector("#sugarPerLiter"),
  sugarTotal: document.querySelector("#sugarTotal"),
  sugarSlider: document.querySelector("#sugarSlider"),
  sugarStatus: document.querySelector("#sugarStatus"),
  needsList: document.querySelector("#needsList"),
  predictionTitle: document.querySelector("#predictionTitle"),
  predictionText: document.querySelector("#predictionText"),
  intensityDots: document.querySelector("#intensityDots"),
  recommendations: document.querySelector("#recommendations"),
  howItWorksBtn: document.querySelector("#howItWorksBtn"),
  howItWorksDialog: document.querySelector("#howItWorksDialog"),
  closeDialog: document.querySelector("#closeDialog")
};

function numberValue(input, fallback = 0) {
  const value = Number(String(input.value).replace(",", "."));
  return Number.isFinite(value) ? value : fallback;
}

function roundLiters(n) {
  return `${(Math.round(n * 10) / 10).toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} l`;
}

function roundMl(n) {
  return `${Math.round(n / 10) * 10} ml`;
}

function approxRange(n, step = 5) {
  const low = Math.max(0, Math.floor((n - step / 2) / step) * step);
  const high = Math.ceil((n + step / 2) / step) * step;
  return low === high ? `cca ${low} g` : `cca ${low}–${high} g`;
}

function renderChoices() {
  els.goalGrid.innerHTML = goals.map(goal => `
    <button class="goal-card ${state.goal === goal.id ? "active" : ""}" type="button" data-goal="${goal.id}">
      <span class="icon">${goal.icon}</span>
      <strong>${goal.title}</strong>
      <small>${goal.note}</small>
    </button>
  `).join("");

  els.starterType.innerHTML = Object.entries(starterTypes).map(([id, item]) => `
    <button class="${state.starterType === id ? "active" : ""}" type="button" data-starter="${id}">${item.label}</button>
  `).join("");

  els.pellicleSize.innerHTML = Object.entries(pellicles).map(([id, item]) => `
    <button class="pellicle-card ${state.pellicleSize === id ? "active" : ""}" type="button" data-pellicle="${id}">
      <span class="icon">${item.icon}</span>
      <strong>${item.label}</strong>
    </button>
  `).join("");
}

function renderTeas() {
  els.teaList.innerHTML = state.teas.map(tea => `
    <div class="tea-row" data-tea-id="${tea.id}">
      <input class="tea-check" type="checkbox" ${tea.enabled ? "checked" : ""} aria-label="Použít čaj">
      <select class="tea-type">
        ${Object.entries(teaTypes).map(([id, item]) => `<option value="${id}" ${tea.type === id ? "selected" : ""}>${item.icon} ${item.label}</option>`).join("")}
      </select>
      <select class="tea-role" title="Role čaje">
        <option value="main" ${tea.role === "main" ? "selected" : ""}>hlavní</option>
        <option value="extra" ${tea.role === "extra" ? "selected" : ""}>přídavný</option>
      </select>
      <input class="tea-grams" type="number" min="0" step="0.5" value="${tea.grams}" aria-label="Gramáž v g/l">
      <input class="tea-water" type="number" min="0" step="50" value="${tea.waterMl}" placeholder="voda ml" aria-label="Objem vody v ml">
      <button class="remove-tea" type="button" aria-label="Odebrat čaj">×</button>
    </div>
  `).join("");
}

function calculate() {
  const jarLiters = numberValue(els.jarLiters, 3);
  const targetLiters = numberValue(els.targetLiters, 0);
  const usesTarget = targetLiters > 0;
  const workingLiters = usesTarget ? targetLiters : Math.max(0, jarLiters * 0.9);
  const neededJar = workingLiters / 0.9;
  const goal = goals.find(item => item.id === state.goal) || goals[1];
  const starterType = starterTypes[state.starterType];
  let starterMl = numberValue(els.starterMl, 0);
  if (state.starterType === "unknown" || starterMl <= 0) starterMl = workingLiters * goal.percent * 1000;
  const starterLiters = starterMl / 1000;
  const teaLiters = Math.max(0, workingLiters - starterLiters);
  const enabledTeas = state.teas.filter(tea => tea.enabled);
  const teaWaterTotalMl = enabledTeas.reduce((sum, tea) => sum + (Number(tea.waterMl) || 0), 0);
  const autoWater = teaWaterTotalMl <= 0;
  const perTeaWater = autoWater && enabledTeas.length ? teaLiters * 1000 / enabledTeas.length : 0;
  const teaItems = enabledTeas.map(tea => {
    const waterMl = autoWater ? perTeaWater : Number(tea.waterMl) || 0;
    return { ...tea, waterMl, gramsTotal: waterMl / 1000 * (Number(tea.grams) || teaTypes[tea.type].grams) };
  });
  const teaTotalGrams = teaItems.reduce((sum, tea) => sum + tea.gramsTotal, 0);
  const sugarPerLiter = state.sugarSource === "total" && numberValue(els.sugarTotal, 0) > 0
    ? numberValue(els.sugarTotal, 0) / Math.max(teaLiters, 0.1)
    : numberValue(els.sugarPerLiter, 65);
  const sugarTotal = sugarPerLiter * teaLiters;
  const starterPercent = workingLiters > 0 ? starterLiters / workingLiters * 100 : 0;
  const mainTeaMl = teaItems.filter(tea => tea.role === "main" && teaTypes[tea.type].main).reduce((sum, tea) => sum + tea.waterMl, 0);
  const onlyExtraTea = teaItems.length > 0 && mainTeaMl === 0;
  const teaScore = teaItems.reduce((max, tea) => Math.max(max, Number(tea.grams) || 0), 0);
  const sugarScore = sugarPerLiter < 50 ? -1 : sugarPerLiter > 80 ? 1 : 0;
  const starterScore = starterPercent > 25 ? 2 : starterPercent > 16 ? 1 : starterPercent < 9 ? -1 : 0;
  const sourScore = starterType.score + starterScore + sugarScore + (goal.id === "starter" ? 2 : goal.id === "enemy" ? 3 : goal.id === "tangy" ? 1 : 0);
  const intensity = Math.max(1, Math.min(5, 3 + sourScore));

  return { jarLiters, targetLiters, usesTarget, workingLiters, neededJar, goal, starterType, starterMl, starterLiters, teaLiters, teaItems, teaTotalGrams, sugarPerLiter, sugarTotal, starterPercent, onlyExtraTea, teaScore, intensity };
}

function updateVolumeHint(calc) {
  if (calc.usesTarget) {
    els.volumeHint.textContent = `Na ${roundLiters(calc.workingLiters)} kombuchy potřebuješ nádobu alespoň ${roundLiters(calc.neededJar)}.`;
  } else {
    els.volumeHint.textContent = `Do nádoby o velikosti ${roundLiters(calc.jarLiters)} připrav cca ${roundLiters(calc.workingLiters)} kombuchy.`;
  }
}

function updateStarter(calc) {
  const warnings = [];
  if (calc.starterLiters > calc.workingLiters) warnings.push("Startér přesahuje pracovní objem. Tohle by neutáhl ani Kaprfíld.");
  else if (calc.starterPercent > 40) warnings.push("Tohle je cesta do kombuchového pekla. Uber startér nebo počítej s octem.");
  else if (calc.starterPercent > 25) warnings.push("Tohle už je trošku přes čáru. Pojede to rychle.");
  els.starterHint.textContent = `${calc.starterType.text} Startér tvoří cca ${Math.round(calc.starterPercent)} %. ${warnings.join(" ")}`;
}

function updateTea(calc) {
  const messages = [];
  if (!calc.teaItems.length) messages.push("Koukej doplnit čaj, pač jinak z toho nic nevyčaruje ani Kaprfíld.");
  if (calc.onlyExtraTea) messages.push("Tímhle SCOBY nenakrmíš. Přidej černý, zelený, bílý čaj nebo oolong.");
  if (calc.teaScore > 9) messages.push("Tohle by porazilo i orla v letu.");
  else if (calc.teaScore > 7) messages.push("Silný jako noha od stolu.");
  else if (calc.teaScore < 4 && calc.teaItems.length) messages.push("Slabej odvar.");
  els.teaWarning.textContent = messages.join(" ");
}

function updatePellicle(calc) {
  els.pellicleControls.hidden = !els.usePellicle.checked;
  els.pellicleCountLabel.textContent = state.pellicleCount;
  if (!els.usePellicle.checked) {
    els.pellicleHint.textContent = "Bez placky to jde, když máš kvalitní kyselý startér.";
    return;
  }
  const score = pellicles[state.pellicleSize].score * state.pellicleCount;
  const idealMin = calc.workingLiters <= 1.5 ? 0.5 : calc.workingLiters <= 3 ? 1 : calc.workingLiters <= 5 ? 2 : 3;
  const idealMax = calc.workingLiters <= 1.5 ? 1 : calc.workingLiters <= 3 ? 2 : calc.workingLiters <= 5 ? 3 : 4;
  let text = "Placka akorát, jedeš v normálu.";
  if (score < idealMin) text = "Tohle množství jedna placka neutáhne. Přidej placku nebo víc kvalitního startéru.";
  if (score > idealMax) text = "Na velikosti v tomhle případě fakt nezáleží. Hlavní síla je ve startéru.";
  els.pellicleHint.textContent = `${text} Síla placky: ${score} bodu.`;
}

function updateSugar(calc) {
  const statuses = [
    ["sad", "☹️", "SCOBY na dietě, brzy bude mít hlad", calc.sugarPerLiter < 50],
    ["ok", "🙂", "SCOBY si bude spokojeně pomlaskávat", calc.sugarPerLiter >= 50 && calc.sugarPerLiter <= 80],
    ["scared", "😨", "SCOBY dostane cukrovku", calc.sugarPerLiter > 80]
  ];
  els.sugarStatus.innerHTML = statuses.map(([, icon, text, active]) => `<div class="${active ? "active" : ""}">${icon}<br>${text}</div>`).join("");
}

function updateOutputs(calc) {
  const teaLines = calc.teaItems.map(tea => {
    const label = teaTypes[tea.type].label;
    return `<li>${roundLiters(tea.waterMl / 1000)} ${label} čaje, ${approxRange(tea.gramsTotal, 1).replace("cca ", "cca ")} čaje</li>`;
  }).join("");
  const pellicleLine = els.usePellicle.checked ? `<li>${state.pellicleCount}× placka ${pellicles[state.pellicleSize].label}</li>` : "";
  els.needsList.innerHTML = `
    <li>${roundLiters(calc.teaLiters)} sladkého čaje celkem</li>
    ${teaLines}
    <li>${approxRange(calc.sugarTotal, 5)} cukru</li>
    <li>${roundMl(calc.starterMl)} startéru</li>
    ${pellicleLine}
  `;

  const predictions = [
    { max: 1, title: "Dobrej tlamolep.", text: "Bude sladší a jemnější. Nech déle fermentovat a ochutnávej." },
    { max: 2, title: "Chuť, co polechtá chuťové pohárky.", text: "Jemně sladko-kyselé, dobře pitelné a přátelské pro začátek." },
    { max: 3, title: "Tohle má pořádný říz 😎", text: "Vyvážené, lehce kyselé, osvěžující. Skvělá kombucha na každý den." },
    { max: 4, title: "Tohle ti zkřiví tlamču.", text: "Výraznější kyselost, ostrý dojezd a dobrý základ pro další ladění." },
    { max: 5, title: "Gratuluju k výrobě kyseliny.", text: "Použij spíš jako startér. Na pití už dost odvážné." }
  ];
  const selected = predictions[Math.min(calc.intensity, 5) - 1];
  els.predictionTitle.textContent = selected.title;
  els.predictionText.textContent = selected.text;
  els.intensityDots.innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="${i < calc.intensity ? "on" : ""}"></span>`).join("");
  els.recommendations.innerHTML = [
    ["Kdy začít ochutnávat", calc.starterType.taste],
    ["Orientační doba F1", calc.goal.days],
    ["Cukr", `${Math.round(calc.sugarPerLiter)} g/l. ${calc.sugarPerLiter < 50 ? "SCOBY bude mít hlad." : calc.sugarPerLiter > 80 ? "Hrozí tlamolep." : "Bezpečný základ."}`],
    ["Rada", calc.goal.id === "enemy" ? "Dobrý pro startér nebo nepřítele. Na pití nedoporučuju." : "Ochutnávej. Kombucha není trouba."]
  ].map(([title, text]) => `<div class="recommendation-item"><strong>${title}</strong><p>${text}</p></div>`).join("");
}

function syncModeUI() {
  document.querySelectorAll(".mode-option").forEach(label => {
    label.classList.toggle("active", label.dataset.modeCard === state.mode);
    label.querySelector("input").checked = label.dataset.modeCard === state.mode;
  });
  els.goalStrip.hidden = state.mode !== "classic";
  els.sugarPanel.classList.toggle("visible", state.mode === "experiment");
  els.volumeTitle.textContent = state.mode === "classic" ? "Jak velkou máš nádobu?" : "Nádoba F1";
}

function render() {
  syncModeUI();
  renderTeas();
  const calc = calculate();
  updateVolumeHint(calc);
  updateStarter(calc);
  updateTea(calc);
  updatePellicle(calc);
  updateSugar(calc);
  updateOutputs(calc);
}

function bindEvents() {
  document.querySelectorAll("input[name='mode']").forEach(input => {
    input.addEventListener("change", () => {
      state.mode = input.value;
      render();
    });
  });
  els.goalGrid.addEventListener("click", event => {
    const card = event.target.closest("[data-goal]");
    if (!card) return;
    state.goal = card.dataset.goal;
    renderChoices();
    render();
  });
  els.starterType.addEventListener("click", event => {
    const button = event.target.closest("[data-starter]");
    if (!button) return;
    state.starterType = button.dataset.starter;
    renderChoices();
    render();
  });
  els.pellicleSize.addEventListener("click", event => {
    const button = event.target.closest("[data-pellicle]");
    if (!button) return;
    state.pellicleSize = button.dataset.pellicle;
    renderChoices();
    render();
  });
  [els.jarLiters, els.targetLiters, els.starterMl, els.pellicleGrams, els.sugarPerLiter, els.sugarTotal, els.sugarSlider].forEach(input => {
    input.addEventListener("input", () => {
      if (input === els.jarLiters && els.jarLiters.value) els.targetLiters.value = "";
      if (input === els.sugarSlider) els.sugarPerLiter.value = input.value;
      if (input === els.sugarPerLiter) {
        state.sugarSource = "perLiter";
        els.sugarSlider.value = input.value || 65;
      }
      if (input === els.sugarTotal) state.sugarSource = "total";
      render();
    });
  });
  els.addTeaBtn.addEventListener("click", () => {
    state.teas.push({ id: createTeaId(), enabled: true, type: "rooibos", role: "extra", grams: 6, waterMl: "" });
    render();
  });
  els.teaList.addEventListener("input", updateTeaFromDom);
  els.teaList.addEventListener("change", updateTeaFromDom);
  els.teaList.addEventListener("click", event => {
    if (!event.target.closest(".remove-tea")) return;
    const row = event.target.closest(".tea-row");
    state.teas = state.teas.filter(tea => tea.id !== row.dataset.teaId);
    render();
  });
  els.usePellicle.addEventListener("change", render);
  els.pellicleMinus.addEventListener("click", () => {
    state.pellicleCount = Math.max(1, state.pellicleCount - 1);
    render();
  });
  els.pelliclePlus.addEventListener("click", () => {
    state.pellicleCount += 1;
    render();
  });
  els.howItWorksBtn.addEventListener("click", () => els.howItWorksDialog.showModal());
  els.closeDialog.addEventListener("click", () => els.howItWorksDialog.close());
}

function updateTeaFromDom() {
  state.teas = Array.from(document.querySelectorAll(".tea-row")).map(row => ({
    id: row.dataset.teaId,
    enabled: row.querySelector(".tea-check").checked,
    type: row.querySelector(".tea-type").value,
    role: row.querySelector(".tea-role").value,
    grams: Number(row.querySelector(".tea-grams").value) || teaTypes[row.querySelector(".tea-type").value].grams,
    waterMl: row.querySelector(".tea-water").value
  }));
  render();
}

renderChoices();
bindEvents();
render();
