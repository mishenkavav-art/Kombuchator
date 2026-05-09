// ═══ DATA ═══

const goals = [
  { id: "gentle",   icon: "ikony/slabý čajíček_výluh z ponožek.png", title: "slabý čajíček",         note: "Lehká, jemná chuť.",       percent: 0.10, tasteDays: [2,  4]  },
  { id: "balanced", icon: "ikony/kombucha jak má být.png",            title: "kombucha jak má být",    note: "Vyvážený standard.",        percent: 0.13, tasteDays: [3,  6]  },
  { id: "tangy",    icon: "ikony/kyselejší limonádka.png",            title: "kyselejší limonáda",     note: "Výraznější říz.",           percent: 0.15, tasteDays: [5,  8]  },
  { id: "starter",  icon: "ikony/startér pro příště.png",             title: "startér pro příště",     note: "Kyselost je cíl.",          percent: 0.18, tasteDays: [7,  14] },
  { id: "enemy",    icon: "ikony/kyselina pro nepřátele.png",         title: "kyselina pro nepřátele", note: "Spíš čistič než pití.",     percent: 0.20, tasteDays: [14, 21] }
];

const starterTypes = {
  sweet:    { label: "sladký",  emoji: "😋", activityMultiplier: 0.50, min: 0.15, target: [0.15, 0.25], tasteOffset: +2, text: "Startér chutná sladce, takže počítej s pomalejším rozjezdem. Přidej víc kyselého startéru, nebo zmenši várku." },
  weak:     { label: "slabý",   emoji: "😴", activityMultiplier: 0.70, min: 0.15, target: [0.15, 0.20], tasteOffset: +2, text: "Startér máš slabší. Hlídej vůni, hladinu a chuť dřív než obvykle." },
  normal:   { label: "běžný",   emoji: "🙂", activityMultiplier: 1.00, min: 0.10, target: [0.10, 0.15], tasteOffset:  0, text: "Startér máš v běžném rozmezí. Kombucha by se měla rozjet bez zbytečného čekání." },
  vinegary: { label: "octový",  emoji: "😖", activityMultiplier: 1.25, min: 0.08, target: [0.08, 0.12], tasteOffset: -1, text: "Startér máš hodně kyselý. Ochutnávej dřív, ať ti výsledek neujede do octa." }
};

const teaTypes = {
  black:    { label: "černý",   icon: "ikony/černý čaj.png",                        main: true,  grams: 6 },
  green:    { label: "zelený",  icon: "ikony/zelený čaj.png",                        main: true,  grams: 5 },
  white:    { label: "bílý",    icon: "ikony/bílý čaj.png",                          main: true,  grams: 5 },
  oolong:   { label: "oolong",  icon: "ikony/oolong.png",                            main: true,  grams: 6 },
  rooibos:  { label: "rooibos", icon: "ikony/rooibos.png",                           main: false, grams: 6 },
  hibiscus: { label: "ibišek",  icon: "ikony/ibišek.png",                            main: false, grams: 3 },
  fruit:    { label: "ovocný",  icon: "ikony/ovocný čaj.png",                        main: false, grams: 3 },
  herbal:   { label: "bylinný", icon: "ikony/bylinný čaj.png",                       main: false, grams: 3 }
};

const pellicles = {
  jelly:   { label: "tenká medůzka",    icon: "ikony/malá medůzka.png",                 score: 0.5, gramsRange: "15-50 g",   defaultGrams: 30  },
  palm:    { label: "akorát do dlaně",  icon: "ikony/kombuška do dlaně.png",            score: 1,   gramsRange: "50-120 g",  defaultGrams: 80  },
  pancake: { label: "palačinka",        icon: "ikony/typická palačinka.png",            score: 1.5, gramsRange: "120-250 g", defaultGrams: 180 },
  tractor: { label: "kolo od traktoru", icon: "ikony/placka jak kolo od traktoru.png", score: 2,   gramsRange: "250-600+ g", defaultGrams: 350 }
};

const temperatureBands = {
  unknown: { label: "nevím",   emoji: "🤷", offset:  0, text: "Teplotu nemáš vyplněnou. Počítáš s běžnou pokojovou teplotou, takže doporučené dny ber orientačně." },
  cold:    { label: "chladno", emoji: "🥶", offset: +2, text: "Máš chladno, zhruba pod 20 °C. Fermentace ti pojede pomaleji a kombucha zůstane déle sladká." },
  room:    { label: "pokoj",   emoji: "🌡️", offset:  0, text: "Teplota je v pohodě, zhruba 20–25 °C. Fermentace by měla běžet normálně." },
  warm:    { label: "teplo",   emoji: "☀️", offset: -1, text: "Máš teplejší prostředí, zhruba 25–29 °C. Kombucha ti pojede rychleji, tak ochutnávej dřív." },
  hot:     { label: "hic",     emoji: "🔥", offset: -2, text: "Máš moc teplo, zhruba nad 29 °C. Přesuň nádobu na klidnější a chladnější místo, jinak ti výsledek může ujet do kysela." }
};

const predictions = {
  weak_start:    { title: "Slabý start",                    text: "Startéru máš málo. Kultura se ti v tomhle objemu rozředí a sladký čaj zůstane dlouho málo kyselý. Zmenši várku, nebo přidej víc aktivního kyselého startéru.", intensity: 1 },
  no_sugar:      { title: "Bez cukru to nepojede",          text: "Bez cukru to nebude fungovat. Kultura potřebuje cukr jako krmení. Přidej cukr, jinak F1 bezpečně nerozjedeš.", intensity: 1 },
  tlamolep:      { title: "Sladký těžký základ",            text: "Cukru máš moc. Budeš to mít sladký jak cecek a může ti to dlouho připomínat spíš sladký čaj než kombuchu.", intensity: 2 },
  gentle:        { title: "Jemný čajíček",                  text: "Chceš jemný čajíček. Drž kratší fermentaci, nepřeháněj startér a stáčej, jakmile je chuť příjemně sladko-kyselá.", intensity: 1 },
  balanced:      { title: "Kombucha jak má být",            text: "Máš dobře nastavenou várku. Startér je v rozumném poměru, čajový základ drží a cukr sedí. Ochutnávej od doporučeného dne a stáčej, když ti chuť sedne.", intensity: 3 },
  tangy:         { title: "Pořádný říz",                    text: "Budeš to mít s pořádným řízem. Hlídej, ať ti říz nepřejde do octa.", intensity: 4 },
  very_sour:     { title: "Hodně kyselé",                   text: "Budeš to mít kyselé jak šlak. Použij to spíš v menším množství nebo jako startér.", intensity: 5 },
  starter_batch: { title: "Startér pro příště",             text: "Chceš startér pro příště. Neřeš pitelnost, cílem je silnější kyselý základ pro další várku.", intensity: 5 },
  vinegar:       { title: "Spíš ocet než pití",             text: "Budeš to mít spíš jako ocet než jako pití. Použij to na startér pro další várku.", intensity: 5 }
};

const f2Tags = {
  f2_ok:     { tag: "vhodné na F2",             text: "Kombucha je dost rozjetá, ale ještě nepůsobí octově. Hlídej tlak, ovoce, cukr a teplo umí v lahvi udělat slušnou divočinu." },
  drink_now: { tag: "na F2 zatím nespěchej",    text: "Ještě je to moc sladké nebo málo rozjeté. Nech F1 dál běžet a ochutnávej." },
  starter:   { tag: "na F2 už moc kyselé",      text: "Použij to radši jako startér pro další várku." },
  stop:      { tag: "na F2 zatím nedávej",      text: "Nejdřív musíš mít bezpečně rozjetou F1." }
};

// ═══ STATE ═══

let teaIdCounter = 0;
function createTeaId() { return `tea-${++teaIdCounter}`; }
const SAVED_RECIPES_KEY = "kombuchator.savedRecipes.v1";
let savedRecipes = loadSavedRecipes();
let pendingRecipeSnapshot = null;
let pendingDeleteRecipeId = null;

const state = {
  mode: "classic",
  goal: "balanced",
  volumeSource: "jar",
  starterType: "normal",
  temperature: "room",
  teas: [
    { id: createTeaId(), enabled: true, type: "black",  ratio: "", grams: 6 },
    { id: createTeaId(), enabled: true, type: "green",  ratio: "", grams: 5 }
  ],
  pellicleSize: "pancake",
  pellicleCount: 1,
  sugarSource: "perLiter"
};

// ═══ DOM REFS ═══

const els = {
  goalGrid:           document.querySelector("#goalGrid"),
  goalStrip:          document.querySelector("#goalStrip"),
  modeNote:           document.querySelector("#modeNote"),
  volumeTitle:        document.querySelector("#volumeTitle"),
  jarChoice:          document.querySelector("#jarChoice"),
  jarLiters:          document.querySelector("#jarLiters"),
  targetChoice:       document.querySelector("#targetChoice"),
  targetLiters:       document.querySelector("#targetLiters"),
  starterMl:          document.querySelector("#starterMl"),
  starterType:        document.querySelector("#starterType"),
  starterAmountHint:  document.querySelector("#starterAmountHint"),
  starterTypeHint:    document.querySelector("#starterTypeHint"),
  teaIntro:           document.querySelector("#teaIntro"),
  teaList:            document.querySelector("#teaList"),
  addTeaBtn:          document.querySelector("#addTeaBtn"),
  teaWarning:         document.querySelector("#teaWarning"),
  usePellicle:        document.querySelector("#usePellicle"),
  pellicleControls:   document.querySelector("#pellicleControls"),
  pellicleSize:       document.querySelector("#pellicleSize"),
  pellicleMinus:      document.querySelector("#pellicleMinus"),
  pelliclePlus:       document.querySelector("#pelliclePlus"),
  pellicleCountLabel: document.querySelector("#pellicleCountLabel"),
  pellicleGrams:      document.querySelector("#pellicleGrams"),
  pellicleHint:       document.querySelector("#pellicleHint"),
  tempPanel:        document.querySelector("#tempPanel"),
  temperatureInput: document.querySelector("#temperatureInput"),
  tempBand:            document.querySelector("#tempBand"),
  tempHint:            document.querySelector("#tempHint"),
  sugarPanel:         document.querySelector("#sugarPanel"),
  sugarPerLiter:      document.querySelector("#sugarPerLiter"),
  sugarTotal:         document.querySelector("#sugarTotal"),
  sugarSlider:        document.querySelector("#sugarSlider"),
  sugarStatus:        document.querySelector("#sugarStatus"),
  needsList:          document.querySelector("#needsList"),
  predictionTitle:    document.querySelector("#predictionTitle"),
  predictionText:     document.querySelector("#predictionText"),
  intensityDots:      document.querySelector("#intensityDots"),
  recommendations:    document.querySelector("#recommendations"),
  saveRecipeBtn:      document.querySelector("#saveRecipeBtn"),
  resetCalcBtn:       document.querySelector("#resetCalcBtn"),
  shareWhatsAppBtn:   document.querySelector("#shareWhatsAppBtn"),
  copyRecipeBtn:      document.querySelector("#copyRecipeBtn"),
  currentActionFeedback: document.querySelector("#currentActionFeedback"),
  savedRecipesList:   document.querySelector("#savedRecipesList"),
  navCalculator:      document.querySelector("#navCalculator"),
  navZapisnik:        document.querySelector("#navZapisnik"),
  navSavedBadge:      document.querySelector("#navSavedBadge"),
  calculatorView:     document.querySelector("#calculatorView"),
  savedRecipesView:   document.querySelector("#savedRecipesView"),
  saveRecipeDialog:   document.querySelector("#saveRecipeDialog"),
  recipeNameInput:    document.querySelector("#recipeNameInput"),
  recipeNameHint:     document.querySelector("#recipeNameHint"),
  cancelSaveRecipeX:  document.querySelector("#cancelSaveRecipeX"),
  cancelSaveRecipeBtn: document.querySelector("#cancelSaveRecipeBtn"),
  confirmSaveRecipeBtn: document.querySelector("#confirmSaveRecipeBtn"),
  deleteRecipeDialog: document.querySelector("#deleteRecipeDialog"),
  cancelDeleteRecipeBtn: document.querySelector("#cancelDeleteRecipeBtn"),
  confirmDeleteRecipeBtn: document.querySelector("#confirmDeleteRecipeBtn"),
  howItWorksBtn:      document.querySelector("#howItWorksBtn"),
  howItWorksDialog:   document.querySelector("#howItWorksDialog"),
  closeDialog:        document.querySelector("#closeDialog")
};

// ═══ UTILS ═══

function numberValue(input, fallback = 0) {
  const v = Number(String(input.value).replace(",", "."));
  return Number.isFinite(v) ? v : fallback;
}
function roundLiters(n) {
  return (Math.round(n * 10) / 10).toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " l";
}
function roundMl(n) { return (Math.round(n / 10) * 10) + " ml"; }
function formatPercent(n, digits = 1) {
  return (n * 100).toLocaleString("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
}
function kitchenVolumeRange(low, high) {
  return `${roundLiters(low)}-${roundLiters(high)}`;
}
function kitchenStarterAmount(liters) {
  return liters >= 1
    ? roundLiters(liters)
    : roundMl(liters * 1000);
}
function starterFixRange(calc) {
  const max = calc.recommendedMaxBatchL;
  if (!Number.isFinite(max) || max <= 0) return "";
  const low = max >= 1 ? Math.max(0.1, max * 0.75) : Math.max(0.1, max * 0.8);
  return kitchenVolumeRange(low, max);
}
function approxRange(n, step = 5) {
  const low  = Math.max(0, Math.floor((n - step / 2) / step) * step);
  const high = Math.ceil((n + step / 2) / step) * step;
  return low === high ? `cca ${low} g` : `cca ${low}–${high} g`;
}
function displayWaterLiters(waterMl) {
  const ml = Number(waterMl);
  return ml > 0 ? String(Math.round((ml / 1000) * 10) / 10) : "";
}
function displayRatioValue(ratio) {
  return Number.isFinite(Number(ratio)) && Number(ratio) > 0 ? String(Math.round(Number(ratio) * 10) / 10) : "";
}
function displayGramsValue(grams) {
  return Number.isFinite(grams) && grams > 0 ? String(Math.round(grams * 10) / 10) : "";
}
function displayLitersValue(liters) {
  return Number.isFinite(liters) && liters > 0
    ? String(Math.round(liters * 10) / 10)
    : "";
}
function parseWaterLiters(value) {
  const liters = Number(String(value).replace(",", "."));
  return Number.isFinite(liters) && liters > 0 ? liters * 1000 : "";
}
function parseOptionalNumber(value) {
  const normalized = String(value ?? "").replace(",", ".").trim();
  if (normalized === "") return "";
  const number = Number(normalized);
  return Number.isFinite(number) ? number : "";
}
function pellicleScoreFromGrams(grams) {
  if (!(grams > 0)) return 0;
  if (grams <= 50) return 0.5;
  if (grams <= 120) return 1;
  if (grams <= 250) return 1.5;
  return 2;
}
function setFeedback(el, text, status = "ok") {
  el.className = "feedback-line";
  if (Array.isArray(text)) {
    el.innerHTML = text
      .filter(item => item && item.text)
      .map(item => `<span class="feedback-line-part is-${item.status || "ok"}">${escapeHtml(item.text)}</span>`)
      .join("");
    return;
  }
  el.classList.add(`is-${status}`);
  el.textContent = text;
}
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function loadSavedRecipes() {
  try {
    const raw = localStorage.getItem(SAVED_RECIPES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function persistSavedRecipes() {
  localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
}
function showActionFeedback(text) {
  if (!els.currentActionFeedback) return;
  els.currentActionFeedback.textContent = text;
  window.clearTimeout(showActionFeedback.timer);
  showActionFeedback.timer = window.setTimeout(() => {
    els.currentActionFeedback.textContent = "";
  }, 2600);
}
function formatDateTime(value) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(value));
}
function modeLabel(mode) {
  return mode === "classic" ? "Klasická kalkulačka" : "Experimentální laboratoř";
}
function statusFromSeverity(severity) {
  if (severity === "STOP") return "stop";
  if (severity === "RED" || severity === "TOO_MUCH") return "risk";
  if (severity === "YELLOW" || severity === "FAST") return "borderline";
  return "ok";
}
function statusLabel(status) {
  return {
    ok: "OK",
    borderline: "Hraniční",
    risk: "Riziko",
    stop: "STOP - neupravované nepoužívej"
  }[status] || "OK";
}
function defaultRecipeName(calc) {
  if (calc.starterSeverity === "STOP" || calc.starterSeverity === "RED") {
    return `Riziková várka - ${roundLiters(calc.workingLiters)}`;
  }
  if (state.mode === "experiment") return `Hokus pokus - ${roundLiters(calc.workingLiters)}`;
  return `${calc.goal.title[0].toUpperCase()}${calc.goal.title.slice(1)} - ${roundLiters(calc.workingLiters)}`;
}
function f2Text(calc) {
  const f2 = f2Tags[calc.f2Key];
  return `${f2.tag}: ${f2.text}`;
}
function recipeSummary(recipe) {
  const teaSummary = recipe.teas.map(t => teaTypes[t.type]?.label || t.type).join(" + ") || "bez čaje";
  return `${roundLiters(recipe.workingVolumeL)} · ${roundMl(recipe.starterMl)} ${recipe.starterType}ho startéru · ${teaSummary} · ${Math.round(recipe.sugarGramsPerLiter)} g/l cukru`;
}
function renderRecipeNeeds(recipe) {
  const teaLines = recipe.teas.map(t => {
    const lbl = teaTypes[t.type]?.label || t.type;
    const icon = teaTypes[t.type]?.icon || "";
    return `<li><img src="${escapeHtml(icon)}" alt="" aria-hidden="true"><span><strong>${escapeHtml(lbl[0].toUpperCase() + lbl.slice(1))} čaj:</strong> ${roundLiters(t.waterMl / 1000)} vody + ${approxRange(t.totalGrams, 1)} čaje</span></li>`;
  }).join("");
  const pellicleLine = recipe.pellicleEnabled && recipe.pellicleType
    ? `<li><img src="${escapeHtml(pellicles[recipe.pellicleType]?.icon || "")}" alt="" aria-hidden="true"><span><strong>Placka:</strong> ${recipe.pellicleCount || 1}× ${escapeHtml(pellicles[recipe.pellicleType]?.label || "placka")}${recipe.pellicleGrams ? `, přesně ${Math.round(recipe.pellicleGrams)} g` : ""}</span></li>`
    : "";
  const tempLine = recipe.temperatureC !== null && recipe.temperatureC !== undefined
    ? `<li><span><strong>Teplota:</strong> ${recipe.temperatureC} °C</span></li>`
    : "";
  return `<ul class="needs-list">
    <li><img src="ikony/kombucha.png" alt="" aria-hidden="true"><span><strong>Sladký čaj celkem:</strong> ${roundLiters(recipe.teaLiters)}</span></li>
    ${teaLines}
    <li><img src="ikony/cukr.png" alt="" aria-hidden="true"><span><strong>Cukr:</strong> ${approxRange(recipe.sugarTotalGrams, 5)}</span></li>
    <li><img src="ikony/startér pro příště.png" alt="" aria-hidden="true"><span><strong>Startér:</strong> ${roundMl(recipe.starterMl)}</span></li>
    ${pellicleLine}
    ${tempLine}
  </ul>`;
}
function buildShareText(recipe) {
  const teaLines = recipe.teas.map(t =>
    `- ${teaTypes[t.type]?.label || t.type}: ${roundLiters(t.waterMl / 1000)} vody, ${Math.round(t.gramsPerLiter * 10) / 10} g/l, ${Math.round(t.totalGrams * 10) / 10} g`
  );
  const lines = [
    `🧪 ${recipe.recipeName}`,
    "",
    recipe.verdictText,
    "",
    "Ingredience:",
    `- ${roundLiters(recipe.teaLiters)} sladkého čaje celkem`,
    ...teaLines,
    `- ${Math.round(recipe.sugarTotalGrams)} g cukru`,
    `- ${roundMl(recipe.starterMl)} startéru`,
  ];
  if (recipe.pellicleEnabled && recipe.pellicleType) {
    const pLabel = pellicles[recipe.pellicleType]?.label || "placka";
    lines.push(`- Placka: ${recipe.pellicleCount || 1}x ${pLabel}${recipe.pellicleGrams ? `, ${Math.round(recipe.pellicleGrams)} g` : ""}`);
  }
  if (recipe.userNote) {
    lines.push("", "Moje poznámka:", recipe.userNote);
  }
  lines.push("", "Vytvořeno v Kombuchátoru.");
  return lines.join("\n");
}
function createRecipeSnapshot(calc, recipeName = "") {
  const defaultName = defaultRecipeName(calc);
  const pred = predictions[calc.predKey];
  const status = statusFromSeverity(calc.starterSeverity);
  const snapshot = {
    id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    recipeName: recipeName.trim() || defaultName,
    defaultRecipeName: defaultName,
    mode: state.mode,
    goalId: state.mode === "classic" ? state.goal : null,
    starterTypeKey: state.starterType,
    volumeSource: state.volumeSource,
    target: state.mode === "classic" ? calc.goal.title : null,
    vesselVolumeL: calc.jarLiters || null,
    workingVolumeL: calc.workingLiters,
    desiredOutputL: calc.usesTarget ? calc.targetLiters : null,
    starterMl: calc.starterMl,
    starterType: calc.starterType.label,
    starterRatio: calc.starterRatio,
    teas: calc.teaItems.map(t => ({
      type: t.type,
      role: teaTypes[t.type].main ? "main" : "additive",
      gramsPerLiter: t.grams,
      waterMl: t.waterMl,
      totalGrams: t.gramsTotal
    })),
    teaStates: state.teas.map(t => ({ ...t })),
    teaLiters: calc.teaLiters,
    sugarGramsPerLiter: calc.sugarPerLiter,
    sugarTotalGrams: calc.sugarTotal,
    pellicleEnabled: calc.pellicleEnabled,
    pellicleType: calc.pellicleEnabled ? state.pellicleSize : null,
    pellicleCount: calc.pellicleEnabled ? state.pellicleCount : null,
    pellicleGrams: calc.hasExactPellicleGrams ? calc.pellicleGrams : null,
    temperatureC: state.mode === "experiment" && els.temperatureInput.value !== "" ? numberValue(els.temperatureInput, null) : null,
    status,
    verdictText: calc.starterSeverity === "STOP" ? "Stopka. Tohle takhle nezakládej bez úprav." : pred.text,
    tastePredictionText: pred.text,
    fermentationAdviceText: calc.tasteWindow,
    f2SuitabilityText: f2Text(calc),
    shareText: "",
    userNote: ""
  };
  snapshot.shareText = buildShareText(snapshot);
  return snapshot;
}
function refreshRecipeShareText(recipe) {
  recipe.shareText = buildShareText(recipe);
}
async function copyText(text, message = "Zkopírováno. Teď to můžeš poslat, kam chceš.") {
  try {
    await navigator.clipboard.writeText(text);
    showActionFeedback(message);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showActionFeedback(message);
  }
}
function shareWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
function switchView(viewName) {
  const isCalc = viewName === "calculator";
  if (els.calculatorView)  els.calculatorView.hidden  = !isCalc;
  if (els.savedRecipesView) els.savedRecipesView.hidden = isCalc;
  if (els.navCalculator) {
    els.navCalculator.classList.toggle("active", isCalc);
    els.navCalculator.ariaCurrent = isCalc ? "page" : null;
  }
  if (els.navZapisnik) {
    els.navZapisnik.classList.toggle("active", !isCalc);
    els.navZapisnik.ariaCurrent = isCalc ? null : "page";
  }
}
function loadRecipeIntoCalculator(recipe) {
  state.mode = recipe.mode || "classic";
  state.goal = recipe.goalId || "balanced";
  state.starterType = recipe.starterTypeKey || "normal";
  state.volumeSource = recipe.volumeSource || "jar";
  if (recipe.vesselVolumeL) els.jarLiters.value = recipe.vesselVolumeL;
  if (recipe.desiredOutputL) els.targetLiters.value = recipe.desiredOutputL;
  els.starterMl.value = recipe.starterMl || 0;
  els.usePellicle.checked = recipe.pellicleEnabled ?? true;
  if (recipe.pellicleType) state.pellicleSize = recipe.pellicleType;
  state.pellicleCount = recipe.pellicleCount || 1;
  els.pellicleGrams.value = recipe.pellicleGrams || "";
  if (recipe.teaStates && recipe.teaStates.length) {
    state.teas = recipe.teaStates.map(t => ({ ...t, id: createTeaId() }));
  } else if (recipe.teas && recipe.teas.length) {
    state.teas = recipe.teas.map(t => ({
      id: createTeaId(), enabled: true, type: t.type,
      ratio: "", waterMl: state.mode === "experiment" ? t.waterMl : "",
      grams: t.gramsPerLiter, gramsTotal: "", lastEditedTeaField: ""
    }));
  }
  switchView("calculator");
  renderChoices();
  render();
}

// ═══ RENDER CHOICES ═══

function renderChoices() {
  const hasExactTemp = els.temperatureInput && els.temperatureInput.value !== "";
  const hasExactPellicle = els.pellicleGrams && numberValue(els.pellicleGrams, 0) > 0;
  els.goalGrid.innerHTML = goals.map(g => `
    <button class="goal-card ${state.goal === g.id ? "active" : ""}" type="button" data-goal="${g.id}">
      <img class="icon" src="${g.icon}" alt="" aria-hidden="true">
      <strong>${g.title}</strong>
      <small>${g.note}</small>
    </button>`).join("");

  els.starterType.innerHTML = Object.entries(starterTypes).map(([id, s]) => `
    <button class="${state.starterType === id ? "active" : ""}" type="button" data-starter="${id}">
      <span>${s.emoji}</span>${s.label}
    </button>`).join("");

  els.tempBand.innerHTML = Object.entries(temperatureBands).filter(([id]) => id !== "unknown").map(([id, t]) => `
    <button class="${!hasExactTemp && state.temperature === id ? "active" : ""}" type="button" data-temp="${id}">
      <span>${t.emoji}</span>${t.label}
    </button>`).join("");

  els.pellicleSize.innerHTML = Object.entries(pellicles).map(([id, p]) => `
    <button class="pellicle-card ${!hasExactPellicle && state.pellicleSize === id ? "active" : ""}" type="button" data-pellicle="${id}">
      <img class="icon" src="${p.icon}" alt="" aria-hidden="true">
      <strong>${p.label}</strong>
      <small>cca ${p.gramsRange}</small>
    </button>`).join("");
}

// ═══ RENDER TEAS ═══

function renderTeas(calc = null) {
  const showDetails = state.mode === "experiment";
  const autoTeaById = new Map((calc?.teaItems ?? []).map(t => [t.id, t]));
  els.teaList.classList.toggle("simple-tea-list", !showDetails);
  els.teaList.innerHTML = (showDetails ? `
    <div class="tea-row tea-row-head" aria-hidden="true">
      <span></span><strong>Typ čaje</strong><strong>Poměr %</strong>
      <strong>Voda v litrech</strong><strong>Množství g/l</strong><strong>Celkem g</strong><span></span>
    </div>` : "") + state.teas.map(tea => `
    <div class="tea-row" data-tea-id="${tea.id}">
      <input class="tea-check" type="checkbox" ${tea.enabled ? "checked" : ""} aria-label="Použít čaj">
      <div class="tea-picker">
        <img class="tea-icon" src="${teaTypes[tea.type].icon}" alt="" aria-hidden="true">
        <select class="tea-type">
          ${Object.entries(teaTypes).map(([id, item]) => `<option value="${id}" ${tea.type === id ? "selected" : ""}>${item.label}</option>`).join("")}
        </select>
      </div>
      <div class="inline-unit tea-ratio-unit ${showDetails ? "" : "visually-hidden"}">
        <input class="tea-ratio" type="number" min="0" max="100" step="1" placeholder="%" value="${displayRatioValue(autoTeaById.get(tea.id)?.ratio ?? tea.ratio)}" aria-label="Poměr čaje v procentech">
      </div>
      <div class="inline-unit tea-water-unit ${showDetails ? "" : "visually-hidden"}">
        <input class="tea-water" type="number" min="0" step="0.1" placeholder="l" value="${displayWaterLiters(autoTeaById.get(tea.id)?.waterMl ?? tea.waterMl)}" aria-label="Voda v litrech">
      </div>
      <div class="inline-unit ${showDetails ? "" : "visually-hidden"}">
        <input class="tea-grams" type="number" min="0" step="0.5" placeholder="g/l" value="${displayGramsValue(autoTeaById.get(tea.id)?.grams ?? tea.grams)}" aria-label="Gramáž g/l">
      </div>
      <div class="inline-unit ${showDetails ? "" : "visually-hidden"}">
        <input class="tea-total-grams" type="number" min="0" step="0.5" placeholder="g" value="${displayGramsValue(autoTeaById.get(tea.id)?.gramsTotal ?? tea.gramsTotal)}" aria-label="Čaj celkem v gramech">
      </div>
      <button class="remove-tea" type="button" aria-label="Odebrat čaj">×</button>
    </div>`).join("");
}

// ═══ BUILD TEA ITEMS ═══

function buildClassicTeaItems(enabledTeas, freshTeaL) {
  const main  = enabledTeas.filter(t => teaTypes[t.type].main);
  const extra = enabledTeas.filter(t => !teaTypes[t.type].main);
  let weighted;
  if (main.length && extra.length) {
    const ms = 0.7 / main.length, es = 0.3 / extra.length;
    weighted = enabledTeas.map(t => ({ ...t, role: teaTypes[t.type].main ? "main" : "extra", share: teaTypes[t.type].main ? ms : es }));
  } else {
    weighted = enabledTeas.map(t => ({ ...t, role: teaTypes[t.type].main ? "main" : "extra", share: 1 / enabledTeas.length }));
  }
  const total = weighted.reduce((s, t) => s + t.share, 0) || 1;
  return weighted.map(t => {
    const waterMl = freshTeaL * 1000 * (t.share / total);
    const grams   = teaTypes[t.type].grams;
    return { ...t, grams, waterMl, gramsTotal: waterMl / 1000 * grams };
  });
}

function buildExperimentTeaItems(enabledTeas, freshTeaL) {
  const freshTeaMl = Math.max(0, freshTeaL * 1000);
  const waterEditedTeas = enabledTeas.filter(t => Number(t.waterMl) > 0);
  const usesWaterMode = waterEditedTeas.length > 0 || enabledTeas.some(t => t.lastEditedTeaField === "water");
  let waterById = new Map();
  let ratioById = new Map();

  function distributeBlankRatio(blanks, remainingRatio) {
    const blankRatioTotal = blanks.reduce((sum, t) => sum + (Number(t.ratio) > 0 ? Number(t.ratio) : 0), 0);
    return new Map(blanks.map(t => {
      const share = blankRatioTotal > 0
        ? (Number(t.ratio) || 0) / blankRatioTotal
        : 1 / blanks.length;
      return [t.id, Math.max(0, remainingRatio) * share];
    }));
  }

  if (usesWaterMode) {
    const enteredWaterMl = waterEditedTeas.reduce((sum, t) => sum + Number(t.waterMl), 0);
    const blankWaterTeas = enabledTeas.filter(t => !(Number(t.waterMl) > 0));
    const remainingWaterMl = Math.max(0, freshTeaMl - enteredWaterMl);
    const blankRatioTotal = blankWaterTeas.reduce((sum, t) => sum + (Number(t.ratio) > 0 ? Number(t.ratio) : 0), 0);

    enabledTeas.forEach(t => {
      if (Number(t.waterMl) > 0) {
        waterById.set(t.id, Number(t.waterMl));
        return;
      }
      const share = blankWaterTeas.length
        ? (blankRatioTotal > 0 ? (Number(t.ratio) || 0) / blankRatioTotal : 1 / blankWaterTeas.length)
        : 0;
      waterById.set(t.id, remainingWaterMl * share);
    });

    const totalWaterMl = enabledTeas.reduce((sum, t) => sum + (waterById.get(t.id) || 0), 0);
    enabledTeas.forEach(t => {
      ratioById.set(t.id, totalWaterMl > 0 ? (waterById.get(t.id) || 0) / totalWaterMl * 100 : 0);
    });
  } else {
    const specifiedRatio = enabledTeas.reduce((sum, t) => sum + (Number(t.ratio) > 0 ? Number(t.ratio) : 0), 0);
    const blankRatioTeas = enabledTeas.filter(t => !(Number(t.ratio) > 0));
    const blankRatios = distributeBlankRatio(blankRatioTeas, Math.max(0, 100 - specifiedRatio));

    enabledTeas.forEach(t => {
      const ratio = Number(t.ratio) > 0 ? Number(t.ratio) : (blankRatios.get(t.id) || 0);
      ratioById.set(t.id, ratio);
      waterById.set(t.id, freshTeaMl * ratio / 100);
    });
  }

  return enabledTeas.map(t => {
    const waterMl = waterById.get(t.id) || 0;
    const waterL = waterMl / 1000;
    const ratio = ratioById.get(t.id) || 0;
    const totalEdited = t.lastEditedTeaField === "totalGrams" && Number(t.gramsTotal) > 0;
    const gramsTotal = totalEdited ? Number(t.gramsTotal) : waterL * (Number(t.grams) || teaTypes[t.type].grams);
    const grams = totalEdited && waterL > 0
      ? gramsTotal / waterL
      : (Number(t.grams) || teaTypes[t.type].grams);
    const needsWaterForGrams = totalEdited && !(waterL > 0);
    return { ...t, ratio, waterMl, grams, gramsTotal, needsWaterForGrams };
  });
}

// ═══ CALCULATE ═══

function calculate() {
  // Volume
  const jarLiters     = numberValue(els.jarLiters, 3);
  const targetLiters  = numberValue(els.targetLiters, 0);
  const usesTarget    = state.volumeSource === "target" && targetLiters > 0;
  const workingLiters = usesTarget ? targetLiters : Math.max(0, jarLiters * 0.9);
  const neededJar     = workingLiters / 0.9;
  const goal          = goals.find(g => g.id === state.goal) || goals[1];

  // Starter
  const starterType   = starterTypes[state.starterType] || starterTypes.normal;
  const starterMl     = numberValue(els.starterMl, 0);
  const starterLiters = starterMl / 1000;
  const freshTeaL     = Math.max(0, workingLiters - starterLiters);
  const starterRatio  = workingLiters > 0 ? starterLiters / workingLiters : 0;
  const goalStarterMin = state.mode === "classic" ? goal.percent : 0;
  const starterMin    = Math.max(starterType.min, goalStarterMin);
  const starterTarget = [
    Math.max(starterType.target[0], goalStarterMin),
    Math.max(starterType.target[1], goalStarterMin)
  ];
  const starterGap    = (starterMin > 0 && workingLiters > 0) ? starterRatio / starterMin : 999;

  const EPS = 1e-9;
  let starterSeverity;
  if      (starterGap < 0.50 - EPS) starterSeverity = "STOP";
  else if (starterGap < 0.75 - EPS) starterSeverity = "RED";
  else if (starterGap < 1.00 - EPS) starterSeverity = "YELLOW";
  else if (starterRatio > starterTarget[1] * 1.8) starterSeverity = "TOO_MUCH";
  else if (starterRatio > starterTarget[1] + EPS) starterSeverity = "FAST";
  else                        starterSeverity = "OK";

  const recommendedMaxBatchL   = starterMin > 0 ? starterLiters / starterMin : Infinity;
  const requiredStarterMinL    = workingLiters * starterMin;
  const requiredStarterTargetL = [workingLiters * starterTarget[0], workingLiters * starterTarget[1]];

  // Pellicle
  const pellicleEnabled = els.usePellicle.checked;
  const pellicleGrams   = numberValue(els.pellicleGrams, 0);
  const hasExactPellicleGrams = pellicleGrams > 0;
  const basePellicleScore = hasExactPellicleGrams
    ? pellicleScoreFromGrams(pellicleGrams)
    : (pellicleEnabled ? pellicles[state.pellicleSize].score : 0);
  const pellicleScore   = pellicleEnabled
    ? (hasExactPellicleGrams ? basePellicleScore : basePellicleScore * state.pellicleCount)
    : 0;
  const pellicleBonusScore = pellicleScore;
  const idealPellicleMax = workingLiters <= 1.5 ? 1 : workingLiters <= 3 ? 2 : workingLiters <= 5 ? 3 : 4;

  const effectiveStarterRatio = starterRatio * starterType.activityMultiplier;

  // Tea
  const enabledTeas = state.teas.filter(t => t.enabled);
  const teaItems    = state.mode === "classic"
    ? buildClassicTeaItems(enabledTeas, freshTeaL)
    : buildExperimentTeaItems(enabledTeas, freshTeaL);
  const teaLiters     = teaItems.reduce((s, t) => s + t.waterMl / 1000, 0);
  const teaTotalGrams = teaItems.reduce((s, t) => s + t.gramsTotal, 0);
  const mainTeaMl     = teaItems.filter(t => teaTypes[t.type].main).reduce((s, t) => s + t.waterMl, 0);
  const hasHibiscus   = teaItems.some(t => t.type === "hibiscus" && t.waterMl > 0);
  const hasMainTeaType = teaItems.some(t => teaTypes[t.type].main);
  const onlyExtraTea  = teaItems.length > 0 && !hasMainTeaType;
  const avgTeaStrength = teaLiters > 0 ? teaTotalGrams / teaLiters : 0;
  const teaWaterDiffL = state.mode === "experiment" ? teaLiters - freshTeaL : 0;
  const teaNeedsWaterForGrams = state.mode === "experiment" && teaItems.some(t => t.needsWaterForGrams);

  // Sugar
  const recSugar = { gentle: 55, balanced: 60, tangy: 65, starter: 65, enemy: 55 };
  const sugarPerLiter = state.mode === "classic"
    ? (recSugar[state.goal] ?? 60)
    : (state.sugarSource === "total" && numberValue(els.sugarTotal, 0) > 0
        ? numberValue(els.sugarTotal, 0) / Math.max(freshTeaL, 0.1)
        : numberValue(els.sugarPerLiter, 65));
  const sugarTotal = (sugarPerLiter || 0) * freshTeaL;

  let sugarBand;
  if (!sugarPerLiter || sugarPerLiter === 0) sugarBand = "zero";
  else if (sugarPerLiter < 40)              sugarBand = "very_low";
  else if (sugarPerLiter < 50)              sugarBand = "low";
  else if (sugarPerLiter <= 70)             sugarBand = "safe";
  else if (sugarPerLiter <= 80)             sugarBand = "sweeter";
  else if (sugarPerLiter <= 100)            sugarBand = "tlamolep";
  else                                      sugarBand = "extreme";

  // Temperature & tasting window
  const tempBand = state.mode === "experiment"
    ? (temperatureBands[state.temperature] || temperatureBands.room)
    : temperatureBands.room;
  const baseDays  = goal.tasteDays;
  let tasteOffset = starterType.tasteOffset + tempBand.offset;
  if (hasHibiscus)  tasteOffset -= 1;
  if (starterSeverity === "STOP" || starterSeverity === "RED") tasteOffset += 2;
  if (sugarBand === "tlamolep" || sugarBand === "extreme")     tasteOffset += 1;
  const tasteLow  = Math.max(1, baseDays[0] + tasteOffset);
  const tasteHigh = Math.max(tasteLow + 1, baseDays[1] + tasteOffset);
  const tasteWindow = starterSeverity === "STOP"
    ? "Nejdřív oprav startér"
    : `${tasteLow}.–${tasteHigh}. den`;

  // Prediction key
  let predKey;
  if      (starterSeverity === "STOP" || starterSeverity === "RED")         predKey = "weak_start";
  else if (sugarBand === "zero" && state.mode === "experiment")             predKey = "no_sugar";
  else if (state.goal === "enemy")                                          predKey = "vinegar";
  else if (state.goal === "starter")                                        predKey = "starter_batch";
  else if (effectiveStarterRatio >= 0.25 || starterSeverity === "TOO_MUCH" || (state.starterType === "vinegary" && starterSeverity === "FAST")) predKey = "very_sour";
  else if (effectiveStarterRatio >= 0.18 || starterSeverity === "FAST")    predKey = "tangy";
  else if (sugarBand === "tlamolep" || sugarBand === "extreme")             predKey = "tlamolep";
  else if (state.goal === "gentle")                                         predKey = "gentle";
  else                                                                      predKey = "balanced";

  // F2 tag
  let f2Key;
  if      (starterSeverity === "STOP" || starterSeverity === "RED")                       f2Key = "stop";
  else if (predKey === "weak_start" || predKey === "no_sugar" || sugarBand === "zero")    f2Key = "stop";
  else if (predKey === "vinegar" || predKey === "starter_batch" || predKey === "very_sour") f2Key = "starter";
  else if (sugarBand === "tlamolep" || sugarBand === "extreme")                           f2Key = "drink_now";
  else if (predKey === "gentle" || starterSeverity === "YELLOW")                          f2Key = "drink_now";
  else                                                                                   f2Key = "f2_ok";

  // Errors & warnings
  const errors = [], warnings = [];
  if (workingLiters <= 0)
    errors.push("Chybí ti důležitý údaj. Doplň nádobu nebo množství, jinak není co počítat.");
  if (workingLiters > 0 && starterMl <= 0)
    errors.push("Chybí ti tekutý startér. Placka samotná nestačí. Přidej aktivní kyselý startér.");
  if (workingLiters > 0 && starterLiters >= workingLiters)
    errors.push("Startér nemůže být větší než celkový objem várky. Zkontroluj čísla.");
  if (!enabledTeas.length)
    errors.push("Čaj nemáš vyplněný. Doplň čajový základ, jinak není co počítat.");
  if (sugarBand === "zero" && state.mode === "experiment")
    errors.push("Bez cukru to nebude fungovat. Kultura potřebuje cukr jako krmení.");
  const totalLiquidLiters = starterLiters + teaLiters;
  if (!usesTarget && workingLiters > 0 && totalLiquidLiters > jarLiters * 1.03)
    errors.push("Čaj a startér se ti do plánovaného objemu nevejdou. Uprav množství vody, startéru nebo velikost várky.");

  if (onlyExtraTea)
    warnings.push("Pouze rooibos, ibišek, ovocný nebo bylinný čaj jako hlavní základ nepoužívej. Přidej černý, zelený, bílý čaj nebo oolong.");
  if (state.mode === "experiment" && teaWaterDiffL < -0.1)
    warnings.push(`Máš zadaného méně čajového nálevu, než odpovídá plánované várce. Buď doplň vodu u čajů, nebo zmenši cílový objem. Do plánované várky ti chybí cca ${roundLiters(Math.abs(teaWaterDiffL))} čajového nálevu.`);
  if (state.mode === "experiment" && teaWaterDiffL > 0.1)
    warnings.push(`Máš zadaného víc čajového nálevu, než se do plánované várky vejde. Uber vodu u čajů, zmenši startér, nebo zvětši plánovaný objem. Přebývá ti cca ${roundLiters(teaWaterDiffL)} čajového nálevu.`);
  if (teaNeedsWaterForGrams)
    warnings.push("Nejdřív zadej vodu u čaje, ať můžu přepočítat gramáž.");
  if (state.mode === "classic" && state.goal === "enemy")
    warnings.push("Chceš kyselinu pro nepřítele. Počítej s extrémní kyselostí. Na běžné pití to nepoužívej.");
  if (sugarBand === "tlamolep")
    warnings.push("Cukru máš moc. Budeš to mít sladký jak cecek a může ti to dlouho připomínat spíš sladký čaj než kombuchu.");
  if (sugarBand === "extreme")
    warnings.push("Cukru máš extrémně moc. Uber cukr, jinak budeš mít sladký těžký základ.");
  if (state.mode === "experiment" && state.temperature === "hot")
    warnings.push("Máš moc teplo. Přesuň nádobu na klidnější a chladnější místo, jinak ti výsledek může ujet do kysela.");
  if (hasHibiscus && (state.goal === "tangy" || state.goal === "enemy"))
    warnings.push("Ibišek je sám o sobě kyselý. Hlídej chuť, ať si kyselost ibišku nespleteš s bezpečně rozjetou fermentací.");
  if ((state.starterType === "weak" || state.starterType === "sweet") && sugarBand === "tlamolep")
    warnings.push("Hodně cukru a slabý startér je špatná kombinace. Sladký čaj bude dlouho málo kyselý. Přidej startér, nebo zmenši várku.");
  if ((state.starterType === "weak" || state.starterType === "sweet") && sugarBand === "very_low")
    warnings.push("Šetříš startér i cukr zároveň. Kultura má slabý rozjezd a málo krmení. Přidej cukr nebo víc kyselého startéru.");
  if (starterSeverity === "STOP" || starterSeverity === "RED")
    warnings.push(`Startéru máš málo. Máš ${formatPercent(starterRatio)} startéru, ale pro tohle nastavení potřebuješ aspoň ${formatPercent(starterMin, 0)}, ideálně ${formatPercent(starterTarget[0], 0)}-${formatPercent(starterTarget[1], 0)}. Zmenši várku, nebo přidej aktivní kyselý startér.`);
  if (pellicleEnabled && pellicleScore > idealPellicleMax * 2)
    warnings.push("Placek máš extrémně hodně vzhledem k velikosti várky. Zaberou místo v nádobě, ale startér nenahradí. Uber placky a drž správný poměr tekutého startéru.");
  else if (pellicleEnabled && pellicleScore > idealPellicleMax)
    warnings.push("Placek máš hodně vzhledem k velikosti várky. Hlídej místo v nádobě a správný poměr tekutého startéru.");
  if (teaItems.length && avgTeaStrength < 4)
    warnings.push("Čaje máš málo. Budeš to mít vodovější a chuťově slabší.");
  if (avgTeaStrength >= 7 && avgTeaStrength <= 9)
    warnings.push("Čaje máš hodně. Budeš to mít výrazné, možná trpké.");
  if (avgTeaStrength > 9)
    warnings.push("Čaje máš extrémně moc. Budeš to mít trpké jak ponožku z tělocviku. Uber gramáž.");
  teaItems.forEach(t => {
    const g = Number(t.grams) || teaTypes[t.type].grams;
    if ((t.type === "green" || t.type === "white") && g > 7)
      warnings.push("Zeleného nebo bílého čaje máš moc. Budeš to mít hořké, tak uber čaj nebo zkrať louhování.");
  });

  return {
    jarLiters, targetLiters, usesTarget, workingLiters, neededJar, freshTeaL,
    goal, starterType, starterMl, starterLiters, starterRatio, effectiveStarterRatio,
    starterMin, starterTarget, starterGap, starterSeverity,
    recommendedMaxBatchL, requiredStarterMinL, requiredStarterTargetL,
    pellicleEnabled, pellicleGrams, hasExactPellicleGrams, pellicleScore, pellicleBonusScore, idealPellicleMax,
    teaLiters, teaItems, teaTotalGrams, onlyExtraTea, avgTeaStrength, teaWaterDiffL, teaNeedsWaterForGrams,
    sugarPerLiter, sugarTotal, sugarBand,
    tempBand, tasteWindow,
    predKey, f2Key,
    totalLiquidLiters, errors, warnings
  };
}

// ═══ UPDATE FUNCTIONS ═══

function updateStarter(calc) {
  if (calc.workingLiters <= 0) {
    setFeedback(els.starterAmountHint, "", "ok");
    setFeedback(els.starterTypeHint, "", "ok");
    return;
  }
  const minPct = formatPercent(calc.starterMin, 0);
  const tgtLow = formatPercent(calc.starterTarget[0], 0);
  const tgtHigh = formatPercent(calc.starterTarget[1], 0);
  const typeStatus = (!state.starterType || state.starterType === "normal") ? "ok" : state.starterType === "vinegary" ? "warn" : "warn";
  setFeedback(els.starterTypeHint, state.starterType ? calc.starterType.text : "", typeStatus);
  const amountParts = [{ text: `Máš ${formatPercent(calc.starterRatio)} startéru.`, status: "ok" }];
  let amountStatus = "ok";

  if (calc.starterSeverity === "STOP") {
    amountStatus = "danger";
    const maxB   = starterFixRange(calc);
    const needMn = kitchenStarterAmount(calc.requiredStarterMinL);
    amountParts[0].status = "danger";
    const fixSuggestion = maxB
      ? `Zmenši várku na ${maxB}, nebo přidej aspoň ${needMn} startéru.`
      : `Přidej aspoň ${needMn} startéru, nebo zmenši várku.`;
    amountParts.push({ text: `Takhle ji nezakládej. ${fixSuggestion}`, status: "danger" });
  } else if (calc.starterSeverity === "RED") {
    amountStatus = "danger";
    const missing = Math.max(0, calc.requiredStarterMinL - calc.starterLiters);
    amountParts[0].status = "danger";
    amountParts.push({ text: `Přidej aspoň na ${kitchenStarterAmount(calc.requiredStarterMinL)}. Chybí cca ${kitchenStarterAmount(missing)}.`, status: "danger" });
  } else if (calc.starterSeverity === "YELLOW") {
    amountStatus = "warn";
    amountParts[0].status = "warn";
    amountParts.push({ text: "Lehce pod doporučením. Hlídej chuť dřív.", status: "warn" });
  } else if (calc.starterSeverity === "FAST") {
    amountStatus = "warn";
    amountParts.push({ text: "Pojede rychleji. Ochutnávej dřív.", status: "warn" });
  } else if (calc.starterSeverity === "TOO_MUCH") {
    amountStatus = "danger";
    amountParts[0].status = "danger";
    amountParts.push({ text: "Hodně startéru. Počítej s ostřejší chutí.", status: "danger" });
  } else {
    amountParts.push({ text: "Tak akorát.", status: "ok" });
  }
  setFeedback(els.starterAmountHint, amountParts, amountStatus);
}

function updateTea(calc) {
  const msgs = [];
  let status = "ok";
  const greenWhiteTooStrong = calc.teaItems.some(t => (t.type === "green" || t.type === "white") && Number(t.grams) > 7);
  let strengthMessage = "";
  let strengthStatus = "ok";

  if (calc.teaItems.length) {
    if (greenWhiteTooStrong) {
      strengthMessage = "Zeleného nebo bílého čaje máš moc. Budeš to mít hořké, tak uber čaj nebo zkrať louhování.";
      strengthStatus = "danger";
    } else if (calc.avgTeaStrength < 4) {
      strengthMessage = "Čaje máš málo. Budeš to mít vodovější a chuťově slabší. Přidej trochu čaje, pokud chceš výraznější kombuchu.";
      strengthStatus = "warn";
    } else if (calc.avgTeaStrength <= 7) {
      strengthMessage = "Čaj máš tak akorát, chuť by neměla být ani vodová, ani trpká.";
    } else if (calc.avgTeaStrength <= 9) {
      strengthMessage = "Čaje máš hodně. Budeš to mít výraznější, s větším tělem, ale může se objevit trpkost. Uber gramáž, pokud chceš jemnější výsledek.";
      strengthStatus = "warn";
    } else {
      strengthMessage = "Čaje máš extrémně moc. Budeš to mít trpké jak ponožku z tělocviku. Uber gramáž.";
      strengthStatus = "danger";
    }
  }

  if (!calc.teaItems.length) {
    msgs.push({ text: "Čaj nemáš vyplněný. Doplň čajový základ, jinak není co počítat.", status: "danger" });
    status = "danger";
  }
  if (calc.onlyExtraTea) {
    msgs.push({
      text: calc.avgTeaStrength > 9
        ? "Pouze rooibos, ibišek, ovocný nebo bylinný čaj jako hlavní základ nepoužívej. Přidej pravý čaj."
        : "Pouze rooibos, ibišek, ovocný nebo bylinný čaj jako hlavní základ nepoužívej. Přidej černý, zelený, bílý čaj nebo oolong.",
      status: "danger"
    });
    if (calc.avgTeaStrength > 9) {
      msgs.push({ text: "Navíc máš nálev extrémně silný, takže chuť může být přestřelená.", status: "danger" });
    }
    status = "danger";
  }
  if (calc.teaItems.length && !calc.onlyExtraTea) {
    const mainTypes = calc.teaItems.filter(t => teaTypes[t.type].main).map(t => teaTypes[t.type].label);
    const teaBase = mainTypes.join(" + ");
    if (greenWhiteTooStrong && mainTypes.some(t => t === "zelený" || t === "bílý")) {
      msgs.push({ text: `${teaBase[0].toUpperCase()}${teaBase.slice(1)} čaj je pro F1 v pohodě.`, status: "ok" });
    } else {
      msgs.push({ text: `${teaBase[0].toUpperCase()}${teaBase.slice(1)} čaj máš jako stabilní základ pro F1.`, status: "ok" });
    }
    if (strengthMessage) msgs.push({ text: strengthMessage, status: strengthStatus });
    if (strengthStatus === "danger") status = "danger";
    else if (strengthStatus === "warn" && status !== "danger") status = "warn";
  }
  if (state.mode === "experiment" && calc.teaWaterDiffL < -0.1) {
    msgs.push({ text: `Do plánované várky ti chybí cca ${roundLiters(Math.abs(calc.teaWaterDiffL))} čajového nálevu. Doplň vodu u čajů, nebo zmenši cílový objem.`, status: "warn" });
    if (status !== "danger") status = "warn";
  }
  if (state.mode === "experiment" && calc.teaWaterDiffL > 0.1) {
    msgs.push({ text: `Přebývá ti cca ${roundLiters(calc.teaWaterDiffL)} čajového nálevu. Uber vodu u čajů, zmenši startér, nebo zvětši plánovaný objem.`, status: "warn" });
    if (status !== "danger") status = "warn";
  }
  if (calc.teaNeedsWaterForGrams) {
    msgs.push({ text: "Nejdřív zadej vodu u čaje, ať můžu přepočítat gramáž.", status: "warn" });
    if (status !== "danger") status = "warn";
  }
  setFeedback(els.teaWarning, msgs, status);
}

function updatePellicle(calc) {
  els.pellicleControls.hidden = false;
  els.pellicleControls.classList.toggle("inactive", !els.usePellicle.checked);
  els.pellicleCountLabel.textContent = state.pellicleCount;
  if (!els.usePellicle.checked) {
    setFeedback(els.pellicleHint, "Placku nepočítáš, ale to nevadí. Když máš dost kyselého startéru, kombucha pojede i bez ní.", "ok");
    return;
  }
  const score    = calc.pellicleScore;
  const p = pellicles[state.pellicleSize];
  const exactGrams = numberValue(els.pellicleGrams, 0);
  const idealMin = calc.workingLiters <= 1.5 ? 0.5 : calc.workingLiters <= 3 ? 1 : calc.workingLiters <= 5 ? 2 : 3;
  const idealMax = calc.workingLiters <= 1.5 ? 1   : calc.workingLiters <= 3 ? 2 : calc.workingLiters <= 5 ? 3 : 4;
  let text;
  let status = "ok";
  if (calc.starterSeverity === "STOP" || calc.starterSeverity === "RED") {
    text = "Velká placka ti málo startéru nezachrání. Hlavní motor fermentace je kyselá tekutina.";
    status = "danger";
  } else if (score > calc.idealPellicleMax * 2) {
    text = "Placek máš extrémně hodně vzhledem k velikosti várky. Zaberou místo v nádobě, ale startér nenahradí.";
    status = "danger";
  } else if (exactGrams > 0) {
    text = "Zvážená placka je přesnější než odhad podle obrázku.";
  } else if (state.pellicleSize === "tractor") {
    text = "Placku máš hodně velkou. Hlídej místo v nádobě a drž správný poměr tekutého startéru.";
    status = "warn";
  } else if (score < idealMin) {
    text = "Malá placka nevadí, když máš dost silného startéru.";
  } else if (score > idealMax) {
    text = "Placek máš hodně vzhledem k velikosti várky. Hlídej místo v nádobě a správný poměr tekutého startéru.";
    status = "warn";
  } else text = "Placka je pomocník, hlavní motor je kyselý startér.";
  const parts = [{ text, status }];
  if (exactGrams > 0) parts.push({ text: `Máš zadanou přesnou gramáž všech placek: ${Math.round(exactGrams)} g.`, status: "ok" });
  setFeedback(els.pellicleHint, parts, status);
}

function updateTemperature() {
  const band = temperatureBands[state.temperature] || temperatureBands.unknown;
  const status = state.temperature === "hot" ? "danger" : (state.temperature === "cold" || state.temperature === "warm" ? "warn" : "ok");
  setFeedback(els.tempHint, band.text, status);
}

function updateSugar(calc) {
  if (state.mode === "experiment") {
    if (state.sugarSource === "total") {
      els.sugarPerLiter.value = Math.round(calc.sugarPerLiter);
    } else {
      els.sugarTotal.value = Math.round(calc.sugarTotal / 5) * 5;
    }
  }
  const sugarMessages = {
    zero: "Bez cukru to nebude fungovat. Kultura potřebuje cukr jako krmení.",
    very_low: "Cukru máš málo. Budeš to mít sušší, tenčí a možná rychleji kyselé.",
    low: "Cukr máš na spodní hraně. Pro lehčí kombuchu je to v pohodě, ale drž kratší fermentaci a ochutnávej.",
    safe: "Cukr máš tak akorát. Tohle je dobrý základ pro vyváženou chuť.",
    sweeter: "Cukru máš trochu víc. Budeš to mít sladší a fermentace může potřebovat víc času.",
    tlamolep: "Cukru máš moc. Budeš to mít sladký jak cecek a dlouho spíš jako sladký čaj.",
    extreme: "Cukru máš extrémně moc. Uber cukr, jinak budeš mít sladký těžký základ."
  };
  const status = ["zero", "extreme"].includes(calc.sugarBand) ? "danger"
    : ["very_low", "low", "sweeter", "tlamolep"].includes(calc.sugarBand) ? "warn"
    : "ok";
  setFeedback(els.sugarStatus, sugarMessages[calc.sugarBand] || "", status);
}

function updateOutputs(calc) {
  updateCurrentRecipeActions(calc);
  if (calc.errors.length) {
    els.needsList.innerHTML         = calc.errors.map(t => `<li class="needs-alert"><span><strong>Pozor:</strong> ${escapeHtml(t)}</span></li>`).join("");
    els.predictionTitle.textContent = "Nejdřív doplň vstupy";
    els.predictionText.textContent  = "Jakmile budou základní poměry dávat smysl, Kombuchátor ukáže předpověď.";
    els.intensityDots.innerHTML     = "";
    els.recommendations.innerHTML   = calc.warnings.map(t => `<div class="recommendation-item warning"><strong>Pozor</strong><p>${t}</p></div>`).join("");
    return;
  }

  // Needs list
  const teaLines = calc.teaItems.map(t => {
    const lbl = teaTypes[t.type].label;
    return `<li><img src="${teaTypes[t.type].icon}" alt="" aria-hidden="true"><span><strong>${lbl[0].toUpperCase()}${lbl.slice(1)} čaj:</strong> ${roundLiters(t.waterMl / 1000)} vody + ${approxRange(t.gramsTotal, 1)} čaje</span></li>`;
  }).join("");
  const pellicleLine = calc.pellicleEnabled && calc.hasExactPellicleGrams
    ? `<li><img src="${pellicles[state.pellicleSize].icon}" alt="" aria-hidden="true"><span><strong>Placka:</strong> přesně zadaná gramáž ${Math.round(calc.pellicleGrams)} g (nenahrazuje startér)</span></li>`
    : calc.pellicleEnabled
      ? `<li><img src="${pellicles[state.pellicleSize].icon}" alt="" aria-hidden="true"><span><strong>Placka:</strong> ${state.pellicleCount}× ${pellicles[state.pellicleSize].label} (nenahrazuje startér)</span></li>`
    : "";
  const safeBatchLine = calc.starterSeverity === "STOP"
    ? `<li class="fix-line"><span><strong>Bezpečnější posilovací várka:</strong> s tímhle množstvím ${calc.starterType.label}ho startéru udělej radši maximálně cca ${starterFixRange(calc)}. Pro původní objem potřebuješ aspoň ${kitchenStarterAmount(calc.requiredStarterMinL)}, ideálně ${kitchenStarterAmount(calc.requiredStarterTargetL[0])}-${kitchenStarterAmount(calc.requiredStarterTargetL[1])} startéru.</span></li>`
    : "";
  els.needsList.innerHTML = `
    <li><img src="ikony/kombucha.png"            alt="" aria-hidden="true"><span><strong>Sladký čaj celkem:</strong> ${roundLiters(calc.teaLiters)}</span></li>
    ${teaLines}
    <li><img src="ikony/cukr.png"               alt="" aria-hidden="true"><span><strong>Cukr:</strong> ${approxRange(calc.sugarTotal, 5)}</span></li>
    <li><img src="ikony/startér pro příště.png" alt="" aria-hidden="true"><span><strong>Startér:</strong> ${roundMl(calc.starterMl)}</span></li>
    ${pellicleLine}
    ${safeBatchLine}`;

  // Prediction
  const pred = predictions[calc.predKey];
  if (calc.starterSeverity === "STOP") {
    const needT0 = kitchenStarterAmount(calc.requiredStarterTargetL[0]);
    const needT1 = kitchenStarterAmount(calc.requiredStarterTargetL[1]);
    els.predictionTitle.textContent = "Stopka. Tohle je slabý start";
    els.predictionText.textContent  = `Tuhle várku takhle nezakládej. Na ${roundLiters(calc.workingLiters)} máš jen ${formatPercent(calc.starterRatio)} ${calc.starterType.label}ho startéru. Minimum je ${formatPercent(calc.starterMin, 0)}, tedy aspoň ${kitchenStarterAmount(calc.requiredStarterMinL)}, ideálně ${needT0}-${needT1}. ${calc.onlyExtraTea ? "Čajový základ není ideální." : "Čajový základ je v pořádku."} ${calc.pellicleEnabled ? "Placka trochu pomůže, ale špatný poměr startéru nezachrání." : ""} Zmenši várku, nebo přidej víc aktivního kyselého startéru.`;
  } else if (calc.starterSeverity === "YELLOW") {
    els.predictionTitle.textContent = "Hraniční start";
    els.predictionText.textContent  = `Startéru máš lehce pod doporučením. Může to vyjít, ale hlídej vůni, hladinu a chuť dřív než obvykle. ${calc.onlyExtraTea ? "Čajový základ není ideální, přidej pravý čaj." : "Čajový základ je v pořádku."} Na F2 zatím nespěchej.`;
  } else {
    els.predictionTitle.textContent = pred.title;
    els.predictionText.textContent  = pred.text;
  }
  els.intensityDots.innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < pred.intensity ? "on" : ""}"></span>`).join("");

  // Severity label
  const severityLabel = {
    STOP:     "🛑 Stopka. Tohle takhle nezakládej.",
    RED:      "🔴 Startéru máš málo. Přidej startér nebo zmenši várku.",
    YELLOW:   "🟡 Startér máš lehce pod doporučením. Hlídej chuť dřív.",
    OK:       "🟢 Startér máš tak akorát.",
    FAST:     "🟠 Pojede ti to rychle do kysela. Ochutnávej dřív.",
    TOO_MUCH: "🔴 Startéru máš hodně. Počítej s ostrým výsledkem."
  }[calc.starterSeverity] || "";

  // Sugar label
  const sugarLabel = {
    zero:     "bez cukru to nebude fungovat ⛔",
    very_low: "cukru máš málo",
    low:      "cukr máš na spodní hraně",
    safe:     "cukr máš tak akorát",
    sweeter:  "cukru máš trochu víc",
    tlamolep: "cukru máš moc ⚠️",
    extreme:  "cukru máš extrémně moc ⛔"
  }[calc.sugarBand] || "";

  const f2 = f2Tags[calc.f2Key];
  const tempNote = state.mode === "experiment" && calc.tempBand.text ? ` (${calc.tempBand.text})` : "";

  const recommendationRows = [
    ["Start várky",           severityLabel, (calc.starterSeverity === "STOP" || calc.starterSeverity === "RED") ? " danger" : ""],
    ["Kdy ochutnávat",        calc.tasteWindow + tempNote, ""]
  ];
  if (state.mode === "experiment") {
    recommendationRows.push(["Cukr", `${Math.round(calc.sugarPerLiter)} g/l – ${sugarLabel}`, (calc.sugarBand === "zero" || calc.sugarBand === "extreme") ? " danger" : ""]);
  }
  recommendationRows.push([f2.tag, f2.text, calc.f2Key === "stop" ? " danger" : ""]);

  els.recommendations.innerHTML = recommendationRows.map(([title, text, className]) =>
    `<div class="recommendation-item${className}"><strong>${title}</strong><p>${text}</p></div>`
  ).join("") + calc.warnings.map(t =>
    `<div class="recommendation-item warning"><strong>Pozor</strong><p>${t}</p></div>`
  ).join("");
}

function updateCurrentRecipeActions(calc) {
  const disabled = calc.errors.length > 0;
  const saveTitle = disabled
    ? "Nejdřív oprav recept, ať neukládáš kombuchový průšvih."
    : (calc.starterSeverity === "STOP" ? "Ukládáš rizikový recept. Ber ho jako poznámku, ne jako návod." : "");
  [els.saveRecipeBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle("disabled", disabled);
    btn.title = saveTitle;
  });
  [els.shareWhatsAppBtn, els.copyRecipeBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle("disabled", disabled);
    btn.title = disabled ? "Nejdřív doplň recept, ať neposíláš polotovar." : "";
  });
}

function renderSavedRecipes() {
  if (!els.savedRecipesList) return;
  const sorted = [...savedRecipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (els.navSavedBadge) {
    els.navSavedBadge.textContent = sorted.length || "";
    els.navSavedBadge.hidden = sorted.length === 0;
  }
  if (!sorted.length) {
    els.savedRecipesList.innerHTML = `
      <div class="saved-empty">
        <strong>Zápisník je zatím prázdný.</strong>
        <p>Ulož první recept z kalkulačky a začne to tu žít.</p>
      </div>`;
    return;
  }
  els.savedRecipesList.innerHTML = sorted.map(recipe => `
    <article class="saved-recipe-card status-${recipe.status}" data-recipe-id="${recipe.id}">
      <div class="saved-card-top">
        <div class="saved-title-row">
          <h3 data-title>${escapeHtml(recipe.recipeName)}</h3>
        </div>
        <div class="saved-badges">
          <span>${escapeHtml(modeLabel(recipe.mode))}</span>
          <span class="status-badge">${escapeHtml(statusLabel(recipe.status))}</span>
        </div>
      </div>
      <p class="saved-date">Uloženo: ${escapeHtml(formatDateTime(recipe.createdAt))}</p>
      <div class="saved-needs-block">
        <strong class="saved-section-label">Ingredience</strong>
        ${renderRecipeNeeds(recipe)}
      </div>
      <div class="saved-verdict">
        <strong>Verdikt</strong>
        <p>${escapeHtml(recipe.verdictText)}</p>
      </div>
      <p class="saved-card-feedback" aria-live="polite"></p>
      <div class="saved-card-actions">
        <button class="recipe-action share-whatsapp" type="button">WhatsApp</button>
        <button class="recipe-action copy-share" type="button">Kopírovat</button>
        <button class="recipe-action edit-title" type="button">Změnit název</button>
        <button class="recipe-action load-to-calc" type="button">Nahrát do kalkulačky</button>
        <button class="recipe-action toggle-note" type="button">${recipe.userNote ? "Poznámka ✓" : "Přidat poznámku"}</button>
        <button class="recipe-action danger delete-recipe" type="button">Smazat</button>
      </div>
      <div class="recipe-note-area" hidden>
        <label class="recipe-note">
          <span>Poznámka</span>
          <textarea placeholder="Co si k tomu chceš poznamenat? Třeba chuť, datum stáčení nebo co příště změnit…">${escapeHtml(recipe.userNote || "")}</textarea>
        </label>
      </div>
    </article>
  `).join("");
}

function findRecipe(id) {
  return savedRecipes.find(recipe => recipe.id === id);
}

function showCardFeedback(card, text) {
  const el = card?.querySelector(".saved-card-feedback");
  if (!el) return;
  el.textContent = text;
  window.clearTimeout(showCardFeedback.timer);
  showCardFeedback.timer = window.setTimeout(() => { el.textContent = ""; }, 2200);
}

function currentSnapshotForSharing() {
  const calc = calculate();
  if (calc.errors.length) {
    showActionFeedback("Nejdřív doplň recept, ať neposíláš polotovar.");
    return null;
  }
  return createRecipeSnapshot(calc, defaultRecipeName(calc));
}

function openSaveRecipeDialog() {
  const calc = calculate();
  if (calc.errors.length) {
    showActionFeedback("Nejdřív doplň recept, ať neukládáš kombuchový polotovar.");
    return;
  }
  pendingRecipeSnapshot = createRecipeSnapshot(calc, defaultRecipeName(calc));
  els.recipeNameInput.value = pendingRecipeSnapshot.defaultRecipeName;
  els.recipeNameHint.textContent = calc.starterSeverity === "STOP"
    ? "Ukládáš rizikový recept. Ber ho jako poznámku, ne jako návod."
    : "Název si můžeš kdykoliv změnit.";
  els.saveRecipeDialog.showModal();
  els.recipeNameInput.focus();
  els.recipeNameInput.select();
}

function confirmSaveRecipe() {
  if (!pendingRecipeSnapshot) return;
  const typedName = els.recipeNameInput.value.trim();
  if (!typedName) {
    els.recipeNameHint.textContent = "Bez názvu tě v tom za týden nechám plavat. Použiju radši automatický název.";
  }
  pendingRecipeSnapshot.recipeName = typedName || pendingRecipeSnapshot.defaultRecipeName;
  refreshRecipeShareText(pendingRecipeSnapshot);
  savedRecipes.unshift(pendingRecipeSnapshot);
  persistSavedRecipes();
  pendingRecipeSnapshot = null;
  els.saveRecipeDialog.close();
  renderSavedRecipes();
  switchView("zapisnik");
  showActionFeedback("Recept máš uložený.");
}

function defaultModeSnap() {
  return {
    goal: null, volumeSource: "jar", starterType: null,
    temperature: null, pellicleSize: "pancake", pellicleCount: 1, sugarSource: "perLiter",
    teas: [
      { id: createTeaId(), enabled: true, type: "black", ratio: "", grams: 6 },
      { id: createTeaId(), enabled: true, type: "green", ratio: "", grams: 5 }
    ],
    jarLiters: "", targetLiters: "", starterMl: "", pellicleGrams: "",
    temperatureInput: "", sugarPerLiter: "", sugarTotal: "", usePellicle: false,
  };
}

const modeSnapshots = { classic: null, experiment: null };

function snapshotModeState() {
  return {
    goal: state.goal, volumeSource: state.volumeSource, starterType: state.starterType,
    temperature: state.temperature, pellicleSize: state.pellicleSize,
    pellicleCount: state.pellicleCount, sugarSource: state.sugarSource,
    teas: state.teas.map(t => ({ ...t })),
    jarLiters: els.jarLiters.value, targetLiters: els.targetLiters.value,
    starterMl: els.starterMl.value, pellicleGrams: els.pellicleGrams.value,
    temperatureInput: els.temperatureInput.value, sugarPerLiter: els.sugarPerLiter.value,
    sugarTotal: els.sugarTotal.value, usePellicle: els.usePellicle.checked,
  };
}

function restoreModeState(snap) {
  state.goal = snap.goal; state.volumeSource = snap.volumeSource;
  state.starterType = snap.starterType; state.temperature = snap.temperature;
  state.pellicleSize = snap.pellicleSize; state.pellicleCount = snap.pellicleCount;
  state.sugarSource = snap.sugarSource;
  state.teas = snap.teas.map(t => ({ ...t }));
  els.jarLiters.value = snap.jarLiters; els.targetLiters.value = snap.targetLiters;
  els.starterMl.value = snap.starterMl; els.pellicleGrams.value = snap.pellicleGrams;
  els.temperatureInput.value = snap.temperatureInput;
  els.sugarPerLiter.value = snap.sugarPerLiter; els.sugarTotal.value = snap.sugarTotal;
  els.usePellicle.checked = snap.usePellicle;
}

function resetCalculator() {
  state.goal = null;
  state.volumeSource = "jar";
  state.starterType = null;
  state.temperature = null;
  state.pellicleSize = "pancake";
  state.pellicleCount = 1;
  state.sugarSource = "perLiter";
  state.teas = [
    { id: createTeaId(), enabled: true, type: "black", ratio: "", grams: 6 },
    { id: createTeaId(), enabled: true, type: "green", ratio: "", grams: 5 }
  ];
  els.jarLiters.value       = "";
  els.targetLiters.value    = "";
  els.starterMl.value       = "";
  els.pellicleGrams.value   = "";
  els.temperatureInput.value = "";
  els.sugarPerLiter.value   = "";
  els.sugarTotal.value      = "";
  els.usePellicle.checked   = false;
  modeSnapshots[state.mode] = null;
  renderChoices();
  render();
}
function cancelSaveRecipe() {
  pendingRecipeSnapshot = null;
  els.saveRecipeDialog.close();
}

function commitRecipeTitle(card) {
  const recipe = findRecipe(card?.dataset.recipeId);
  const input = card?.querySelector(".title-edit-input");
  if (!recipe || !input) return;
  const nextName = input.value.trim() || recipe.recipeName || recipe.defaultRecipeName;
  recipe.recipeName = nextName;
  refreshRecipeShareText(recipe);
  persistSavedRecipes();
  renderSavedRecipes();
  const nextCard = els.savedRecipesList.querySelector(`[data-recipe-id="${recipe.id}"]`);
  showCardFeedback(nextCard, "Název uložený.");
}

function askDeleteRecipe(id) {
  pendingDeleteRecipeId = id;
  els.deleteRecipeDialog.showModal();
}

function confirmDeleteRecipe() {
  if (!pendingDeleteRecipeId) return;
  savedRecipes = savedRecipes.filter(recipe => recipe.id !== pendingDeleteRecipeId);
  pendingDeleteRecipeId = null;
  persistSavedRecipes();
  els.deleteRecipeDialog.close();
  renderSavedRecipes();
  showActionFeedback("Recept je pryč. Místo v zápisníku.");
}

// ═══ SYNC MODE UI ═══

function syncModeUI() {
  document.querySelectorAll(".mode-option").forEach(label => {
    label.classList.toggle("active", label.dataset.modeCard === state.mode);
    label.querySelector("input").checked = label.dataset.modeCard === state.mode;
  });
  els.goalStrip.hidden  = state.mode !== "classic";
  els.tempPanel.hidden  = state.mode !== "experiment";
  els.sugarPanel.classList.toggle("visible", state.mode === "experiment");
  els.teaIntro.textContent = state.mode === "classic"
    ? "Vyber jen čaje, které chceš použít. Poměr vody i gramáž doporučí Kombuchátor."
    : "Zadej skutečný stav: typ čaje, gramáž a kolik vody opravdu použiješ.";
  els.modeNote.innerHTML = state.mode === "classic"
    ? "<strong>Klasická kalkulačka:</strong> vybereš cíl a Kombuchátor doporučí bezpečné poměry."
    : "<strong>Experimentální laboratoř:</strong> zadáš reálné ingredience a Kombuchátor odhadne, co z toho vyleze.";
  els.jarChoice.classList.toggle("active", state.volumeSource === "jar");
  els.targetChoice.classList.toggle("active", state.volumeSource === "target");
}

function syncAutoVolumeFields(calc) {
  if (state.volumeSource === "jar") {
    els.targetLiters.value = displayLitersValue(calc.workingLiters);
  } else {
    els.jarLiters.value = displayLitersValue(calc.neededJar);
  }
}

// ═══ RENDER ═══

function render(options = {}) {
  const shouldRenderTeas = options.teas !== false;
  syncModeUI();
  const calc = calculate();
  syncAutoVolumeFields(calc);
  if (shouldRenderTeas) renderTeas(calc);
  updateStarter(calc);
  updateTea(calc);
  updatePellicle(calc);
  updateTemperature();
  updateSugar(calc);
  updateOutputs(calc);
}

// ═══ EVENTS ═══

function updateTeaFromDom(event) {
  const target = event?.target;
  if (event?.target.matches(".tea-type")) {
    const icon = event.target.closest(".tea-picker")?.querySelector(".tea-icon");
    if (icon) icon.src = teaTypes[event.target.value]?.icon ?? "";
  }
  const rows = Array.from(document.querySelectorAll(".tea-row[data-tea-id]"));
  const editedRow = target?.closest?.(".tea-row[data-tea-id]");
  const editedId = editedRow?.dataset.teaId;
  const editedField = target?.matches?.(".tea-ratio") ? "ratio"
    : target?.matches?.(".tea-water") ? "water"
    : target?.matches?.(".tea-grams") ? "grams"
    : target?.matches?.(".tea-total-grams") ? "totalGrams"
    : target?.matches?.(".tea-type") || target?.matches?.(".tea-check") ? "type"
    : "";
  const previousById = new Map(state.teas.map(t => [t.id, t]));

  // When editing a ratio, clear other pinned ratios if total would exceed 100
  let clearOtherRatios = false;
  if (editedId && editedField === "ratio") {
    const editedRatioVal = Math.round(parseFloat(target?.value || "0") || 0);
    const otherPinnedSum = state.teas
      .filter(t => t.id !== editedId && t.ratio !== "" && Number(t.ratio) > 0)
      .reduce((s, t) => s + Number(t.ratio), 0);
    clearOtherRatios = editedRatioVal + otherPinnedSum > 100;
  }

  const teas = rows.map(row => {
    const id = row.dataset.teaId;
    const type = row.querySelector(".tea-type").value;
    const previous = previousById.get(id) || {};
    const isEdited = id === editedId;
    const ratioInput = parseOptionalNumber(row.querySelector(".tea-ratio").value);
    const waterInputLiters = parseOptionalNumber(row.querySelector(".tea-water").value);
    const gramsInput = parseOptionalNumber(row.querySelector(".tea-grams").value);
    const gramsTotalInput = parseOptionalNumber(row.querySelector(".tea-total-grams").value);
    const lastEditedTeaField = id === editedId && editedField && editedField !== "type"
      ? editedField
      : previous.lastEditedTeaField;
    const ratio = isEdited && editedField === "ratio"
      ? ratioInput
      : (clearOtherRatios ? "" : (previous.ratio ?? ""));
    const waterMl = isEdited && editedField === "water"
      ? (waterInputLiters === "" ? "" : Math.max(0, waterInputLiters * 1000))
      : (lastEditedTeaField === "water" ? (previous.waterMl ?? "") : "");
    const grams = isEdited && editedField === "grams"
      ? gramsInput
      : (previous.grams ?? gramsInput);
    const gramsTotal = isEdited && editedField === "totalGrams"
      ? gramsTotalInput
      : (previous.gramsTotal ?? "");
    const waterL = Number(waterMl) > 0 ? Number(waterMl) / 1000 : 0;
    const resolvedGrams = lastEditedTeaField === "totalGrams" && Number(gramsTotal) > 0 && waterL > 0
      ? Number(gramsTotal) / waterL
      : (grams === "" ? (previous.grams || teaTypes[type].grams) : Math.max(0, Number(grams)));
    const resolvedTotalGrams = lastEditedTeaField === "grams" && Number(resolvedGrams) > 0 && waterL > 0
      ? resolvedGrams * waterL
      : (gramsTotal === "" ? previous.gramsTotal : Math.max(0, Number(gramsTotal)));

    return {
      id,
      enabled: row.querySelector(".tea-check").checked,
      type,
      ratio: ratio === "" ? "" : Math.round(Math.max(0, Math.min(100, Number(ratio)))),
      waterMl,
      grams: resolvedGrams,
      gramsTotal: resolvedTotalGrams,
      lastEditedTeaField
    };
  });

  state.teas = teas;
  render();
}

function bindEvents() {
  // Sidebar navigation
  els.navCalculator?.addEventListener("click", e => { e.preventDefault(); switchView("calculator"); });
  els.navZapisnik?.addEventListener("click", e => {
    e.preventDefault();
    renderSavedRecipes();
    switchView("zapisnik");
  });
  els.saveRecipeBtn?.addEventListener("click", openSaveRecipeDialog);
  els.resetCalcBtn?.addEventListener("click", resetCalculator);
  els.shareWhatsAppBtn.addEventListener("click", () => {
    const snapshot = currentSnapshotForSharing();
    if (snapshot) shareWhatsApp(snapshot.shareText);
  });
  els.copyRecipeBtn.addEventListener("click", () => {
    const snapshot = currentSnapshotForSharing();
    if (snapshot) copyText(snapshot.shareText);
  });
  els.cancelSaveRecipeX.addEventListener("click", cancelSaveRecipe);
  els.cancelSaveRecipeBtn.addEventListener("click", cancelSaveRecipe);
  els.confirmSaveRecipeBtn.addEventListener("click", confirmSaveRecipe);
  els.recipeNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmSaveRecipe();
    }
  });
  els.cancelDeleteRecipeBtn.addEventListener("click", () => {
    pendingDeleteRecipeId = null;
    els.deleteRecipeDialog.close();
  });
  els.confirmDeleteRecipeBtn.addEventListener("click", confirmDeleteRecipe);
  els.savedRecipesList.addEventListener("click", e => {
    const card = e.target.closest(".saved-recipe-card");
    if (!card) return;
    const recipe = findRecipe(card.dataset.recipeId);
    if (!recipe) return;
    if (e.target.closest(".edit-title")) {
      const row = card.querySelector(".saved-title-row");
      row.innerHTML = `
        <input class="title-edit-input" type="text" value="${escapeHtml(recipe.recipeName)}">
        <button class="recipe-action save-title" type="button">Uložit název</button>`;
      row.querySelector("input").focus();
      row.querySelector("input").select();
      return;
    }
    if (e.target.closest(".save-title")) {
      commitRecipeTitle(card);
      return;
    }
    if (e.target.closest(".share-whatsapp")) {
      refreshRecipeShareText(recipe);
      shareWhatsApp(recipe.shareText);
      return;
    }
    if (e.target.closest(".copy-share")) {
      refreshRecipeShareText(recipe);
      copyText(recipe.shareText, "Zkopírováno.");
      return;
    }
    if (e.target.closest(".load-to-calc")) {
      loadRecipeIntoCalculator(recipe);
      return;
    }
    if (e.target.closest(".toggle-note")) {
      const btn = e.target.closest(".toggle-note");
      const noteArea = card.querySelector(".recipe-note-area");
      const isHidden = noteArea.hidden;
      noteArea.hidden = !isHidden;
      if (!isHidden) {
        btn.textContent = recipe.userNote ? "Poznámka ✓" : "Přidat poznámku";
      } else {
        btn.textContent = "Skrýt poznámku";
        noteArea.querySelector("textarea")?.focus();
      }
      return;
    }
    if (e.target.closest(".delete-recipe")) {
      askDeleteRecipe(recipe.id);
    }
  });
  els.savedRecipesList.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.matches(".title-edit-input")) {
      e.preventDefault();
      commitRecipeTitle(e.target.closest(".saved-recipe-card"));
    }
  });
  els.savedRecipesList.addEventListener("focusout", e => {
    if (!e.target.matches(".title-edit-input")) return;
    window.setTimeout(() => {
      const card = e.target.closest(".saved-recipe-card");
      if (card?.contains(document.activeElement)) return;
      commitRecipeTitle(card);
    }, 0);
  });
  els.savedRecipesList.addEventListener("input", e => {
    if (!e.target.matches(".recipe-note textarea")) return;
    const card = e.target.closest(".saved-recipe-card");
    const recipe = findRecipe(card?.dataset.recipeId);
    if (!recipe) return;
    recipe.userNote = e.target.value;
    refreshRecipeShareText(recipe);
    persistSavedRecipes();
    const toggleBtn = card.querySelector(".toggle-note");
    if (toggleBtn) toggleBtn.textContent = recipe.userNote ? "Skrýt poznámku" : "Přidat poznámku";
    showCardFeedback(card, "Poznámka uložená.");
  });
  document.querySelectorAll("input[name='mode']").forEach(input => {
    input.addEventListener("change", () => {
      const newMode = input.value;
      if (newMode === state.mode) return;
      modeSnapshots[state.mode] = snapshotModeState();
      state.mode = newMode;
      restoreModeState(modeSnapshots[newMode] || defaultModeSnap());
      renderChoices();
      render();
    });
  });
  els.goalGrid.addEventListener("click", e => {
    const card = e.target.closest("[data-goal]");
    if (!card) return;
    state.goal = card.dataset.goal; renderChoices(); render();
  });
  els.starterType.addEventListener("click", e => {
    const btn = e.target.closest("[data-starter]");
    if (!btn) return;
    state.starterType = btn.dataset.starter; renderChoices(); render();
  });
  els.tempBand.addEventListener("click", e => {
    const btn = e.target.closest("[data-temp]");
    if (!btn) return;
    state.temperature = btn.dataset.temp; renderChoices(); render();
  });
  els.pellicleSize.addEventListener("click", e => {
    const btn = e.target.closest("[data-pellicle]");
    if (!btn) return;
    state.pellicleSize = btn.dataset.pellicle; renderChoices(); render();
  });
  [els.jarLiters, els.targetLiters, els.starterMl, els.pellicleGrams, els.sugarPerLiter, els.sugarTotal].forEach(input => {
    input.addEventListener("input", () => {
      if (input === els.jarLiters)     state.volumeSource = "jar";
      if (input === els.targetLiters)  state.volumeSource = "target";
      if (input === els.pellicleGrams) renderChoices();
      if (input === els.sugarPerLiter) state.sugarSource = "perLiter";
      if (input === els.sugarTotal)    state.sugarSource = "total";
      render();
    });
  });
  els.jarLiters.addEventListener("focus",    () => { state.volumeSource = "jar";    render(); });
  els.targetLiters.addEventListener("focus", () => { state.volumeSource = "target"; render(); });
  els.addTeaBtn.addEventListener("click", () => {
    state.teas.push({ id: createTeaId(), enabled: true, type: "rooibos", ratio: "", waterMl: "", grams: 6, gramsTotal: "", lastEditedTeaField: "" });
    render();
  });
  els.teaList.addEventListener("input",  updateTeaFromDom);
  els.teaList.addEventListener("change", updateTeaFromDom);
  els.teaList.addEventListener("click", e => {
    if (!e.target.closest(".remove-tea")) return;
    const row = e.target.closest(".tea-row");
    state.teas = state.teas.filter(t => t.id !== row.dataset.teaId);
    render();
  });
  els.temperatureInput.addEventListener("input", () => {
    const c = Number(els.temperatureInput.value);
    if (els.temperatureInput.value === "") {
      state.temperature = "room";
    } else if (Number.isFinite(c)) {
      if      (c < 20) state.temperature = "cold";
      else if (c <= 25) state.temperature = "room";
      else if (c <= 29) state.temperature = "warm";
      else              state.temperature = "hot";
    }
    renderChoices();
    render();
  });
  els.usePellicle.addEventListener("change", render);
  els.pellicleMinus.addEventListener("click", () => { state.pellicleCount = Math.max(1, state.pellicleCount - 1); render(); });
  els.pelliclePlus.addEventListener("click",  () => { state.pellicleCount += 1; render(); });
  els.howItWorksBtn.addEventListener("click",  () => els.howItWorksDialog.showModal());
  els.closeDialog.addEventListener("click",    () => els.howItWorksDialog.close());

  // Prevent negative values + enforce integer ratios — runs before other handlers (capture phase)
  document.addEventListener("keydown", e => {
    if (e.target.type !== "number") return;
    if (e.key === "-" || e.key === "e" || e.key === "E") { e.preventDefault(); return; }
    if (e.target.classList.contains("tea-ratio") && (e.key === "." || e.key === ",")) e.preventDefault();
  }, true);
  document.addEventListener("input", e => {
    const inp = e.target;
    if (inp.type !== "number" || inp.value === "") return;
    const num = parseFloat(String(inp.value).replace(",", "."));
    if (!isFinite(num)) return;
    const floor = inp.min !== "" ? parseFloat(inp.min) : 0;
    let result = Math.max(isFinite(floor) ? floor : 0, num);
    if (inp.classList.contains("tea-ratio")) result = Math.round(result);
    if (result !== num) inp.value = result;
  }, true);
}

renderChoices();
bindEvents();
render();
renderSavedRecipes();
