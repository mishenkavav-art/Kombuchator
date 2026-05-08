// ═══ DATA ═══

const goals = [
  { id: "gentle",   icon: "ikony/slabý čajíček_výluh z ponožek.png", title: "slabý čajíček",         note: "Lehká, jemná chuť.",       percent: 0.10, tasteDays: [2,  4]  },
  { id: "balanced", icon: "ikony/kombucha jak má být.png",            title: "kombucha jak má být",    note: "Vyvážený standard.",        percent: 0.13, tasteDays: [3,  6]  },
  { id: "tangy",    icon: "ikony/kyselejší limonádka.png",            title: "kyselejší limonáda",     note: "Výraznější říz.",           percent: 0.15, tasteDays: [5,  8]  },
  { id: "starter",  icon: "ikony/startér pro příště.png",             title: "startér pro příště",     note: "Kyselost je cíl.",          percent: 0.18, tasteDays: [7,  14] },
  { id: "enemy",    icon: "ikony/kyselina pro nepřátele.png",         title: "kyselina pro nepřátele", note: "Spíš čistič než pití.",     percent: 0.20, tasteDays: [14, 21] }
];

const starterTypes = {
  sweet:    { label: "sladký",  emoji: "😋", activityMultiplier: 0.50, min: 0.18, target: [0.18, 0.25], tasteOffset: +2, text: "Tohle je ještě tlamolep – potřebuje víc kyselého startéru." },
  weak:     { label: "slabý",   emoji: "😴", activityMultiplier: 0.70, min: 0.15, target: [0.15, 0.20], tasteOffset: +2, text: "Bude trvat, než se nakopne." },
  unknown:  { label: "nevím",   emoji: "🤔", activityMultiplier: 0.80, min: 0.15, target: [0.15, 0.20], tasteOffset: +1, text: "Dám bezpečný default." },
  normal:   { label: "běžný",   emoji: "🙂", activityMultiplier: 1.00, min: 0.10, target: [0.10, 0.15], tasteOffset:  0, text: "Takhle to má vypadat." },
  vinegary: { label: "octový",  emoji: "😖", activityMultiplier: 1.25, min: 0.08, target: [0.08, 0.12], tasteOffset: -1, text: "Tohle vystřelí jak raketa." }
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
  jelly:   { label: "medůzka",          icon: "ikony/malá medůzka.png",                 score: 0.5 },
  palm:    { label: "do dlaně",         icon: "ikony/kombuška do dlaně.png",            score: 1   },
  pancake: { label: "palačinka",        icon: "ikony/typická palačinka.png",            score: 1.5 },
  tractor: { label: "kolo od traktoru", icon: "ikony/placka jak kolo od traktoru.png", score: 2   }
};

const temperatureBands = {
  unknown: { label: "nevím",   emoji: "🤷", offset:  0, text: "" },
  cold:    { label: "chladno", emoji: "🥶", offset: +2, text: "Pod 20 °C – várka se zpomaluje." },
  room:    { label: "pokoj",   emoji: "🌡️", offset:  0, text: "20–25 °C. Ideální pásmo." },
  warm:    { label: "teplo",   emoji: "☀️", offset: -1, text: "25–29 °C – pojede rychleji." },
  hot:     { label: "hic",     emoji: "🔥", offset: -2, text: "Nad 29 °C! Ochutnávej dřív." }
};

const predictions = {
  weak_start:    { title: "Tahle várka má slabý start.",     text: "Na zadaný objem máš málo aktivního startéru. Zmenši várku nebo přidej startér.",    intensity: 1 },
  no_sugar:      { title: "Bez cukru to nepojede.",          text: "SCOBY nebude mít co jíst. F1 bez zkvasitelného cukru nedává smysl.",                 intensity: 1 },
  tlamolep:      { title: "Dobrej tlamolep.",                text: "Bude sladší a déle se to bude kvasit. Ochutnávej a nedávej hned do F2.",             intensity: 2 },
  gentle:        { title: "Jemný čajíček.",                  text: "Lehké a pitelné, ale méně výrazné. Dobré pro začátek nebo pitelnost bez kyselosti.", intensity: 1 },
  balanced:      { title: "Kombucha jak má být.",            text: "Vyvážený standard – sladko-kyselé, přátelské pro začátečníka i zkušeného.",          intensity: 3 },
  tangy:         { title: "Tohle má pořádný říz.",           text: "Výraznější kyselost, osvěžující, vhodné pro milovníky řízu.",                        intensity: 4 },
  very_sour:     { title: "Tohle ti zkřiví tlamču.",         text: "Silně kyselé, ostrý dojezd. Na pití jen pokud to cíleně chceš.",                     intensity: 5 },
  starter_batch: { title: "Gratuluju k výrobě startéru.",   text: "Výborný základ pro příští várku, ne primárně na pití.",                              intensity: 5 },
  vinegar:       { title: "Tohle není pití, to je čistič.", text: "Extrémní kyselost. Jako startér výborný základ, jako nápoj opravdu ne.",             intensity: 5 }
};

const f2Tags = {
  f2_ok:     { tag: "vhodné pro F2",     text: "Tohle může jít na dokvašení. S ovocem opatrně, cukr dělá tlak." },
  drink_now: { tag: "raději vypít hned", text: "Vypij nebo sleduj. Do lahve bych to zatím nehnal." },
  starter:   { tag: "spíš startér",      text: "Na ovoce do F2 už to bude ostré. Lepší jako základ příští várky." },
  stop:      { tag: "F2 stop",           text: "Tady by mohl být tlakový cirkus. F2 zatím nedoporučuju." }
};

// ═══ STATE ═══

let teaIdCounter = 0;
function createTeaId() { return `tea-${++teaIdCounter}`; }

const state = {
  mode: "classic",
  goal: "balanced",
  volumeSource: "jar",
  starterType: "normal",
  temperature: "unknown",
  teas: [
    { id: createTeaId(), enabled: true, type: "black",  role: "main", grams: 6, waterMl: "" },
    { id: createTeaId(), enabled: true, type: "green",  role: "main", grams: 5, waterMl: "" }
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
  volumeHint:         document.querySelector("#volumeHint"),
  starterMl:          document.querySelector("#starterMl"),
  starterType:        document.querySelector("#starterType"),
  starterHint:        document.querySelector("#starterHint"),
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

// ═══ RENDER CHOICES ═══

function renderChoices() {
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

  els.tempBand.innerHTML = Object.entries(temperatureBands).map(([id, t]) => `
    <button class="${state.temperature === id ? "active" : ""}" type="button" data-temp="${id}">
      <span>${t.emoji}</span>${t.label}
    </button>`).join("");

  els.pellicleSize.innerHTML = Object.entries(pellicles).map(([id, p]) => `
    <button class="pellicle-card ${state.pellicleSize === id ? "active" : ""}" type="button" data-pellicle="${id}">
      <img class="icon" src="${p.icon}" alt="" aria-hidden="true">
      <strong>${p.label}</strong>
    </button>`).join("");
}

// ═══ RENDER TEAS ═══

function renderTeas() {
  const showDetails = state.mode === "experiment";
  els.teaList.classList.toggle("simple-tea-list", !showDetails);
  els.teaList.innerHTML = (showDetails ? `
    <div class="tea-row tea-row-head" aria-hidden="true">
      <span></span><strong>Typ čaje</strong><strong>Role</strong>
      <strong>Množství na litr</strong><strong>Voda</strong><span></span>
    </div>` : "") + state.teas.map(tea => `
    <div class="tea-row" data-tea-id="${tea.id}">
      <input class="tea-check" type="checkbox" ${tea.enabled ? "checked" : ""} aria-label="Použít čaj">
      <div class="tea-picker">
        <img class="tea-icon" src="${teaTypes[tea.type].icon}" alt="" aria-hidden="true">
        <select class="tea-type">
          ${Object.entries(teaTypes).map(([id, item]) => `<option value="${id}" ${tea.type === id ? "selected" : ""}>${item.label}</option>`).join("")}
        </select>
      </div>
      <select class="tea-role ${showDetails ? "" : "visually-hidden"}" aria-label="Role čaje">
        <option value="main"  ${tea.role === "main"  ? "selected" : ""}>hlavní</option>
        <option value="extra" ${tea.role === "extra" ? "selected" : ""}>přídavný</option>
      </select>
      <div class="inline-unit ${showDetails ? "" : "visually-hidden"}">
        <input class="tea-grams" type="number" min="0" step="0.5" value="${tea.grams}" aria-label="Gramáž g/l">
        <em>g</em>
      </div>
      <input class="tea-water ${showDetails ? "" : "visually-hidden"}" type="number" min="0" step="50" value="${tea.waterMl}" placeholder="auto" aria-label="Voda ml">
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
  const specified = enabledTeas.reduce((s, t) => s + (Number(t.waterMl) || 0), 0);
  const blanks    = enabledTeas.filter(t => !(Number(t.waterMl) > 0)).length;
  const autoMl    = blanks ? Math.max(0, freshTeaL * 1000 - specified) / blanks : 0;
  return enabledTeas.map(t => {
    const waterMl = Number(t.waterMl) > 0 ? Number(t.waterMl) : autoMl;
    return { ...t, waterMl, gramsTotal: waterMl / 1000 * (Number(t.grams) || teaTypes[t.type].grams) };
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

  // Starter
  const starterType   = starterTypes[state.starterType];
  const starterMl     = numberValue(els.starterMl, 0);
  const starterLiters = starterMl / 1000;
  const freshTeaL     = Math.max(0, workingLiters - starterLiters);
  const starterRatio  = workingLiters > 0 ? starterLiters / workingLiters : 0;
  const starterMin    = starterType.min;
  const starterGap    = (starterMin > 0 && workingLiters > 0) ? starterRatio / starterMin : 999;

  const EPS = 1e-9;
  let starterSeverity;
  if      (starterGap < 0.50 - EPS) starterSeverity = "STOP";
  else if (starterGap < 0.75 - EPS) starterSeverity = "RED";
  else if (starterGap < 1.00 - EPS) starterSeverity = "YELLOW";
  else if (starterRatio > starterType.target[1] * 1.8) starterSeverity = "TOO_MUCH";
  else if (starterGap > 1.30) starterSeverity = "FAST";
  else                        starterSeverity = "OK";

  const recommendedMaxBatchL   = starterMin > 0 ? starterLiters / starterMin : Infinity;
  const requiredStarterMinL    = workingLiters * starterMin;
  const requiredStarterTargetL = [workingLiters * starterType.target[0], workingLiters * starterType.target[1]];

  // Pellicle
  const pellicleEnabled = els.usePellicle.checked;
  const pellicleGrams   = numberValue(els.pellicleGrams, 0);
  const pellicleScore   = pellicleGrams > 0
    ? Math.max(0.5, Math.round((pellicleGrams / 120) * 2) / 2)
    : (pellicleEnabled ? pellicles[state.pellicleSize].score * state.pellicleCount : 0);
  const pellicleBonus   = pellicleEnabled ? Math.min(pellicleScore * 0.01, 0.03) : 0;

  const effectiveStarterRatio = starterRatio * starterType.activityMultiplier + pellicleBonus;

  // Tea
  const goal        = goals.find(g => g.id === state.goal) || goals[1];
  const enabledTeas = state.teas.filter(t => t.enabled);
  const teaItems    = state.mode === "classic"
    ? buildClassicTeaItems(enabledTeas, freshTeaL)
    : buildExperimentTeaItems(enabledTeas, freshTeaL);
  const teaLiters     = teaItems.reduce((s, t) => s + t.waterMl / 1000, 0);
  const teaTotalGrams = teaItems.reduce((s, t) => s + t.gramsTotal, 0);
  const mainTeaMl     = teaItems.filter(t => teaTypes[t.type].main).reduce((s, t) => s + t.waterMl, 0);
  const hasHibiscus   = teaItems.some(t => t.type === "hibiscus" && t.waterMl > 0);
  const onlyExtraTea  = teaItems.length > 0 && mainTeaMl === 0;
  const avgTeaStrength = teaLiters > 0 ? teaTotalGrams / teaLiters : 0;

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
  const tempBand = temperatureBands[state.temperature] || temperatureBands.unknown;
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
  if      (starterSeverity === "STOP")                                      predKey = "weak_start";
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
  if      (sugarBand === "tlamolep" || sugarBand === "extreme")                          f2Key = "stop";
  else if (predKey === "weak_start" || predKey === "no_sugar")                           f2Key = "stop";
  else if (predKey === "vinegar" || predKey === "starter_batch" || predKey === "very_sour") f2Key = "starter";
  else if (predKey === "gentle" || starterSeverity === "YELLOW" || starterSeverity === "RED") f2Key = "drink_now";
  else                                                                                   f2Key = "f2_ok";

  // Errors & warnings
  const errors = [], warnings = [];
  if (workingLiters <= 0)
    errors.push("Doplň nádobu nebo množství. Bez toho nevaříme ani čaj.");
  if (workingLiters > 0 && starterLiters >= workingLiters)
    errors.push("Startér zabral celou sklenici. Uber startér nebo změň objem.");
  if (!enabledTeas.length)
    errors.push("Bez čaje to nebude kombucha.");
  if (sugarBand === "zero" && state.mode === "experiment")
    errors.push("SCOBY nebude mít co jíst. Přidej cukr.");
  const totalLiquidLiters = starterLiters + teaLiters;
  if (!usesTarget && workingLiters > 0 && totalLiquidLiters > jarLiters * 1.03)
    errors.push("Startér a voda se nevejdou do nádoby.");

  if (onlyExtraTea)
    warnings.push("Za tohle ruku do ohně nedám. SCOBY rádo plave v černém, zeleném, bílém čaji nebo oolong.");
  if (state.mode === "classic" && state.goal === "enemy")
    warnings.push("Tenhle cíl není doporučený jako pitný výsledek.");
  if (sugarBand === "tlamolep")
    warnings.push("Moc cukru. SCOBY dostane cukrovku a při lahvování může hrozit exploze.");
  if (sugarBand === "extreme")
    warnings.push("Extrémní dávka cukru. Silně nedoporučuju začátečníkovi.");
  if (state.mode === "experiment" && state.temperature === "hot")
    warnings.push("Hic! Ochutnávej dříve – ferment může rychle utéct.");
  if (hasHibiscus && (state.goal === "tangy" || state.goal === "enemy"))
    warnings.push("Ibišek je sám o sobě kyselý – nezaměňuj chuť kyselosti s hotovou fermentací.");
  if ((state.starterType === "weak" || state.starterType === "sweet") && sugarBand === "tlamolep")
    warnings.push("Slabý startér + hodně cukru = tlamolep, co se bude dlouho rozkopávat.");
  if ((state.starterType === "weak" || state.starterType === "sweet") && sugarBand === "very_low")
    warnings.push("Nešetři zároveň startér i cukr. Kultura má slabý rozjezd a málo paliva.");
  if (starterSeverity === "STOP" || starterSeverity === "RED")
    warnings.push(`Máš ${formatPercent(starterRatio)} startéru. Pro ${starterType.label} startér potřebuješ aspoň ${formatPercent(starterMin, 0)}, ideálně ${formatPercent(starterType.target[0], 0)}-${formatPercent(starterType.target[1], 0)}.`);
  if (avgTeaStrength > 9)
    warnings.push("Tohle bude silný jak noha od stolu.");
  teaItems.forEach(t => {
    const g = Number(t.grams) || teaTypes[t.type].grams;
    if ((t.type === "green" || t.type === "white") && g > 7)
      warnings.push("Zelený/bílý čaj nad 7 g/l – hlídat hořkost a trpkost.");
  });

  return {
    jarLiters, targetLiters, usesTarget, workingLiters, neededJar, freshTeaL,
    goal, starterType, starterMl, starterLiters, starterRatio, effectiveStarterRatio,
    starterMin, starterGap, starterSeverity,
    recommendedMaxBatchL, requiredStarterMinL, requiredStarterTargetL,
    pellicleEnabled, pellicleScore, pellicleBonus,
    teaLiters, teaItems, teaTotalGrams, onlyExtraTea, avgTeaStrength,
    sugarPerLiter, sugarTotal, sugarBand,
    tempBand, tasteWindow,
    predKey, f2Key,
    totalLiquidLiters, errors, warnings
  };
}

// ═══ UPDATE FUNCTIONS ═══

function updateVolumeHint(calc) {
  if (calc.usesTarget) {
    els.volumeHint.textContent = `Na ${roundLiters(calc.workingLiters)} kombuchy potřebuješ nádobu alespoň ${roundLiters(calc.neededJar)}.`;
  } else {
    els.volumeHint.textContent = `Do nádoby ${roundLiters(calc.jarLiters)} připrav cca ${roundLiters(calc.workingLiters)} kombuchy.`;
  }
}

function updateStarter(calc) {
  if (calc.workingLiters <= 0) { els.starterHint.textContent = ""; return; }
  const minPct = formatPercent(calc.starterMin, 0);
  const tgtLow = formatPercent(calc.starterType.target[0], 0);
  const tgtHigh = formatPercent(calc.starterType.target[1], 0);
  let hint = `${calc.starterType.text} Máš ${formatPercent(calc.starterRatio)}. Minimum pro ${calc.starterType.label} startér je ${minPct}, ideál ${tgtLow}-${tgtHigh}.`;

  if (calc.starterSeverity === "STOP") {
    const maxB   = starterFixRange(calc) || "menší várku";
    const needMn = kitchenStarterAmount(calc.requiredStarterMinL);
    const needT0 = kitchenStarterAmount(calc.requiredStarterTargetL[0]);
    const needT1 = kitchenStarterAmount(calc.requiredStarterTargetL[1]);
    hint += ` Stopka: potřebuješ aspoň ${needMn}, ideálně ${needT0}-${needT1}. Nebo zmenši várku na cca ${maxB}.`;
    if (calc.pellicleEnabled) hint += " Placka trochu pomůže, ale tenhle objem nezachrání.";
  } else if (calc.starterSeverity === "RED") {
    hint += ` Výrazně pod minimem - dlouhý rozjezd, vyšší riziko. Přidej aspoň ${kitchenStarterAmount(calc.requiredStarterMinL)}.`;
  } else if (calc.starterSeverity === "YELLOW") {
    hint += " Na hraně – ochutnávej a sleduj, jestli se kyselost opravdu rozjíždí.";
  } else if (calc.starterSeverity === "FAST") {
    hint += " Pojede to svižně. Ochutnávej dřív, ať neskončíš u octa.";
  } else if (calc.starterSeverity === "TOO_MUCH") {
    hint += " Hodně startéru. Výsledek může být ostrý a kyselý.";
  }
  els.starterHint.textContent = hint;
}

function updateTea(calc) {
  const msgs = [];
  if (!calc.teaItems.length) msgs.push("Doplň čaj.");
  if (calc.onlyExtraTea)     msgs.push("Tímhle SCOBY nenakrmíš. Přidej černý, zelený, bílý čaj nebo oolong.");
  els.teaWarning.textContent = msgs.join(" ");
}

function updatePellicle(calc) {
  els.pellicleControls.hidden = !els.usePellicle.checked;
  els.pellicleCountLabel.textContent = state.pellicleCount;
  if (!els.usePellicle.checked) {
    els.pellicleHint.textContent = "Bez placky to jde, když máš kvalitní kyselý startér.";
    return;
  }
  const score    = calc.pellicleScore;
  const idealMin = calc.workingLiters <= 1.5 ? 0.5 : calc.workingLiters <= 3 ? 1 : calc.workingLiters <= 5 ? 2 : 3;
  const idealMax = calc.workingLiters <= 1.5 ? 1   : calc.workingLiters <= 3 ? 2 : calc.workingLiters <= 5 ? 3 : 4;
  let text;
  if      (score < idealMin) text = "Placka je jen spolujezdec. Řidič je startér.";
  else if (score > idealMax) text = "Na velikosti tady nezáleží. Hlavní síla je ve startéru.";
  else                       text = "Placka akorát – malý bonus ke startu.";
  const g = numberValue(els.pellicleGrams, 0);
  els.pellicleHint.textContent = `${text} Bonus: +${(calc.pellicleBonus * 100).toFixed(1)} pp${g > 0 ? ` (cca ${Math.round(g)} g)` : ""}.`;
}

function updateTemperature() {
  const band = temperatureBands[state.temperature] || temperatureBands.unknown;
  els.tempHint.textContent = band.text;
}

function updateSugar(calc) {
  const statuses = [
    { icon: "☹️", text: "SCOBY na dietě",             active: calc.sugarBand === "very_low" || calc.sugarBand === "low"  },
    { icon: "🙂", text: "Tady si SCOBY pomlaskává",   active: calc.sugarBand === "safe"                                   },
    { icon: "😅", text: "Sladší základ, ale v pohodě", active: calc.sugarBand === "sweeter"                               },
    { icon: "😨", text: "SCOBY dostane cukrovku",      active: calc.sugarBand === "tlamolep" || calc.sugarBand === "extreme" }
  ];
  els.sugarStatus.innerHTML = statuses.map(s => `<div class="${s.active ? "active" : ""}">${s.icon}<br>${s.text}</div>`).join("");
}

function updateOutputs(calc) {
  if (calc.errors.length) {
    els.needsList.innerHTML         = calc.errors.map(t => `<li><strong>Pozor:</strong> ${t}</li>`).join("");
    els.predictionTitle.textContent = "Nejdřív doplň vstupy.";
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
  const pellicleLine = calc.pellicleEnabled
    ? `<li><img src="${pellicles[state.pellicleSize].icon}" alt="" aria-hidden="true"><span><strong>Placka:</strong> ${state.pellicleCount}× ${pellicles[state.pellicleSize].label}</span></li>`
    : "";
  const safeBatchLine = calc.starterSeverity === "STOP"
    ? `<li class="fix-line"><span><strong>Bezpečnější posilovací várka:</strong> s tímhle startérem jdi spíš na ${starterFixRange(calc)}. Pro původní objem potřebuješ aspoň ${kitchenStarterAmount(calc.requiredStarterMinL)}, ideálně ${kitchenStarterAmount(calc.requiredStarterTargetL[0])}-${kitchenStarterAmount(calc.requiredStarterTargetL[1])} startéru.</span></li>`
    : "";
  els.needsList.innerHTML = `
    <li><img src="ikony/kombucha.png"            alt="" aria-hidden="true"><span><strong>Sladký čaj celkem:</strong> ${roundLiters(calc.teaLiters)}</span></li>
    ${teaLines}
    <li><img src="ikony/cukr.png"               alt="" aria-hidden="true"><span><strong>Cukr:</strong> ${approxRange(calc.sugarTotal, 5)} (${Math.round(calc.sugarPerLiter)} g/l)</span></li>
    <li><img src="ikony/startér pro příště.png" alt="" aria-hidden="true"><span><strong>Startér:</strong> ${roundMl(calc.starterMl)} (${Math.round(calc.starterRatio * 100)} % objemu)</span></li>
    ${pellicleLine}
    ${safeBatchLine}`;

  // Prediction
  const pred = predictions[calc.predKey];
  if (calc.starterSeverity === "STOP") {
    const needT0 = kitchenStarterAmount(calc.requiredStarterTargetL[0]);
    const needT1 = kitchenStarterAmount(calc.requiredStarterTargetL[1]);
    els.predictionTitle.textContent = "Stopka. Tohle je slabý start.";
    els.predictionText.textContent  = `Na ${roundLiters(calc.workingLiters)} máš jen ${formatPercent(calc.starterRatio)} ${calc.starterType.label}ho startéru. Minimum je ${formatPercent(calc.starterMin, 0)}, tedy aspoň ${kitchenStarterAmount(calc.requiredStarterMinL)}, ideálně ${needT0}-${needT1}. ${calc.onlyExtraTea ? "Čaj je navíc experiment." : "Čajový základ je v pořádku."} ${calc.pellicleEnabled ? "Placka trochu pomůže, ale tenhle poměr startéru nezachrání." : ""}`;
  } else {
    els.predictionTitle.textContent = pred.title;
    els.predictionText.textContent  = pred.text;
  }
  els.intensityDots.innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < pred.intensity ? "on" : ""}"></span>`).join("");

  // Severity label
  const severityLabel = {
    STOP:     "🛑 Stopka – málo startéru",
    RED:      "🔴 Výrazně pod minimem",
    YELLOW:   "🟡 Hraniční start",
    OK:       "🟢 Poměr startéru OK",
    FAST:     "🟠 Rychlý kyselý směr",
    TOO_MUCH: "🔴 Příliš mnoho startéru"
  }[calc.starterSeverity] || "";

  // Sugar label
  const sugarLabel = {
    zero:     "žádný cukr ⛔",
    very_low: "SCOBY na dietě",
    low:      "sušší základ",
    safe:     "bezpečný základ",
    sweeter:  "sladší základ",
    tlamolep: "hrozí tlamolep ⚠️",
    extreme:  "extrém ⛔"
  }[calc.sugarBand] || "";

  const f2 = f2Tags[calc.f2Key];
  const tempNote = calc.tempBand.text ? ` (${calc.tempBand.text})` : "";

  els.recommendations.innerHTML = [
    ["Start várky",           severityLabel],
    ["Kdy ochutnávat",        calc.tasteWindow + tempNote],
    ["Cukr",                  `${Math.round(calc.sugarPerLiter)} g/l – ${sugarLabel}`],
    [f2.tag,                  f2.text]
  ].map(([title, text]) =>
    `<div class="recommendation-item"><strong>${title}</strong><p>${text}</p></div>`
  ).join("") + calc.warnings.map(t =>
    `<div class="recommendation-item warning"><strong>Pozor</strong><p>${t}</p></div>`
  ).join("");
}

// ═══ SYNC MODE UI ═══

function syncModeUI() {
  document.querySelectorAll(".mode-option").forEach(label => {
    label.classList.toggle("active", label.dataset.modeCard === state.mode);
    label.querySelector("input").checked = label.dataset.modeCard === state.mode;
  });
  els.goalStrip.hidden  = state.mode !== "classic";
  els.tempPanel.hidden  = false;
  els.sugarPanel.classList.toggle("visible", state.mode === "experiment");
  els.teaIntro.textContent = state.mode === "classic"
    ? "Vyber jen čaje, které chceš použít. Poměr vody i gramáž doporučí Kombuchátor."
    : "Zadej skutečný stav: typ čaje, gramáž a kolik vody opravdu použiješ.";
  els.modeNote.innerHTML = state.mode === "classic"
    ? "<strong>Klasická kalkulačka:</strong> vybereš cíl a Kombuchátor doporučí bezpečné poměry."
    : "<strong>Hokus pokus:</strong> zadáváš reálné ingredience a Kombuchátor odhadne, co z toho vyleze.";
  els.jarChoice.classList.toggle("active", state.volumeSource === "jar");
  els.targetChoice.classList.toggle("active", state.volumeSource === "target");
}

// ═══ RENDER ═══

function render(options = {}) {
  const shouldRenderTeas = options.teas !== false;
  syncModeUI();
  if (shouldRenderTeas) renderTeas();
  const calc = calculate();
  updateVolumeHint(calc);
  updateStarter(calc);
  updateTea(calc);
  updatePellicle(calc);
  updateTemperature();
  updateSugar(calc);
  updateOutputs(calc);
}

// ═══ EVENTS ═══

function updateTeaFromDom(event) {
  if (event?.target.matches(".tea-type")) {
    const icon = event.target.closest(".tea-picker")?.querySelector(".tea-icon");
    if (icon) icon.src = teaTypes[event.target.value]?.icon ?? "";
  }
  state.teas = Array.from(document.querySelectorAll(".tea-row[data-tea-id]")).map(row => ({
    id:      row.dataset.teaId,
    enabled: row.querySelector(".tea-check").checked,
    type:    row.querySelector(".tea-type").value,
    role:    row.querySelector(".tea-role").value,
    grams:   Number(row.querySelector(".tea-grams").value) || teaTypes[row.querySelector(".tea-type").value].grams,
    waterMl: row.querySelector(".tea-water").value
  }));
  render({ teas: false });
}

function bindEvents() {
  document.querySelectorAll("input[name='mode']").forEach(input => {
    input.addEventListener("change", () => { state.mode = input.value; render(); });
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
  [els.jarLiters, els.targetLiters, els.starterMl, els.pellicleGrams, els.sugarPerLiter, els.sugarTotal, els.sugarSlider].forEach(input => {
    input.addEventListener("input", () => {
      if (input === els.jarLiters)     state.volumeSource = "jar";
      if (input === els.targetLiters)  state.volumeSource = "target";
      if (input === els.sugarSlider)   els.sugarPerLiter.value = input.value;
      if (input === els.sugarPerLiter) { state.sugarSource = "perLiter"; els.sugarSlider.value = input.value || 65; }
      if (input === els.sugarTotal)    state.sugarSource = "total";
      render();
    });
  });
  els.jarLiters.addEventListener("focus",    () => { state.volumeSource = "jar";    render(); });
  els.targetLiters.addEventListener("focus", () => { state.volumeSource = "target"; render(); });
  els.addTeaBtn.addEventListener("click", () => {
    state.teas.push({ id: createTeaId(), enabled: true, type: "rooibos", role: "extra", grams: 6, waterMl: "" });
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
    if (Number.isFinite(c) && els.temperatureInput.value !== "") {
      if      (c < 20) state.temperature = "cold";
      else if (c <= 25) state.temperature = "room";
      else if (c <= 29) state.temperature = "warm";
      else              state.temperature = "hot";
      renderChoices();
    }
    render();
  });
  els.usePellicle.addEventListener("change", render);
  els.pellicleMinus.addEventListener("click", () => { state.pellicleCount = Math.max(1, state.pellicleCount - 1); render(); });
  els.pelliclePlus.addEventListener("click",  () => { state.pellicleCount += 1; render(); });
  els.howItWorksBtn.addEventListener("click",  () => els.howItWorksDialog.showModal());
  els.closeDialog.addEventListener("click",    () => els.howItWorksDialog.close());
}

renderChoices();
bindEvents();
render();
