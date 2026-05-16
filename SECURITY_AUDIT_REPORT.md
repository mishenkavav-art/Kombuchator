# Security Audit Report - Kombuchator

Datum auditu: 2026-05-16

## 1. Zjistena architektura

- Stack: vanilla HTML/CSS/JavaScript frontend, Node.js backend postaveny primo nad `http` modulem.
- Framework: zadny frontend framework, zadny Express.
- Backend: ano, `server.js`.
- Databaze: ne klasicka databaze; server uklada data do lokalnich JSON souboru. Po doplneni tokenove ochrany jsou sync data oddelena v `.sync-stores/<syncId>.json`; autentizacni hashe jsou v `.sync-auth.json`; push subscriptions jsou v `.push-subs.json`; notifikacni deduplikace je v `.notified.json`; VAPID klice jsou v `.vapid.json`.
- API endpointy:
  - `GET /api/vapid-public-key` - vraci public VAPID key.
  - `POST /api/sync/bootstrap` - vytvori nebo overi per-install sync identitu.
  - `POST /api/push-subscribe` - uklada push subscription pro overeny `syncId`.
  - `GET /api/sync` - vraci sync stav pouze pro overeny `syncId`.
  - `POST /api/sync` - prijima a merguje varky, recepty, pripominky a tombstones pouze pro overeny `syncId`.
- Autentizace/autorizace: implementovana minimalni per-install tokenova ochrana bez plneho prihlaseni. Klient posila `X-Sync-Id` a `X-Sync-Token`; server uklada pouze hash tokenu a oddeluje data podle `syncId`.
- Local storage: frontend pouziva `localStorage` pro recepty, varky, tombstones, fired notification IDs a lokalni sync identitu `kombuchator.syncIdentity.v1`.
- PWA/service worker: ano, `sw.js`; cache statickych souboru a deduplikace push-fired reminder IDs.
- Synchronizace mezi zarizenimi: ano, pres `/api/sync`; serverovy JSON store je zdroj pravdy, klienti merguji lokalni a vzdaleny stav.
- Env promene: `PORT`; nove pridane `ALLOWED_ORIGINS`, `MAX_JSON_BYTES`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `NODE_ENV`, `DATA_DIR`.
- Secrets: `.vapid.json` obsahuje VAPID private key. Soubor byl lokalne pritomny a pred opravou nebyl v `.gitignore`.
- Deploy: Railway, sluzba `Kombuchator`, produkcni URL `https://kombuchator-production.up.railway.app`.
- Bezpecnostni hlavicky pred auditem: nebyly centralne nastavene.
- CORS pred auditem: `Access-Control-Allow-Origin: *`.
- Hlavni kalkulacni logika: `script.js`, zejmena stav caju, starteru, cukru, objemu a predikci; do vypoctu jsem nezasahoval.
- Formulare a uzivatelske vstupy: nazvy receptu/varek, poznamky, datumy/casy, cisla pro objem, starter, cukr, caje, F1/F2.
- Historie, poznamky, pripominky: `script.js` + server sync v `server.js`.

## 2. Nalezene problemy a opravy

### Critical: verejne servirovani neveřejnych souboru

- Soubory: `server.js`, puvodni staticky handler u konce souboru.
- Riziko: pred opravou mohl staticky server vratit libovolny soubor v rootu aplikace, vcetne `.vapid.json`, `server.js`, `package.json`, internich JSON souboru a dalsich souboru.
- Mozny utok: utocnik mohl ziskat VAPID private key nebo serverovy kod a konfiguraci.
- Oprava: provedeno.
  - Verejne jsou pouze `/`, `/index.html`, `/style.css`, `/script.js`, `/sw.js`, `/manifest.json` a obrazky v `/ikony/`.
  - Neveřejne soubory vraci 404.
  - Implementace: `server.js` radky 25, 157-162, 437-447.
- Mimo kod: VAPID klic povazovat za potencialne unikly a zrotovat.

### High: wildcard CORS na produkcnim API

- Soubor: `server.js`, puvodni `cors()` vracel `Access-Control-Allow-Origin: *`.
- Riziko: libovolny web mohl cist a zapisovat sdilena data pres API, pokud prohlizec dovolil request.
- Mozny utok: skodliva stranka mohla z browseru uzivatele nacist nebo prepsat varky/recepty/pripominky.
- Oprava: provedeno.
  - CORS je allowlist pres `ALLOWED_ORIGINS`.
  - Default povoluje lokalni dev originy a produkcni Railway origin.
  - Neznamy Origin dostane 403.
  - Implementace: `server.js` radky 14-24, 42-54, 371-374.
- Mimo kod: na Railway nastavit `ALLOWED_ORIGINS=https://kombuchator-production.up.railway.app`.

### High: chybejici autentizace a autorizace pro soukroma data

- Soubory: `server.js` endpointy `/api/sync`, `/api/push-subscribe`.
- Riziko: pred opravou mela aplikace jeden sdileny serverovy store bez identity. CORS nebyl a neni nahrada autentizace, protoze API muze byt volane mimo browser.
- Mozny utok: kdokoliv, kdo znal endpoint, mohl cist nebo prepsat globalni varky/recepty/pripominky.
- Oprava: provedeno jako minimalni per-install auth bez loginu.
  - Klient si vytvari kryptograficky nahodny `syncId` a `syncSecret` pomoci `crypto.getRandomValues()`.
  - Token se uklada pouze lokalne v `localStorage`, neposila se v URL a neloguje se.
  - `/api/sync` a `/api/push-subscribe` vyzaduji hlavicky `X-Sync-Id` a `X-Sync-Token`.
  - Server uklada hash secretu v `.sync-auth.json` a data oddeluje do `.sync-stores/<syncId>.json`.
  - Stary `.sync.json` se pri prvnim bootstrapu nemaze; server ho zalohuje a priradi prvni vytvorene identite.
  - Push subscriptions jsou oddelene podle `syncId`.
- Zbyvajici riziko: nejde o plnohodnotne uzivatelske ucty. Kdo ziska localStorage zarizeni, ziska i sync token.

### Medium: chybejici security headers

- Soubor: `server.js`.
- Riziko: vyssi sance XSS dopadu, clickjackingu, MIME sniffingu a nadmernych browser permissions.
- Oprava: provedeno.
  - Pridano `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, HSTS v produkci.
  - Implementace: `server.js` radky 56-80.
- Poznamka: CSP stale povoluje `style-src 'unsafe-inline'`, protoze UI pouziva inline style atributy a dynamicke styly. Dalsi zprisneni by vyzadovalo refaktor inline stylu.

### Medium: prilis velky a malo validovany API payload

- Soubor: `server.js`.
- Riziko: DoS velkym JSON payloadem, rozbiti sync dat vadnym tvarem, extremne dlouhe texty.
- Oprava: provedeno.
  - Globalni limit JSON payloadu pres `MAX_JSON_BYTES`, default 1 MB.
  - Push subscription limit 64 KB.
  - Sanitizace sync payloadu: max pocty varek/receptu/checku/reminderu, delky stringu, validace reminder datumu a stavu.
  - Implementace: `server.js` radky 11, 98-155, 335-355, 389-430.

### Medium: chybejici rate limiting

- Soubor: `server.js`.
- Riziko: API slo zneuzit k caste sync zatezi nebo push-subscribe spamu.
- Oprava: provedeno.
  - Jednoduchy in-memory per-IP rate limit s env konfiguraci.
  - Implementace: `server.js` radky 12-13, 82-96, 382-415.
- Limitace: in-memory rate limit se resetuje po restartu a neni sdileny mezi instancemi.

### Medium: localStorage mohl obsahovat poskozena nebo extremni data

- Soubor: `script.js`.
- Riziko: jeden poskozeny zaznam mohl rozbit vykresleni nebo sync; dlouhe texty mohly zpomalit UI.
- Oprava: provedeno.
  - `loadSavedRecipes()` a `loadBatches()` nyni sanitizuji strukturu, ID, nazvy, poznamky a reminders.
  - Implementace: `script.js` radky 409-481 a `loadBatches()` kolem radku 2060.

### Medium: uzivatelske texty bez limitu delky

- Soubory: `index.html`, `script.js`.
- Riziko: dlouhe nazvy/poznamky mohly zhorsit vykon, rozbit layout nebo zvetsit sync payload.
- Oprava: provedeno.
  - Text inputy maji `maxlength`.
  - Ukladani nazvu a poznamek pouziva `cleanText()` / `cleanNullableText()`.
  - Implementace: `index.html` textove inputy/textarea, `script.js` radky 416-425 a ulozeni varek/kontrol/receptu.

### Low/Medium: PWA cache mohla drzet starsi HTML

- Soubor: `sw.js`.
- Riziko: mobil mohl po deployi zustat na starsim HTML/JS/CSS, coz uz zpusobovalo rozdilne chovani mezi zarizenimi.
- Oprava: provedeno.
  - Cache verze zvysena na `kombuchator-v40`.
  - Runtime cache uz necachuje `/` ani `.html`; API se necachuje.
  - Implementace: `sw.js` radky 1, 69-85.

### Low: zbytecne dependency v supply chain

- Soubory: `package.json`, `package-lock.json`.
- Riziko: nepouzite baliky zvetsuji attack surface a build.
- Oprava: provedeno.
  - Odstraneno nepouzite `sharp` a `puppeteer`.
  - Ponechano `@playwright/test` jako dev dependency.
  - `npm audit --audit-level=moderate`: 0 vulnerabilities.

## 3. XSS stav

- Uzivatelske texty v HTML vystupech jsou vetsinou vkladane pres `escapeHtml()` nebo `textContent`.
- Nebezpecne `dangerouslySetInnerHTML` se nepouziva.
- `innerHTML` se pouziva pro sablony UI; uzivatelska data v kontrolovanych mistech jsou escapovana.
- Doplneno zkracovani a cisteni kontrolnich znaku u nazvu a poznamek.
- CSP snizuje dopad pripadne chyby, ale kvuli inline stylum neni maximalne striktni.

## 4. PWA/cache a sync stav

- API endpointy se ve service workeru necachuji.
- HTML/root uz se runtime-cache neuklada.
- Reminder merge uz pouziva `updatedAt` a terminalni stavy, aby stary lokalni `pending` neprepsal serverovy `done`.
- Sync API je chranene per-install tokenem a serverova data jsou oddelena podle `syncId`.
- CORS zustava pouze dalsi ochranna vrstva; hlavni kontrola pristupu je token v hlavickach.

## 5. Secrets a deploy

- `.vapid.json`, `.sync.json`, `.sync-auth.json`, `.sync-stores/`, `.sync-migration-backups/`, `.push-subs.json`, `.notified.json`, `.env*` jsou pridane do `.gitignore`.
- Pridan `.env.example` bez skutecnych secret hodnot.
- VAPID private key se stale generuje do `.vapid.json`; pro produkci je lepsi nastavit stabilni secret pres Railway env/volume nebo zavest rotacni postup.
- Protoze `.vapid.json` mohl byt pred opravou verejne staticky dostupny, doporucuji VAPID klic okamzite zrotovat.

## 6. Testy a overeni

Spusteno:

- `node --check server.js`
- `node --check script.js`
- `node --check sw.js`
- `npm audit --audit-level=moderate` - 0 vulnerabilities
- Lokalni server na `PORT=3001`
- `curl -I /` - vraci security headers
- `curl /.vapid.json` - 404
- `curl /server.js` - 404
- `curl /api/sync` s nepovolenym Origin - 403
- `curl /api/sync` bez tokenu - 401
- `curl /api/sync` se spatnym tokenem - 401/403
- `curl /api/sync` s platnym tokenem - 200
- Overeno oddeleni dvou sync identit: druha identita nevidi data prvni.

Produkce overena 2026-05-16 na `https://kombuchator-production.up.railway.app`:

- Deploy stav po rucnim Railway deployi: nova verze je na produkci nasazena.
- `GET /api/sync` bez tokenu: `401`.
- `POST /api/sync` bez tokenu: `401`.
- `POST /api/sync/bootstrap` bez tokenu: `401`, endpoint existuje a nevraci `404`.
- `GET /api/sync` s neexistujici identitou/spatnym tokenem: `401`.
- `POST /api/push-subscribe` bez tokenu: `401`.
- `GET /.vapid.json`: `404`.
- `GET /server.js`: `404`.
- `GET /package.json`: `404`.
- CORS s nepovolenym originem: `403`, bez `Access-Control-Allow-Origin`.
- Security headers pritomne: CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- Service worker: produkce vraci `kombuchator-v40`.
- Railway nastaveni potvrzene rucne: `NODE_ENV=production`, `ALLOWED_ORIGINS=https://kombuchator-production.up.railway.app`, `DATA_DIR=/data`, limity payload/rate limit a Volume pripojeny na `/data`.
- Zaver: produkcni sync API je chranene tokenem. Perzistence JSON dat je kodove smerovana do `/data`; skutecne preziti restartu/redeploye je zavisle na Railway Volume a nebylo destruktivne testovano restartem.

Neprovedeno:

- Playwright vizualni/mobile test kvuli chybejici systemove knihovne `libnspr4.so` v lokalnim prostredi.
- Plny end-to-end test kalkulacniho UI v prohlizeci. Syntax, server start a API/security flow prosly.
- Overeni Railway volume pres CLI nebylo mozne kvuli neplatnemu lokalnimu Railway prihlaseni. Restart/redeploy test perzistence nebyl proveden, aby se zbytecne nezasahovalo do produkcnich dat.

## 7. Co zustava k nastaveni mimo kod

- Railway:
  - Obnovit autorizaci CLI pres `railway login`, nebo nastavit `RAILWAY_TOKEN` pouze jako lokalni/session secret mimo repo.
  - Overit v dashboardu, zda je service napojena na GitHub repo `mishenkavav-art/Kombuchator`, branch `main`, a zda je povolen auto-deploy po pushi.
  - Pokud auto-deploy neni napojen, v Railway dashboardu otevrit service Kombuchator -> Settings -> Source -> GitHub Repo a vybrat repo + branch `main`.
  - Pokud se po pushi deploy nespustil, otevrit Deployments a zkontrolovat build/deploy chybu posledniho pokusu; pripadne spustit manual redeploy z commitu `8efaea4`.
  - Nastavit `NODE_ENV=production`.
  - Nastavit `ALLOWED_ORIGINS=https://kombuchator-production.up.railway.app`.
  - Volitelne nastavit `MAX_JSON_BYTES=1048576`, `RATE_LIMIT_WINDOW_MS=60000`, `RATE_LIMIT_MAX=120`.
  - Nastavit `DATA_DIR=/data` a pripojit Railway Volume na `/data`, pokud maji JSON data prezit redeploy/restart.
  - Start command musi pouzivat `npm start`, coz podle `package.json` spousti `node server.js`.
  - Zkontrolovat HTTPS-only provoz.
  - Zrotovat VAPID klice po predchozim moznosti vystaveni `.vapid.json`.
  - Overit perzistenci JSON dat. Pokud service nema Railway Volume pripojeny na `DATA_DIR`, soubory `.sync-auth.json`, `.sync-stores/`, `.push-subs.json` a `.sync-migration-backups/` nemusi prezit redeploy/restart kontejneru. Pro produkci je potreba Railway Volume nebo databaze.
  - Nastavit monitoring/log alerts pro 4xx/5xx a restart smycky.
- GitHub/repozitar:
  - Zapnout Dependabot security updates.
  - Zapnout branch protection pro main.
  - CI: `npm audit --audit-level=moderate`, `node --check server.js`, `node --check script.js`, `node --check sw.js`.
- Produktove:
  - Rozhodnout, zda per-install token staci, nebo jestli je potreba plne prihlaseni a ucty. Per-install token chrani API pred anonymnim ctenim/zapisem, ale neresi obnovu pristupu ani role.
  - Zvolit trvalou databazi misto lokalniho JSON souboru, pokud ma aplikace byt viceuzivatelska.

## 8. Zbyvajici rizika

- Medium/High: per-install token neni plnohodnotny uzivatelsky login. CORS a rate limit nejsou nahrada za auth; token je aktualni hlavni ochrana sync dat.
- Medium: in-memory rate limit neni sdileny a resetuje se restartem.
- Medium: serverovy JSON store nema databazove transakce; zapis je atomicky po souboru, ale neplni uroven databaze.
- Medium: pri ztrate localStorage tokenu neni implementovana obnova identity.
- Low/Medium: CSP vyzaduje `style-src 'unsafe-inline'`, dokud UI obsahuje inline styly.
- Low: Google Fonts jsou externi dependency; pokud je cilem maximalni privacy/offline determinismus, fonty lokalne vendornout.
