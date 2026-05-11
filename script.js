// ═══ DATA ═══

const goals = [
  { id: "gentle",   icon: "ikony/slabý čajíček_výluh z ponožek.png", title: "slabý čajíček",         note: "Lehká, jemná chuť.",       percent: 0.10, tasteDays: [2,  4]  },
  { id: "balanced", icon: "ikony/kombucha jak má být.png",            title: "kombucha jak má být",    note: "Vyvážený standard.",        percent: 0.13, tasteDays: [3,  6]  },
  { id: "tangy",    icon: "ikony/kyselejší limonádka.png",            title: "kyselejší limonáda",     note: "Výraznější říz.",           percent: 0.15, tasteDays: [5,  8]  },
  { id: "starter",  icon: "ikony/startér pro příště.png",             title: "startér pro příště",     note: "Kyselost je cíl.",          percent: 0.18, tasteDays: [7,  14] },
  { id: "enemy",    icon: "ikony/kyselina pro nepřátele.png",         title: "kyselina pro nepřátele", note: "Spíš čistič než pití.",     percent: 0.20, tasteDays: [14, 21] }
];

const starterTypes = {
  sweet:    { label: "sladký",  emoji: "😋", activityMultiplier: 0.50, min: 0.15, target: [0.15, 0.25], tasteOffset: +2, text: "Startér chutná jako sladký čaj. Počítej s pomalejším rozjezdem kvašení. Přidej víc kyselého startéru nebo zmenši várku." },
  weak:     { label: "slabý",   emoji: "😴", activityMultiplier: 0.70, min: 0.15, target: [0.15, 0.20], tasteOffset: +2, text: "Lehce kyselý, není to žádný silák. Nejspíš byl krátce fermentovaný. Použij ho víc nebo zmenši objem várky." },
  normal:   { label: "běžný",   emoji: "🙂", activityMultiplier: 1.00, min: 0.10, target: [0.10, 0.15], tasteOffset:  0, text: "Ideální startér, voní jako kombucha, je kyselý, ale pořád pitelný. Bez problému rozjede kvašení." },
  vinegary: { label: "octový",  emoji: "😖", activityMultiplier: 1.25, min: 0.08, target: [0.08, 0.12], tasteOffset: -1, text: "Výrazně kyselý základ, už není moc pitelný, ale poslouží jako rychlý motor pro další kvašení. Použij ho méně a dřív ochutnávej." }
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
  frost:   { label: "mráz",    emoji: "🧊", offset: +7, text: "Kombuchce je krutá zima. Pod 15 °C SCOBY usne a fermentace se prakticky zastaví. Přesuň nádobu na teplejší místo – jinak budeš čekat do jara." },
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
const SAVED_RECIPES_KEY  = "kombuchator.savedRecipes.v1";
const DELETED_BATCH_KEY  = "kombuchator.deletedBatchIds.v1";
const DELETED_RECIPE_KEY = "kombuchator.deletedRecipeIds.v1";
let savedRecipes = loadSavedRecipes();
let pendingRecipeSnapshot = null;
let pendingDeleteRecipeId = null;

const BATCHES_KEY = "kombuchator.batches.v1";
let batchFilter = "active";
let batchSearch = "";
let currentBatchDetailId = null;
let pendingCheckBatchId = null;
let pendingFinishBatchId = null;
let pendingDeleteBatchId = null;
let pendingDeleteCheckId = null;
let editingCheckId = null;
let editCheckTypes   = new Set(["taste"]);
let editCheckResults = new Set();
let pendingF1ToF2BatchId = null;
let f1ToF2ReminderDays = 2;
let newBatchType = "F1";
let newBatchReminderDays = 3;
let newCheckTypes   = new Set(["taste"]);
let newCheckResults = new Set();
let newCheckReminderDays = 0;
let newBatchRecipeSnapshot = null;
let pendingPickRecipeBatchId = null;
let batches = [];

function loadDeletedIds(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function persistDeletedIds() {
  localStorage.setItem(DELETED_BATCH_KEY,  JSON.stringify([...deletedBatchIds]));
  localStorage.setItem(DELETED_RECIPE_KEY, JSON.stringify([...deletedRecipeIds]));
}
let deletedBatchIds  = loadDeletedIds(DELETED_BATCH_KEY);
let deletedRecipeIds = loadDeletedIds(DELETED_RECIPE_KEY);

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
  starterCardTitle:   document.querySelector("#starterCardTitle"),
  teaCardTitle:       document.querySelector("#teaCardTitle"),
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
  closeDialog:        document.querySelector("#closeDialog"),
  // Moje Várky
  navVarky:             document.querySelector("#navVarky"),
  navVarkyBadge:        document.querySelector("#navVarkyBadge"),
  varkyView:            document.querySelector("#varkyView"),
  batchDetailView:      document.querySelector("#batchDetailView"),
  newBatchBtn:          document.querySelector("#newBatchBtn"),
  varkyFilterPills:     document.querySelector("#varkyFilterPills"),
  varkySearch:          document.querySelector("#varkySearch"),
  varkyList:            document.querySelector("#varkyList"),
  batchDetailBackBtn:   document.querySelector("#batchDetailBackBtn"),
  batchDetailBody:      document.querySelector("#batchDetailBody"),
  startBatchBtn:        document.querySelector("#startBatchBtn"),
  reminderBanner:       document.querySelector("#reminderBanner"),
  reminderBannerText:   document.querySelector("#reminderBannerText"),
  reminderGoToVarkyBtn: document.querySelector("#reminderGoToVarkyBtn"),
  reminderSnoozeBtn:    document.querySelector("#reminderSnoozeBtn"),
  reminderDoneBtn:      document.querySelector("#reminderDoneBtn"),
  reminderDismissBtn:   document.querySelector("#reminderDismissBtn"),
  newBatchDialog:       document.querySelector("#newBatchDialog"),
  newBatchName:         document.querySelector("#newBatchName"),
  newBatchDate:         document.querySelector("#newBatchDate"),
  newBatchTime:         document.querySelector("#newBatchTime"),
  newBatchTypeSeg:      document.querySelector("#newBatchTypeSeg"),
  newBatchReminderQuick:document.querySelector("#newBatchReminderQuick"),
  newBatchNote:         document.querySelector("#newBatchNote"),
  closeNewBatchBtn:     document.querySelector("#closeNewBatchBtn"),
  cancelNewBatchBtn:    document.querySelector("#cancelNewBatchBtn"),
  confirmNewBatchBtn:   document.querySelector("#confirmNewBatchBtn"),
  newCheckDialog:       document.querySelector("#newCheckDialog"),
  newCheckDate:         document.querySelector("#newCheckDate"),
  newCheckTime:         document.querySelector("#newCheckTime"),
  checkTypeChips:       document.querySelector("#checkTypeChips"),
  checkResultChips:     document.querySelector("#checkResultChips"),
  checkResultArea:      document.querySelector("#checkResultArea"),
  newCheckNote:         document.querySelector("#newCheckNote"),
  checkReminderQuick:   document.querySelector("#checkReminderQuick"),
  closeNewCheckBtn:     document.querySelector("#closeNewCheckBtn"),
  cancelNewCheckBtn:    document.querySelector("#cancelNewCheckBtn"),
  confirmNewCheckBtn:   document.querySelector("#confirmNewCheckBtn"),
  finishBatchDialog:    document.querySelector("#finishBatchDialog"),
  finishResultGroup:    document.querySelector("#finishResultGroup"),
  finishBatchNote:      document.querySelector("#finishBatchNote"),
  closeFinishBatchBtn:  document.querySelector("#closeFinishBatchBtn"),
  cancelFinishBatchBtn: document.querySelector("#cancelFinishBatchBtn"),
  confirmFinishBatchBtn:document.querySelector("#confirmFinishBatchBtn"),
  deleteBatchDialog:    document.querySelector("#deleteBatchDialog"),
  cancelDeleteBatchBtn: document.querySelector("#cancelDeleteBatchBtn"),
  confirmDeleteBatchBtn:document.querySelector("#confirmDeleteBatchBtn"),
  deleteCheckDialog:    document.querySelector("#deleteCheckDialog"),
  cancelDeleteCheckBtn: document.querySelector("#cancelDeleteCheckBtn"),
  confirmDeleteCheckBtn:document.querySelector("#confirmDeleteCheckBtn"),
  editCheckDialog:      document.querySelector("#editCheckDialog"),
  closeEditCheckBtn:    document.querySelector("#closeEditCheckBtn"),
  cancelEditCheckBtn:   document.querySelector("#cancelEditCheckBtn"),
  confirmEditCheckBtn:  document.querySelector("#confirmEditCheckBtn"),
  editCheckTypeChips:   document.querySelector("#editCheckTypeChips"),
  editCheckResultChips: document.querySelector("#editCheckResultChips"),
  editCheckResultArea:  document.querySelector("#editCheckResultArea"),
  editCheckDate:        document.querySelector("#editCheckDate"),
  editCheckTime:        document.querySelector("#editCheckTime"),
  editCheckNote:        document.querySelector("#editCheckNote"),
  f1ToF2Dialog:         document.querySelector("#f1ToF2Dialog"),
  closeF1ToF2Btn:       document.querySelector("#closeF1ToF2Btn"),
  cancelF1ToF2Btn:      document.querySelector("#cancelF1ToF2Btn"),
  confirmF1ToF2Btn:     document.querySelector("#confirmF1ToF2Btn"),
  f1ToF2Name:           document.querySelector("#f1ToF2Name"),
  f1ToF2Date:           document.querySelector("#f1ToF2Date"),
  f1ToF2Time:           document.querySelector("#f1ToF2Time"),
  f1ToF2Note:           document.querySelector("#f1ToF2Note"),
  f1ToF2ReminderQuick:  document.querySelector("#f1ToF2ReminderQuick"),
  f1ToF2CustomReminder: document.querySelector("#f1ToF2CustomReminder"),
  f1ToF2CustomDate:     document.querySelector("#f1ToF2CustomDate"),
  f1ToF2CustomTime:     document.querySelector("#f1ToF2CustomTime"),
  riskBatchDialog:      document.querySelector("#riskBatchDialog"),
  cancelRiskBatchBtn:   document.querySelector("#cancelRiskBatchBtn"),
  confirmRiskBatchBtn:  document.querySelector("#confirmRiskBatchBtn"),
  mainHeader:          document.querySelector("#mainHeader"),
  newBatchCustomReminder: document.querySelector("#newBatchCustomReminder"),
  newBatchCustomDate:  document.querySelector("#newBatchCustomDate"),
  newBatchCustomTime:  document.querySelector("#newBatchCustomTime"),
  checkCustomReminder: document.querySelector("#checkCustomReminder"),
  checkCustomDate:     document.querySelector("#checkCustomDate"),
  checkCustomTime:     document.querySelector("#checkCustomTime"),
  pickRecipeDialog:    document.querySelector("#pickRecipeDialog"),
  closePickRecipeBtn:  document.querySelector("#closePickRecipeBtn"),
  cancelPickRecipeBtn: document.querySelector("#cancelPickRecipeBtn"),
  clearBatchRecipeBtn: document.querySelector("#clearBatchRecipeBtn"),
  pickRecipeList:      document.querySelector("#pickRecipeList")
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
  return low === high ? `${low} g` : `${low}–${high} g`;
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
  broadcastSync("recipes-updated");
  syncWithServer();
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
  if (!recipe || !recipe.teas) return `<p class="batch-no-recipe">Ingredience nejsou k dispozici.</p>`;
  const teaLines = recipe.teas.map(t => {
    const lbl = teaTypes[t.type]?.label || t.type;
    const icon = teaTypes[t.type]?.icon || "";
    const gramsStr = recipe.mode === "experiment"
      ? `${Math.round(t.totalGrams)} g`
      : approxRange(t.totalGrams, 1);
    return `<li class="needs-tea-item"><img src="${escapeHtml(icon)}" alt="" aria-hidden="true"><span><strong>${escapeHtml(lbl[0].toUpperCase() + lbl.slice(1))} čaj:</strong> ${roundLiters(t.waterMl / 1000)} vody, <span class="needs-tea-grams">${gramsStr} čaje</span></span></li>`;
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
    <li><img src="ikony/cukr.png" alt="" aria-hidden="true"><span><strong>Cukr:</strong> ${recipe.mode === "experiment" ? `${Math.round(recipe.sugarTotalGrams)} g` : approxRange(recipe.sugarTotalGrams, 5)}</span></li>
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
    temperatureBand: state.temperature || null,
    status,
    starterSeverity: calc.starterSeverity,
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
  if (els.calculatorView)  els.calculatorView.hidden  = viewName !== "calculator";
  if (els.varkyView)       els.varkyView.hidden        = viewName !== "varky";
  if (els.batchDetailView) els.batchDetailView.hidden  = viewName !== "batchDetail";
  if (els.savedRecipesView) els.savedRecipesView.hidden = viewName !== "zapisnik";
  const isCalc    = viewName === "calculator";
  const isVarky   = viewName === "varky" || viewName === "batchDetail";
  const isZapisnik = viewName === "zapisnik";
  if (els.mainHeader) els.mainHeader.hidden = !isCalc;
  if (els.navCalculator) { els.navCalculator.classList.toggle("active", isCalc);    els.navCalculator.ariaCurrent = isCalc ? "page" : null; }
  if (els.navVarky)      { els.navVarky.classList.toggle("active", isVarky);         els.navVarky.ariaCurrent = isVarky ? "page" : null; }
  if (els.navZapisnik)   { els.navZapisnik.classList.toggle("active", isZapisnik);   els.navZapisnik.ariaCurrent = isZapisnik ? "page" : null; }
}
function loadRecipeIntoCalculator(recipe) {
  state.mode = recipe.mode || "classic";
  state.goal = recipe.goalId || "balanced";
  state.starterType = recipe.starterTypeKey || "normal";
  state.volumeSource = recipe.volumeSource || "jar";
  if (recipe.vesselVolumeL) els.jarLiters.value = recipe.vesselVolumeL;
  if (recipe.desiredOutputL) els.targetLiters.value = recipe.desiredOutputL;
  els.starterMl.value = recipe.starterMl || 0;
  // Restore sugar
  state.sugarSource = "perLiter";
  els.sugarPerLiter.value = recipe.sugarGramsPerLiter ? Math.round(recipe.sugarGramsPerLiter) : "";
  els.sugarTotal.value = "";
  els.usePellicle.checked = recipe.pellicleEnabled ?? true;
  if (recipe.pellicleType) state.pellicleSize = recipe.pellicleType;
  state.pellicleCount = recipe.pellicleCount || 1;
  els.pellicleGrams.value = recipe.pellicleGrams || "";
  // Restore temperature
  els.temperatureInput.value = recipe.temperatureC != null ? String(recipe.temperatureC) : "";
  state.temperature = recipe.temperatureBand || null;
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

  if (els.starterCardTitle) els.starterCardTitle.textContent = state.mode === "experiment" ? "Čím to nastartujeme?" : "Kolik máš startéru?";
  if (els.teaCardTitle) els.teaCardTitle.textContent = state.mode === "experiment" ? "V čem bude SCOBY plavat?" : "Jaký chceš použít čaj?";

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
  if (state.mode === "experiment" && state.temperature === "frost")
    warnings.push("Kombuchce je krutá zima. Pod 15 °C fermentace skoro zamrzne. Přesuň nádobu na teplejší místo.");
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
  const status = (state.temperature === "hot" || state.temperature === "frost") ? "danger" : (state.temperature === "cold" || state.temperature === "warm" ? "warn" : "ok");
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
    const gramsStr = state.mode === "experiment"
      ? `${Math.round(t.gramsTotal)} g`
      : approxRange(t.gramsTotal, 1);
    return `<li class="needs-tea-item"><img src="${teaTypes[t.type].icon}" alt="" aria-hidden="true"><span><strong>${lbl[0].toUpperCase()}${lbl.slice(1)} čaj:</strong> ${roundLiters(t.waterMl / 1000)} vody, <span class="needs-tea-grams">${gramsStr} čaje</span></span></li>`;
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
    <li><img src="ikony/cukr.png"               alt="" aria-hidden="true"><span><strong>Cukr:</strong> ${state.mode === "experiment" ? `${Math.round(calc.sugarTotal)} g` : approxRange(calc.sugarTotal, 5)}</span></li>
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
  const tempNote = state.mode === "experiment" && calc.tempBand.text ? `<br><span class="temp-note">${calc.tempBand.text}</span>` : "";

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
  [els.saveRecipeBtn, els.startBatchBtn].forEach(btn => {
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
          <button class="recipe-title-pencil" type="button" title="Změnit název">✏️</button>
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
        <button class="recipe-action load-to-calc" type="button">Nahrát do kalkulačky</button>
        <button class="recipe-action start-batch" type="button">Založ várku</button>
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
    teas: [],
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
  state.teas = [];
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
  deletedRecipeIds.add(pendingDeleteRecipeId);
  persistDeletedIds();
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
    if (e.target.closest(".edit-title") || e.target.closest(".recipe-title-pencil")) {
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
    state.teas.push({ id: createTeaId(), enabled: true, type: "black", ratio: "", waterMl: "", grams: 6, gramsTotal: "", lastEditedTeaField: "" });
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
      if      (c < 15) state.temperature = "frost";
      else if (c < 20) state.temperature = "cold";
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
  bindBatchEvents();
}

// ═══ SYNC ═══

let syncChannel = null;
try {
  syncChannel = new BroadcastChannel("kombuchator-sync");
  syncChannel.onmessage = e => {
    if (e.data === "batches-updated") {
      batches = loadBatches();
      renderVarkyView();
      checkReminders();
    } else if (e.data === "recipes-updated") {
      savedRecipes = loadSavedRecipes();
      renderSavedRecipes();
    }
  };
} catch (err) { /* BroadcastChannel not supported */ }

function broadcastSync(type) {
  try { syncChannel?.postMessage(type); } catch (err) { /* ignore */ }
}

// ═══ MOJE VÁRKY ═══

const checkResultInfo = {
  // Ochutnávka
  still_sweet:      { label: "Pořád sladké",  css: "tag-sweet" },
  slightly_sour:    { label: "Jemně nakyslé", css: "tag-slightly-sour" },
  balanced:         { label: "Akorát",         css: "tag-balanced" },
  sharp:            { label: "Má říz",         css: "tag-sharp" },
  too_sour:         { label: "Moc kyselé",     css: "tag-too-sour" },
  suspicious:       { label: "Podezřelé",      css: "tag-suspicious" },
  // Vizuální kontrola
  clear:            { label: "Čirá",           css: "tag-clear" },
  cloudy:           { label: "Zakalená",       css: "tag-cloudy" },
  bubbling:         { label: "Bublá",          css: "tag-bubbling" },
  mold:             { label: "Plíseň",         css: "tag-mold" },
  kris:             { label: "Křís",           css: "tag-kris" },
  new_pellicle:     { label: "Nová placka",    css: "tag-pellicle" },
  // Kontrola tlaku
  no_pressure:      { label: "Žádný tlak",     css: "tag-no-bubbles" },
  normal_pressure:  { label: "V normě",        css: "tag-good-bubbles" },
  high_pressure:    { label: "Přetlak",        css: "tag-pressure" },
  explosion:        { label: "Exploze!",       css: "tag-explosion" },
  // Stavy / akce (vždy viditelné)
  no_change:        { label: "Beze změny",     css: "tag-custom" },
  bottle_f1:        { label: "Stočení F1",     css: "tag-action" },
  move_to_f2:       { label: "Přesun do F2",   css: "tag-action" },
  move_to_fridge:   { label: "Do lednice",     css: "tag-fridge" },
  finish_batch:     { label: "Ukončení várky", css: "tag-action" },
};

const checkTypeInfo = {
  taste:          "Ochutnávka",
  visual_check:   "Vizuální kontrola",
  pressure_check: "Kontrola tlaku",
};

const tasteResultKeys    = ["still_sweet", "slightly_sour", "balanced", "sharp", "too_sour", "suspicious"];
const visualResultKeys   = ["clear", "cloudy", "bubbling", "mold", "kris", "new_pellicle"];
const pressureResultKeys = ["no_pressure", "normal_pressure", "high_pressure", "explosion"];
const actionResultKeys   = ["no_change", "bottle_f1", "move_to_f2", "move_to_fridge", "finish_batch"];

const finalResultLabels = {
  success:         "Povedla se",
  too_sweet:       "Moc sladká",
  too_sour:        "Moc kyselá",
  used_as_starter: "Použito jako startér",
  failed:          "Nepovedla se / vyhozeno"
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowTimeHHMM() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}
function formatBatchDate(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}
function formatBatchDateShort(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
}
function formatBatchTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}
function getBatchDay(batch) {
  return Math.max(1, Math.floor((Date.now() - new Date(batch.fermentationStartedAt).getTime()) / 86400000) + 1);
}
function hasDueReminder(batch) {
  const now = Date.now();
  return batch.reminders.some(r => r.status === "pending" && new Date(r.remindAt).getTime() <= now);
}
function getDueCount() {
  return batches.filter(b => !b.finished && hasDueReminder(b)).length;
}
function getBatchStatus(batch) {
  if (batch.finished) return "finished";
  if (hasDueReminder(batch)) return "needs_tasting";
  return "active";
}
function getBatchStatusLabel(status) {
  return { active: "Běží", needs_tasting: "Dnes ochutnat", finished: "Hotovo" }[status] || "Běží";
}
function findBatch(id) { return batches.find(b => b.id === id); }

function loadBatches() {
  try { return JSON.parse(localStorage.getItem(BATCHES_KEY) || "[]"); } catch { return []; }
}
function persistBatches() {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  broadcastSync("batches-updated");
  syncWithServer();
}

function checkTagHtml(result) {
  const info = checkResultInfo[result];
  if (!info) return "";
  return `<span class="check-tag ${info.css}">${escapeHtml(info.label)}</span>`;
}

// Handles both old (checkType string) and new (checkTypes array) format
function checkTypesLabel(check) {
  const types = check.checkTypes || (check.checkType ? [check.checkType] : []);
  return types.map(t => checkTypeInfo[t] || t).join(", ") || "Kontrola";
}

// Renders all result tags (old result string OR new checkResults array)
function checkResultTags(check) {
  const results = check.checkResults || (check.result && check.result !== "custom" ? [check.result] : []);
  return results.map(r => checkTagHtml(r)).join("");
}

// Check if a check contains a specific result (both formats)
function checkHasResult(check, resultKey) {
  if (check.checkResults) return check.checkResults.includes(resultKey);
  return check.result === resultKey;
}

function getFilterCounts() {
  return {
    active: batches.filter(b => !b.finished).length,
    due:    batches.filter(b => !b.finished && hasDueReminder(b)).length,
    f1:     batches.filter(b => !b.finished && b.type === "F1").length,
    f2:     batches.filter(b => !b.finished && b.type === "F2").length,
    done:   batches.filter(b => b.finished).length
  };
}

function filterBatches() {
  let result = [...batches];
  if (batchFilter === "active") result = result.filter(b => !b.finished);
  else if (batchFilter === "due")  result = result.filter(b => !b.finished && hasDueReminder(b));
  else if (batchFilter === "f1")   result = result.filter(b => !b.finished && b.type === "F1");
  else if (batchFilter === "f2")   result = result.filter(b => !b.finished && b.type === "F2");
  else if (batchFilter === "done") result = result.filter(b => b.finished);
  if (batchSearch.trim()) {
    const q = batchSearch.trim().toLowerCase();
    result = result.filter(b => b.batchName.toLowerCase().includes(q));
  }
  return result.sort((a, b) => new Date(b.fermentationStartedAt) - new Date(a.fermentationStartedAt));
}

function recipeSnapshotSummary(snap) {
  if (!snap) return "";
  const parts = [];
  if (snap.workingVolumeL) parts.push(roundLiters(snap.workingVolumeL));
  if (snap.teas && snap.teas.length) {
    const teaLabel = snap.teas.map(t => (teaTypes[t.type]?.label || t.type) + " čaj").join(", ");
    parts.push(teaLabel);
  }
  if (snap.starterMl) parts.push(roundMl(snap.starterMl) + " startéru");
  return parts.join(" · ");
}

function updateVarkyBadge() {
  if (!els.navVarkyBadge) return;
  const active = batches.filter(b => !b.finished).length;
  els.navVarkyBadge.textContent = active || "";
  els.navVarkyBadge.hidden = active === 0;
}

function checkReminders() {
  if (!els.reminderBanner) return;
  updateVarkyBadge();
  const due = getDueCount();
  if (due === 0) { els.reminderBanner.hidden = true; return; }
  els.reminderBannerText.textContent = due === 1 ? "Dnes máš ochutnat 1 várku." : `Máš ${due} připomínky k várkám.`;
  els.reminderBanner.hidden = false;
}

function renderFilterPills() {
  if (!els.varkyFilterPills) return;
  const counts = getFilterCounts();
  const pills = [
    { id: "active", label: "Aktivní",       count: counts.active },
    { id: "due",    label: "Dnes k řešení", count: counts.due },
    { id: "f1",     label: "F1",            count: counts.f1 },
    { id: "f2",     label: "F2",            count: counts.f2 },
    { id: "done",   label: "Hotové",        count: counts.done }
  ];
  els.varkyFilterPills.innerHTML = pills.map(p => `
    <button class="varky-pill${batchFilter === p.id ? " active" : ""}" type="button" data-filter="${p.id}">
      ${escapeHtml(p.label)}<span class="pill-count">${p.count}</span>
    </button>`).join("");
}

function renderBatchCard(batch) {
  const status = getBatchStatus(batch);
  const day = getBatchDay(batch);
  const lastCheck = batch.checks.length ? batch.checks[batch.checks.length - 1] : null;
  const nextReminder = batch.reminders.find(r => r.status === "pending");
  const summary = recipeSnapshotSummary(batch.recipeSnapshot);
  return `
    <article class="batch-card batch-status-${status}" data-batch-id="${batch.id}">
      <div class="batch-card-top">
        <div class="batch-card-title-row">
          <h3 class="batch-card-name" data-batch-title>${escapeHtml(batch.batchName)}</h3>
          <button class="batch-edit-name" type="button" title="Změnit název">✏️</button>
        </div>
        <div class="batch-card-badges">
          <span class="batch-type-badge badge-${batch.type.toLowerCase()}">${batch.type}</span>
          <span class="batch-status-badge status-${status}">${getBatchStatusLabel(status)}</span>
        </div>
      </div>
      <p class="batch-card-meta">${formatBatchDate(batch.fermentationStartedAt)} · ${day}. den</p>
      ${summary ? `<p class="batch-card-recipe">${escapeHtml(summary)}</p>` : ""}
      ${lastCheck ? `
        <div class="batch-last-check">
          <span class="batch-last-check-label">Poslední kontrola:</span>
          ${checkResultTags(lastCheck)}
          ${lastCheck.note ? `<span class="batch-check-note">&ldquo;${escapeHtml(lastCheck.note)}&rdquo;</span>` : ""}
        </div>` : ""}
      <p class="batch-next-step${nextReminder ? "" : " no-reminder"}">
        ${nextReminder ? `Další krok: ${escapeHtml(nextReminder.title)} – ${formatBatchDate(nextReminder.remindAt)}` : "Bez připomínky"}
      </p>
      <div class="batch-card-actions">
        <button class="recipe-action primary batch-add-check" type="button">Kontrola várky</button>
        ${!batch.finished ? `<button class="recipe-action danger batch-finish" type="button" data-batch-id="${batch.id}">Ukončení várky</button>` : ""}
        <button class="recipe-action batch-show-detail" type="button">Detail</button>
      </div>
    </article>`;
}

function renderBatchTableRow(batch) {
  const status = getBatchStatus(batch);
  const day = getBatchDay(batch);
  const lastChecks = batch.checks.slice(-3).reverse();
  const nextReminder = batch.reminders.find(r => r.status === "pending");
  const summary = recipeSnapshotSummary(batch.recipeSnapshot);
  return `
    <tr class="batch-row batch-status-${status}" data-batch-id="${batch.id}">
      <td class="batch-col-date">
        <strong>${formatBatchDate(batch.fermentationStartedAt)}</strong><br>
        <span class="batch-time">${formatBatchTime(batch.fermentationStartedAt)}</span><br>
        <span class="batch-day-num">${day}. den</span>
      </td>
      <td class="batch-col-type">
        <span class="batch-type-badge badge-${batch.type.toLowerCase()}">${batch.type}</span>
      </td>
      <td class="batch-col-name">
        <div class="batch-name-row" data-batch-id="${batch.id}">
          <span class="batch-name-text" data-batch-title>${escapeHtml(batch.batchName)}</span>
          <button class="batch-edit-name" type="button" title="Změnit název">✏️</button>
        </div>
      </td>
      <td class="batch-col-recipe">${summary ? escapeHtml(summary) : `<span class="batch-no-reminder">—</span>`}</td>
      <td class="batch-col-status">
        <span class="batch-status-badge status-${status}">${getBatchStatusLabel(status)}</span>
      </td>
      <td class="batch-col-checks">
        ${lastChecks.length
          ? lastChecks.map(c => `<div class="batch-check-mini">${checkResultTags(c)}<span class="batch-check-date">${formatBatchDateShort(c.checkedAt)}</span></div>`).join("")
          : `<span class="batch-no-checks">Zatím žádné kontroly</span>`}
        ${batch.checks.length > 3 ? `<button class="batch-more-checks" type="button" data-batch-id="${batch.id}">+${batch.checks.length - 3} další</button>` : ""}
      </td>
      <td class="batch-col-next">
        ${nextReminder
          ? `<span class="batch-next-text">${escapeHtml(nextReminder.title)}<br><small>${formatBatchDate(nextReminder.remindAt)}</small></span>`
          : `<span class="batch-no-reminder">Bez připomínky</span>`}
      </td>
      <td class="batch-col-actions">
        <button class="recipe-action primary batch-add-check" type="button">Kontrola várky</button>
        ${!batch.finished ? `<button class="recipe-action danger batch-finish" type="button" data-batch-id="${batch.id}">Ukončení várky</button>` : ""}
        <button class="recipe-action batch-show-detail" type="button">Detail</button>
      </td>
    </tr>`;
}

function renderVarkyView() {
  if (!els.varkyList) return;
  renderFilterPills();
  updateVarkyBadge();
  const filtered = filterBatches();
  if (!filtered.length) {
    els.varkyList.innerHTML = `
      <div class="saved-empty">
        <strong>${batchFilter === "done" ? "Žádné hotové várky." : batchFilter === "due" ? "Žádné várky dnes k řešení." : "Zatím tu žádná várka nebublá."}</strong>
        <p>${batchFilter === "done" ? "Dokončené várky se tady ukážou." : "Založ první z kalkulačky nebo ručně."}</p>
        ${batchFilter === "active" ? `<button class="recipe-action primary batch-empty-add" type="button" style="margin-top:12px">+ Přidat várku</button>` : ""}
      </div>`;
    return;
  }
  const tableHtml = `
    <div class="batch-table-wrap">
      <table class="batch-table">
        <thead><tr>
          <th>Založeno</th><th>Typ</th><th>Název</th><th>Recept</th><th>Stav</th><th>Poslední kontroly</th><th>Další krok</th><th>Akce</th>
        </tr></thead>
        <tbody>${filtered.map(renderBatchTableRow).join("")}</tbody>
      </table>
    </div>`;
  const cardsHtml = `<div class="batch-cards">${filtered.map(renderBatchCard).join("")}</div>`;
  els.varkyList.innerHTML = tableHtml + cardsHtml;
}

function renderBatchDetail(batchId) {
  const batch = findBatch(batchId);
  if (!batch || !els.batchDetailBody) return;
  currentBatchDetailId = batchId;
  const status = getBatchStatus(batch);
  const day = getBatchDay(batch);
  const activeReminders = batch.reminders.filter(r => r.status === "pending");
  const allEntries = [
    { time: batch.fermentationStartedAt, type: "start", note: batch.startNote },
    ...batch.checks.map(c => ({ time: c.checkedAt, type: "check", check: c }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  els.batchDetailBody.innerHTML = `
    <div class="batch-detail-header-card" data-batch-id="${batch.id}">
      <div class="batch-detail-title-row">
        <div class="batch-detail-name-wrap">
          <h2 class="batch-detail-name" data-batch-title>${escapeHtml(batch.batchName)}</h2>
          <button class="batch-edit-name" type="button" title="Změnit název">✏️</button>
        </div>
        <div class="batch-detail-badges">
          <span class="batch-type-badge badge-${batch.type.toLowerCase()}">${batch.type}</span>
          <span class="batch-status-badge status-${status}">${getBatchStatusLabel(status)}</span>
        </div>
      </div>
      <div class="batch-detail-meta-row">
        <span>Začátek: <strong>${formatBatchDate(batch.fermentationStartedAt)} ${formatBatchTime(batch.fermentationStartedAt)}</strong></span>
        <span>${day}. den fermentace</span>
      </div>
      ${activeReminders.length ? `
        <div class="batch-reminders">
          <strong>Připomínky:</strong>
          ${activeReminders.map(r => `<span class="batch-reminder-chip">${escapeHtml(r.title)} – ${formatBatchDate(r.remindAt)}</span>`).join("")}
        </div>` : ""}
    </div>
    <div class="batch-detail-actions">
      <button class="recipe-action primary batch-add-check" type="button" data-batch-id="${batch.id}">+ Zapsat kontrolu</button>
      ${!batch.finished ? `<button class="recipe-action danger batch-finish" type="button" data-batch-id="${batch.id}">Ukončit várku</button>` : ""}
      <button class="recipe-action danger batch-delete" type="button" data-batch-id="${batch.id}">Smazat</button>
    </div>
    ${batch.finished ? `
      <div class="batch-finished-note">
        <strong>Várka ukončena: ${escapeHtml(finalResultLabels[batch.finalResult] || "–")}</strong>
        ${batch.finalNote ? `<p>${escapeHtml(batch.finalNote)}</p>` : ""}
        <small>Ukončeno: ${formatBatchDate(batch.finishedAt)}</small>
      </div>` : ""}
    <div class="batch-recipe-block">
      <div class="batch-recipe-block-header">
        <strong>Recept</strong>
        <button class="timeline-action-btn pick-recipe-btn" type="button" data-batch-id="${batch.id}">${batch.recipeSnapshot ? "Změnit" : "Přiřadit ze zápisníku"}</button>
      </div>
      ${batch.recipeSnapshot ? renderRecipeNeeds(batch.recipeSnapshot) : `<p class="batch-no-recipe">K várce není přiřazen žádný recept.</p>`}
    </div>
    <h3 class="batch-timeline-heading">Průběh várky</h3>
    <div class="batch-timeline">
      ${allEntries.map(entry => {
        if (entry.type === "start") return `
          <div class="timeline-entry timeline-start">
            <div class="timeline-dot dot-start"></div>
            <div class="timeline-content">
              <span class="timeline-date">${formatBatchDate(entry.time)} ${formatBatchTime(entry.time)}</span>
              <strong>Várka založena</strong>
              ${entry.note ? `<p class="timeline-note">${escapeHtml(entry.note)}</p>` : ""}
            </div>
          </div>`;
        const c = entry.check;
        return `
          <div class="timeline-entry timeline-check" data-check-id="${c.id}" data-batch-id="${batch.id}">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">${formatBatchDate(c.checkedAt)} ${formatBatchTime(c.checkedAt)}</span>
              <strong>${escapeHtml(checkTypesLabel(c))}</strong>
              ${checkResultTags(c)}
              ${c.note ? `<p class="timeline-note">${escapeHtml(c.note)}</p>` : ""}
              <div class="timeline-check-actions">
                <button class="timeline-action-btn check-edit-btn" type="button" data-check-id="${c.id}" data-batch-id="${batch.id}">Upravit</button>
                <button class="timeline-action-btn check-delete-btn" type="button" data-check-id="${c.id}" data-batch-id="${batch.id}">Smazat</button>
              </div>
            </div>
          </div>`;
      }).join("")}
    </div>`;
  switchView("batchDetail");
}

// ── New Batch Dialog ──

function openNewBatchDialog(recipeSnapshot) {
  newBatchType = "F1";
  newBatchReminderDays = 3;
  newBatchRecipeSnapshot = recipeSnapshot || null;
  if (els.newBatchName) els.newBatchName.value = recipeSnapshot?.recipeName ? `Várka – ${recipeSnapshot.recipeName}` : "";
  if (els.newBatchDate) els.newBatchDate.value = todayISO();
  if (els.newBatchTime) els.newBatchTime.value = nowTimeHHMM();
  if (els.newBatchNote) els.newBatchNote.value = "";
  els.newBatchTypeSeg?.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.btype === "F1"));
  els.newBatchReminderQuick?.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.rdays === "3"));
  if (els.newBatchCustomReminder) els.newBatchCustomReminder.hidden = true;
  if (els.newBatchCustomDate) els.newBatchCustomDate.value = todayISO();
  if (els.newBatchCustomTime) els.newBatchCustomTime.value = nowTimeHHMM();
  els.newBatchDialog?.showModal();
  els.newBatchName?.focus();
}

function confirmNewBatch() {
  const name = els.newBatchName?.value.trim() || "Moje várka";
  const dateStr = els.newBatchDate?.value || todayISO();
  const timeStr = els.newBatchTime?.value || "12:00";
  const startedAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
  const reminders = [];
  if (newBatchReminderDays === -1) {
    const cd = els.newBatchCustomDate?.value || todayISO();
    const ct = els.newBatchCustomTime?.value || "12:00";
    reminders.push({ id: uid(), type: "taste", title: "Ochutnat", remindAt: new Date(`${cd}T${ct}:00`).toISOString(), status: "pending", note: null });
  } else if (newBatchReminderDays > 0) {
    const remindAt = new Date(new Date(startedAt).getTime() + newBatchReminderDays * 86400000).toISOString();
    reminders.push({ id: uid(), type: "taste", title: "Ochutnat", remindAt, status: "pending", note: null });
  }
  const batch = {
    id: uid(), batchName: name, type: newBatchType,
    fermentationStartedAt: startedAt, createdAt: new Date().toISOString(),
    finished: false, finishedAt: null, finalResult: null, finalNote: null,
    startNote: els.newBatchNote?.value.trim() || null,
    recipeSnapshot: newBatchRecipeSnapshot || null,
    checks: [], reminders, deletedCheckIds: []
  };
  batches.unshift(batch);
  persistBatches();
  els.newBatchDialog?.close();
  renderVarkyView();
  checkReminders();
  switchView("varky");
  showActionFeedback("Várku máš založenou. Teď už ji jen nenech zapomenutou v koutě.");
}

// ── New Check Dialog ──

function openNewCheckDialog(batchId) {
  const batch = findBatch(batchId);
  if (!batch) return;
  pendingCheckBatchId = batchId;
  newCheckTypes   = new Set(["taste"]);
  newCheckResults = new Set();
  newCheckReminderDays = 0;
  const minDate = batch.fermentationStartedAt.slice(0, 10);
  if (els.newCheckDate) { els.newCheckDate.value = todayISO(); els.newCheckDate.min = minDate; }
  if (els.newCheckTime) els.newCheckTime.value = nowTimeHHMM();
  if (els.newCheckNote) els.newCheckNote.value = "";
  renderCheckTypeChips();
  renderCheckResultChips();
  els.checkReminderQuick?.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.rdays === "0"));
  if (els.checkCustomReminder) els.checkCustomReminder.hidden = true;
  if (els.checkCustomDate) els.checkCustomDate.value = todayISO();
  if (els.checkCustomTime) els.checkCustomTime.value = nowTimeHHMM();
  els.newCheckDialog?.showModal();
}

function renderCheckTypeChips() {
  if (!els.checkTypeChips) return;
  els.checkTypeChips.innerHTML = Object.entries(checkTypeInfo).map(([id, label]) =>
    `<button class="check-chip${newCheckTypes.has(id) ? " active" : ""}" type="button" data-ctype="${id}">${escapeHtml(label)}</button>`
  ).join("");
}

function renderCheckResultChips() {
  if (!els.checkResultChips) return;
  const sections = [];
  if (newCheckTypes.has("taste"))
    sections.push({ label: "Chuť", keys: tasteResultKeys, set: newCheckResults });
  if (newCheckTypes.has("visual_check"))
    sections.push({ label: "Vizuální stav", keys: visualResultKeys, set: newCheckResults });
  if (newCheckTypes.has("pressure_check"))
    sections.push({ label: "Tlak", keys: pressureResultKeys, set: newCheckResults });
  sections.push({ label: "Co se s várkou děje?", keys: actionResultKeys, set: newCheckResults });

  els.checkResultChips.innerHTML = sections.map(sec => `
    <p class="result-section-label">${escapeHtml(sec.label)}</p>
    <div class="check-result-chips">
      ${sec.keys.map(k => {
        const info = checkResultInfo[k];
        return `<button class="check-chip result-chip${sec.set.has(k) ? " active" : ""} ${info.css}" type="button" data-cresult="${k}">${escapeHtml(info.label)}</button>`;
      }).join("")}
    </div>`).join("");
}

function confirmNewCheck() {
  if (!pendingCheckBatchId) return;
  const batch = findBatch(pendingCheckBatchId);
  if (!batch) return;
  const dateStr = els.newCheckDate?.value || todayISO();
  const timeStr = els.newCheckTime?.value || "12:00";
  const check = {
    id: uid(), checkedAt: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
    checkTypes: [...newCheckTypes], checkResults: [...newCheckResults],
    note: els.newCheckNote?.value.trim() || null
  };
  batch.checks.push(check);
  // Mark any due reminders as done since the user just checked
  batch.reminders.forEach(r => {
    if (r.status === "pending" && new Date(r.remindAt) <= new Date()) r.status = "done";
  });
  if (newCheckReminderDays === -1) {
    const cd = els.checkCustomDate?.value || todayISO();
    const ct = els.checkCustomTime?.value || "12:00";
    batch.reminders.push({ id: uid(), type: "taste", title: "Ochutnat", remindAt: new Date(`${cd}T${ct}:00`).toISOString(), status: "pending", note: null });
  } else if (newCheckReminderDays > 0) {
    const remindAt = new Date(new Date(check.checkedAt).getTime() + newCheckReminderDays * 86400000).toISOString();
    batch.reminders.push({ id: uid(), type: "taste", title: "Ochutnat", remindAt, status: "pending", note: null });
  }
  persistBatches();
  els.newCheckDialog?.close();
  const savedBatchId = pendingCheckBatchId;
  pendingCheckBatchId = null;
  if (currentBatchDetailId === savedBatchId) renderBatchDetail(savedBatchId);
  renderVarkyView();
  checkReminders();
  showActionFeedback("Kontrolu máš zapsanou.");
  // Nabídni F2 přechod při stočení nebo přesunu F1
  if (batch.type === "F1" && (newCheckResults.has("bottle_f1") || newCheckResults.has("move_to_f2"))) {
    window.setTimeout(() => openF1ToF2Dialog(savedBatchId), 300);
  }
  // Ukončení várky rovnou otevře dialog pro dokončení
  if (newCheckResults.has("finish_batch")) {
    window.setTimeout(() => openFinishBatchDialog(savedBatchId), 300);
  }
}

// ── Finish Batch ──

function openFinishBatchDialog(batchId) {
  pendingFinishBatchId = batchId;
  els.finishResultGroup?.querySelectorAll("input[type=radio]").forEach(r => r.checked = false);
  if (els.finishBatchNote) els.finishBatchNote.value = "";
  els.finishBatchDialog?.showModal();
}

function confirmFinishBatch() {
  const batch = findBatch(pendingFinishBatchId);
  if (!batch) return;
  const resultInput = els.finishResultGroup?.querySelector("input[name='finishResult']:checked");
  batch.finished = true;
  batch.finishedAt = new Date().toISOString();
  batch.finalResult = resultInput?.value || "success";
  batch.finalNote = els.finishBatchNote?.value.trim() || null;
  batch.reminders.forEach(r => { if (r.status === "pending") r.status = "done"; });
  persistBatches();
  els.finishBatchDialog?.close();
  renderBatchDetail(pendingFinishBatchId);
  renderVarkyView();
  checkReminders();
  pendingFinishBatchId = null;
  showActionFeedback("Várka ukončená. Zkušenost zůstává.");
}

// ── Delete Batch ──

function openDeleteBatchDialog(batchId) {
  pendingDeleteBatchId = batchId;
  els.deleteBatchDialog?.showModal();
}

function confirmDeleteBatch() {
  deletedBatchIds.add(pendingDeleteBatchId);
  persistDeletedIds();
  batches = batches.filter(b => b.id !== pendingDeleteBatchId);
  persistBatches();
  els.deleteBatchDialog?.close();
  pendingDeleteBatchId = null;
  currentBatchDetailId = null;
  renderVarkyView();
  checkReminders();
  switchView("varky");
  showActionFeedback("Várka smazaná.");
}

// ── Inline batch name edit ──

function startBatchNameEdit(container, batchId) {
  const batch = findBatch(batchId);
  if (!batch) return;
  const titleEl = container.querySelector("[data-batch-title]");
  if (!titleEl || titleEl.tagName === "INPUT") return;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "title-edit-input";
  input.value = batch.batchName;
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  function commit() {
    const val = input.value.trim() || batch.batchName;
    batch.batchName = val;
    persistBatches();
    const newEl = document.createElement(titleEl.tagName.toLowerCase());
    newEl.className = titleEl.className;
    newEl.setAttribute("data-batch-title", "");
    newEl.textContent = val;
    input.replaceWith(newEl);
    if (currentBatchDetailId === batchId) renderBatchDetail(batchId);
    else renderVarkyView();
    showActionFeedback("Název uložený.");
  }
  input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") commit(); });
  input.addEventListener("blur", () => window.setTimeout(commit, 100));
}

// ── Delete check ──

function openDeleteCheckDialog(checkId, batchId) {
  pendingDeleteCheckId = checkId;
  pendingCheckBatchId = batchId;
  els.deleteCheckDialog?.showModal();
}

function confirmDeleteCheck() {
  const batch = findBatch(pendingCheckBatchId);
  if (batch) {
    if (!batch.deletedCheckIds) batch.deletedCheckIds = [];
    batch.deletedCheckIds.push(pendingDeleteCheckId);
    batch.checks = batch.checks.filter(c => c.id !== pendingDeleteCheckId);
    persistBatches();
    renderBatchDetail(pendingCheckBatchId);
    renderVarkyView();
    checkReminders();
    showActionFeedback("Kontrola je pryč.");
  }
  pendingDeleteCheckId = null;
  els.deleteCheckDialog?.close();
}

// ── Edit check ──

function openEditCheckDialog(checkId, batchId) {
  const batch = findBatch(batchId);
  if (!batch) return;
  const check = batch.checks.find(c => c.id === checkId);
  if (!check) return;
  editingCheckId = checkId;
  pendingCheckBatchId = batchId;
  editCheckTypes   = new Set(check.checkTypes || (check.checkType ? [check.checkType] : ["taste"]));
  editCheckResults = new Set(check.checkResults || (check.result && check.result !== "custom" ? [check.result] : []));
  if (els.editCheckDate) { els.editCheckDate.value = check.checkedAt.slice(0, 10); els.editCheckDate.min = batch.fermentationStartedAt.slice(0, 10); }
  if (els.editCheckTime) els.editCheckTime.value = check.checkedAt.slice(11, 16);
  if (els.editCheckNote) els.editCheckNote.value = check.note || "";
  renderEditCheckTypeChips();
  renderEditCheckResultChips();
  els.editCheckDialog?.showModal();
}

function renderEditCheckTypeChips() {
  if (!els.editCheckTypeChips) return;
  els.editCheckTypeChips.innerHTML = Object.entries(checkTypeInfo).map(([id, label]) =>
    `<button class="check-chip${editCheckTypes.has(id) ? " active" : ""}" type="button" data-ectype="${id}">${escapeHtml(label)}</button>`
  ).join("");
}

function renderEditCheckResultChips() {
  if (!els.editCheckResultChips) return;
  const sections = [];
  if (editCheckTypes.has("taste"))
    sections.push({ label: "Chuť", keys: tasteResultKeys });
  if (editCheckTypes.has("visual_check"))
    sections.push({ label: "Vizuální stav", keys: visualResultKeys });
  if (editCheckTypes.has("pressure_check"))
    sections.push({ label: "Tlak", keys: pressureResultKeys });
  sections.push({ label: "Co se s várkou děje?", keys: actionResultKeys });
  els.editCheckResultChips.innerHTML = sections.map(sec => `
    <p class="result-section-label">${escapeHtml(sec.label)}</p>
    <div class="check-result-chips">
      ${sec.keys.map(k => {
        const info = checkResultInfo[k];
        return `<button class="check-chip result-chip${editCheckResults.has(k) ? " active" : ""} ${info?.css || ""}" type="button" data-ecresult="${k}">${escapeHtml(info?.label || k)}</button>`;
      }).join("")}
    </div>`).join("");
}

function confirmEditCheck() {
  const batch = findBatch(pendingCheckBatchId);
  if (!batch) return;
  const check = batch.checks.find(c => c.id === editingCheckId);
  if (!check) return;
  const dateStr = els.editCheckDate?.value || todayISO();
  const timeStr = els.editCheckTime?.value || "12:00";
  check.checkedAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
  check.checkTypes   = [...editCheckTypes];
  check.checkResults = [...editCheckResults];
  check.note = els.editCheckNote?.value.trim() || null;
  persistBatches();
  els.editCheckDialog?.close();
  renderBatchDetail(pendingCheckBatchId);
  renderVarkyView();
  showActionFeedback("Kontrola upravená.");
  editingCheckId = null;
}

// ── F1 → F2 transition ──

function openF1ToF2Dialog(sourceBatchId) {
  pendingF1ToF2BatchId = sourceBatchId;
  f1ToF2ReminderDays = 2;
  const sourceBatch = findBatch(sourceBatchId);
  if (els.f1ToF2Name) els.f1ToF2Name.value = sourceBatch ? `F2 – ${sourceBatch.batchName}` : "F2 várka";
  if (els.f1ToF2Date) els.f1ToF2Date.value = todayISO();
  if (els.f1ToF2Time) els.f1ToF2Time.value = nowTimeHHMM();
  if (els.f1ToF2Note) els.f1ToF2Note.value = "";
  if (els.f1ToF2CustomReminder) els.f1ToF2CustomReminder.hidden = true;
  if (els.f1ToF2CustomDate) els.f1ToF2CustomDate.value = todayISO();
  if (els.f1ToF2CustomTime) els.f1ToF2CustomTime.value = nowTimeHHMM();
  els.f1ToF2ReminderQuick?.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.rdays === "2"));
  els.f1ToF2Dialog?.showModal();
}

function confirmF1ToF2() {
  const sourceBatch = findBatch(pendingF1ToF2BatchId);
  if (!sourceBatch) return;
  const name = els.f1ToF2Name?.value.trim() || `F2 – ${sourceBatch.batchName}`;
  const dateStr = els.f1ToF2Date?.value || todayISO();
  const timeStr = els.f1ToF2Time?.value || "12:00";
  const startedAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
  const reminders = [];
  if (f1ToF2ReminderDays === -1) {
    const cd = els.f1ToF2CustomDate?.value || todayISO();
    const ct = els.f1ToF2CustomTime?.value || "12:00";
    reminders.push({ id: uid(), type: "check", title: "Zkontrolovat tlak", remindAt: new Date(`${cd}T${ct}:00`).toISOString(), status: "pending", note: null });
  } else if (f1ToF2ReminderDays > 0) {
    reminders.push({ id: uid(), type: "check", title: "Zkontrolovat tlak", remindAt: new Date(new Date(startedAt).getTime() + f1ToF2ReminderDays * 86400000).toISOString(), status: "pending", note: null });
  }
  const f2Id = uid();
  const f2Batch = {
    id: f2Id, batchName: name, type: "F2",
    fermentationStartedAt: startedAt, createdAt: new Date().toISOString(),
    finished: false, finishedAt: null, finalResult: null, finalNote: null,
    startNote: els.f1ToF2Note?.value.trim() || null,
    recipeSnapshot: sourceBatch.recipeSnapshot || null,
    parentBatchId: pendingF1ToF2BatchId,
    checks: [], reminders, deletedCheckIds: []
  };
  if (!sourceBatch.linkedBatchIds) sourceBatch.linkedBatchIds = [];
  sourceBatch.linkedBatchIds.push(f2Id);
  batches.unshift(f2Batch);
  persistBatches();
  els.f1ToF2Dialog?.close();
  renderVarkyView();
  checkReminders();
  renderBatchDetail(f2Id);
  showActionFeedback("F2 várka založena. Nech to naperlovat.");
  pendingF1ToF2BatchId = null;
}

// ── Cloud Sync ──

let syncBusy = false;

function mergeSync(localBatches, localRecipes, remote) {
  // Union tombstones from both sides
  const deadBatches  = new Set([...deletedBatchIds,  ...(remote.deletedBatchIds  || [])]);
  const deadRecipes  = new Set([...deletedRecipeIds, ...(remote.deletedRecipeIds || [])]);

  // Persist newly learned tombstones locally
  let tombstonesUpdated = false;
  deadBatches.forEach(id => { if (!deletedBatchIds.has(id))  { deletedBatchIds.add(id);  tombstonesUpdated = true; } });
  deadRecipes.forEach(id => { if (!deletedRecipeIds.has(id)) { deletedRecipeIds.add(id); tombstonesUpdated = true; } });
  if (tombstonesUpdated) persistDeletedIds();

  // Merge batches: union by ID, skip tombstoned, union checks+reminders
  const batchMap = new Map();
  [...(remote.batches || []), ...localBatches].forEach(b => {
    if (deadBatches.has(b.id)) return;
    const existing = batchMap.get(b.id);
    if (!existing) { batchMap.set(b.id, b); return; }
    const deadChecks = new Set([...(existing.deletedCheckIds || []), ...(b.deletedCheckIds || [])]);
    const checkMap = new Map([...(existing.checks || []), ...(b.checks || [])].map(c => [c.id, c]));
    for (const id of deadChecks) checkMap.delete(id);
    const remMap   = new Map([...(existing.reminders || []), ...(b.reminders || [])].map(r => [r.id, r]));
    const base = (b.checks?.length ?? 0) >= (existing.checks?.length ?? 0) ? b : existing;
    batchMap.set(b.id, {
      ...base,
      checks:          [...checkMap.values()].sort((a, c) => new Date(a.checkedAt) - new Date(c.checkedAt)),
      reminders:       [...remMap.values()],
      deletedCheckIds: [...deadChecks]
    });
  });

  // Merge recipes: union by ID, skip tombstoned, local wins on conflict
  const recipeMap = new Map();
  (remote.recipes || []).forEach(r => { if (!deadRecipes.has(r.id)) recipeMap.set(r.id, r); });
  localRecipes.forEach(r => { if (!deadRecipes.has(r.id)) recipeMap.set(r.id, r); });

  return {
    batches:          [...batchMap.values()],
    recipes:          [...recipeMap.values()],
    deletedBatchIds:  [...deadBatches],
    deletedRecipeIds: [...deadRecipes]
  };
}

async function syncWithServer() {
  if (syncBusy) return;
  syncBusy = true;
  try {
    const res = await fetch("/api/sync", { cache: "no-store" });
    if (!res.ok) { syncBusy = false; return; }
    const remote = await res.json();

    const merged = mergeSync(batches, savedRecipes, remote);

    const batchesChanged = JSON.stringify(merged.batches)  !== JSON.stringify(batches);
    const recipesChanged = JSON.stringify(merged.recipes)  !== JSON.stringify(savedRecipes);

    if (batchesChanged) {
      batches = merged.batches;
      localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
      renderVarkyView();
      if (currentBatchDetailId) renderBatchDetail(currentBatchDetailId);
      checkReminders();
    }
    if (recipesChanged) {
      savedRecipes = merged.recipes;
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
      renderSavedRecipes();
    }

    // Upload merged payload — server does another union pass
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged)
    });
  } catch {}
  syncBusy = false;
}

// ── Pick Recipe Dialog ──

function openPickRecipeDialog(batchId) {
  pendingPickRecipeBatchId = batchId;
  if (!els.pickRecipeList) return;
  if (!savedRecipes.length) {
    els.pickRecipeList.innerHTML = `<p style="font-size:14px;color:var(--ink-soft)">Zápisník je prázdný – nejdřív si ulož nějaký recept.</p>`;
  } else {
    els.pickRecipeList.innerHTML = savedRecipes.map(r => `
      <button class="pick-recipe-item" type="button" data-recipe-id="${r.id}">
        <strong>${escapeHtml(r.recipeName)}</strong>
        <span>${escapeHtml(recipeSnapshotSummary(r))}</span>
      </button>`).join("");
  }
  els.pickRecipeDialog?.showModal();
}

function confirmPickRecipe(recipeId) {
  const batch = findBatch(pendingPickRecipeBatchId);
  if (!batch) return;
  batch.recipeSnapshot = findRecipe(recipeId) || batch.recipeSnapshot;
  persistBatches();
  els.pickRecipeDialog?.close();
  renderBatchDetail(pendingPickRecipeBatchId);
  renderVarkyView();
  pendingPickRecipeBatchId = null;
}

function clearBatchRecipe() {
  const batch = findBatch(pendingPickRecipeBatchId);
  if (!batch) return;
  batch.recipeSnapshot = null;
  persistBatches();
  els.pickRecipeDialog?.close();
  renderBatchDetail(pendingPickRecipeBatchId);
  renderVarkyView();
  pendingPickRecipeBatchId = null;
}

// ── Bind batch events ──

function bindBatchEvents() {
  els.navVarky?.addEventListener("click", e => { e.preventDefault(); renderVarkyView(); switchView("varky"); });
  els.newBatchBtn?.addEventListener("click", () => openNewBatchDialog(null));
  els.startBatchBtn?.addEventListener("click", () => {
    const snap = currentSnapshotForSharing();
    if (snap && (snap.starterSeverity === "STOP" || snap.starterSeverity === "RED")) {
      els.riskBatchDialog?.showModal();
    } else {
      openNewBatchDialog(snap);
    }
  });
  els.cancelRiskBatchBtn?.addEventListener("click", () => els.riskBatchDialog?.close());
  els.confirmRiskBatchBtn?.addEventListener("click", () => {
    els.riskBatchDialog?.close();
    openNewBatchDialog(currentSnapshotForSharing());
  });
  els.closeNewBatchBtn?.addEventListener("click", () => els.newBatchDialog?.close());
  els.cancelNewBatchBtn?.addEventListener("click", () => els.newBatchDialog?.close());
  els.confirmNewBatchBtn?.addEventListener("click", confirmNewBatch);
  els.newBatchTypeSeg?.addEventListener("click", e => {
    const btn = e.target.closest("[data-btype]");
    if (!btn) return;
    newBatchType = btn.dataset.btype;
    els.newBatchTypeSeg.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
  });
  els.newBatchReminderQuick?.addEventListener("click", e => {
    const btn = e.target.closest("[data-rdays]");
    if (!btn) return;
    const isCustom = btn.dataset.rdays === "custom";
    newBatchReminderDays = isCustom ? -1 : Number(btn.dataset.rdays);
    els.newBatchReminderQuick.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    if (els.newBatchCustomReminder) els.newBatchCustomReminder.hidden = !isCustom;
  });
  els.closeNewCheckBtn?.addEventListener("click", () => els.newCheckDialog?.close());
  els.cancelNewCheckBtn?.addEventListener("click", () => els.newCheckDialog?.close());
  els.confirmNewCheckBtn?.addEventListener("click", confirmNewCheck);
  els.checkTypeChips?.addEventListener("click", e => {
    const btn = e.target.closest("[data-ctype]");
    if (!btn) return;
    const type = btn.dataset.ctype;
    if (newCheckTypes.has(type)) newCheckTypes.delete(type); else newCheckTypes.add(type);
    btn.classList.toggle("active", newCheckTypes.has(type));
    renderCheckResultChips();
  });
  els.checkResultChips?.addEventListener("click", e => {
    const btn = e.target.closest("[data-cresult]");
    if (!btn) return;
    const r = btn.dataset.cresult;
    if (newCheckResults.has(r)) newCheckResults.delete(r); else newCheckResults.add(r);
    btn.classList.toggle("active", newCheckResults.has(r));
  });
  els.checkReminderQuick?.addEventListener("click", e => {
    const btn = e.target.closest("[data-rdays]");
    if (!btn) return;
    const isCustom = btn.dataset.rdays === "custom";
    newCheckReminderDays = isCustom ? -1 : Number(btn.dataset.rdays);
    els.checkReminderQuick.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    if (els.checkCustomReminder) els.checkCustomReminder.hidden = !isCustom;
  });
  els.closeFinishBatchBtn?.addEventListener("click", () => els.finishBatchDialog?.close());
  els.cancelFinishBatchBtn?.addEventListener("click", () => els.finishBatchDialog?.close());
  els.confirmFinishBatchBtn?.addEventListener("click", confirmFinishBatch);
  els.cancelDeleteBatchBtn?.addEventListener("click", () => { pendingDeleteBatchId = null; els.deleteBatchDialog?.close(); });
  els.confirmDeleteBatchBtn?.addEventListener("click", confirmDeleteBatch);
  els.cancelDeleteCheckBtn?.addEventListener("click", () => { pendingDeleteCheckId = null; els.deleteCheckDialog?.close(); });
  els.confirmDeleteCheckBtn?.addEventListener("click", confirmDeleteCheck);
  els.closeEditCheckBtn?.addEventListener("click", () => els.editCheckDialog?.close());
  els.cancelEditCheckBtn?.addEventListener("click", () => els.editCheckDialog?.close());
  els.confirmEditCheckBtn?.addEventListener("click", confirmEditCheck);
  els.editCheckTypeChips?.addEventListener("click", e => {
    const btn = e.target.closest("[data-ectype]");
    if (!btn) return;
    const type = btn.dataset.ectype;
    if (editCheckTypes.has(type)) editCheckTypes.delete(type); else editCheckTypes.add(type);
    btn.classList.toggle("active", editCheckTypes.has(type));
    renderEditCheckResultChips();
  });
  els.editCheckResultChips?.addEventListener("click", e => {
    const btn = e.target.closest("[data-ecresult]");
    if (!btn) return;
    const r = btn.dataset.ecresult;
    if (editCheckResults.has(r)) editCheckResults.delete(r); else editCheckResults.add(r);
    btn.classList.toggle("active", editCheckResults.has(r));
  });
  els.f1ToF2ReminderQuick?.addEventListener("click", e => {
    const btn = e.target.closest("[data-rdays]");
    if (!btn) return;
    const isCustom = btn.dataset.rdays === "custom";
    f1ToF2ReminderDays = isCustom ? -1 : Number(btn.dataset.rdays);
    els.f1ToF2ReminderQuick.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    if (els.f1ToF2CustomReminder) els.f1ToF2CustomReminder.hidden = !isCustom;
  });
  els.closeF1ToF2Btn?.addEventListener("click", () => els.f1ToF2Dialog?.close());
  els.cancelF1ToF2Btn?.addEventListener("click", () => els.f1ToF2Dialog?.close());
  els.confirmF1ToF2Btn?.addEventListener("click", confirmF1ToF2);
  els.reminderGoToVarkyBtn?.addEventListener("click", () => { batchFilter = "due"; renderVarkyView(); switchView("varky"); });
  els.reminderSnoozeBtn?.addEventListener("click", () => {
    const snoozeMs = 3600000;
    batches.forEach(b => b.reminders.forEach(r => {
      if (r.status === "pending" && new Date(r.remindAt) <= new Date()) {
        r.remindAt = new Date(Date.now() + snoozeMs).toISOString();
      }
    }));
    persistBatches();
    checkReminders();
    showActionFeedback("Připomínky odloženy o hodinu.");
  });
  els.reminderDoneBtn?.addEventListener("click", () => {
    batches.forEach(b => b.reminders.forEach(r => {
      if (r.status === "pending" && new Date(r.remindAt) <= new Date()) r.status = "done";
    }));
    persistBatches();
    checkReminders();
    renderVarkyView();
    showActionFeedback("Připomínky označeny jako splněné.");
  });
  els.reminderDismissBtn?.addEventListener("click", () => { els.reminderBanner.hidden = true; });
  els.batchDetailBackBtn?.addEventListener("click", () => { currentBatchDetailId = null; renderVarkyView(); switchView("varky"); });
  els.varkyFilterPills?.addEventListener("click", e => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    batchFilter = btn.dataset.filter;
    renderVarkyView();
  });
  els.varkySearch?.addEventListener("input", () => { batchSearch = els.varkySearch.value; renderVarkyView(); });
  // Delegated clicks for dynamically-rendered batch elements
  document.addEventListener("click", e => {
    if (e.target.closest(".batch-add-check")) {
      const row = e.target.closest("[data-batch-id]");
      if (row?.dataset.batchId) openNewCheckDialog(row.dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-show-detail")) {
      const row = e.target.closest("[data-batch-id]");
      if (row?.dataset.batchId) renderBatchDetail(row.dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-more-checks")) {
      const btn = e.target.closest(".batch-more-checks");
      if (btn.dataset.batchId) renderBatchDetail(btn.dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-finish")) {
      openFinishBatchDialog(e.target.closest(".batch-finish").dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-delete")) {
      openDeleteBatchDialog(e.target.closest(".batch-delete").dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-edit-name")) {
      const container = e.target.closest("[data-batch-id]");
      if (container?.dataset.batchId) startBatchNameEdit(container, container.dataset.batchId);
      return;
    }
    if (e.target.closest(".start-batch")) {
      const card = e.target.closest(".saved-recipe-card");
      const recipe = findRecipe(card?.dataset.recipeId);
      if (recipe) openNewBatchDialog(recipe);
      return;
    }
    if (e.target.closest(".check-edit-btn")) {
      const btn = e.target.closest(".check-edit-btn");
      openEditCheckDialog(btn.dataset.checkId, btn.dataset.batchId);
      return;
    }
    if (e.target.closest(".check-delete-btn")) {
      const btn = e.target.closest(".check-delete-btn");
      openDeleteCheckDialog(btn.dataset.checkId, btn.dataset.batchId);
      return;
    }
    if (e.target.closest(".batch-empty-add")) {
      openNewBatchDialog(null);
      return;
    }
    if (e.target.closest(".pick-recipe-btn")) {
      const btn = e.target.closest(".pick-recipe-btn");
      if (btn.dataset.batchId) openPickRecipeDialog(btn.dataset.batchId);
      return;
    }
    if (e.target.closest(".pick-recipe-item")) {
      const btn = e.target.closest(".pick-recipe-item");
      if (btn.dataset.recipeId) confirmPickRecipe(btn.dataset.recipeId);
      return;
    }
  });
  els.closePickRecipeBtn?.addEventListener("click", () => { pendingPickRecipeBatchId = null; els.pickRecipeDialog?.close(); });
  els.cancelPickRecipeBtn?.addEventListener("click", () => { pendingPickRecipeBatchId = null; els.pickRecipeDialog?.close(); });
  els.clearBatchRecipeBtn?.addEventListener("click", clearBatchRecipe);
}

renderChoices();
bindEvents();
render();
renderSavedRecipes();
batches = loadBatches();
renderVarkyView();
checkReminders();
syncWithServer();
setInterval(syncWithServer, 30000);

// Handle #varky / #zapisnik URL fragments for deep-linking
(function() {
  const hash = location.hash.slice(1);
  if (hash === "varky") { renderVarkyView(); switchView("varky"); }
  else if (hash === "zapisnik") { renderSavedRecipes(); switchView("zapisnik"); }
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
