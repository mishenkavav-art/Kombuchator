# Kombuchátor

Česká webová aplikace (PWA) pro výpočet kombuchy, sledování várek a správu receptů. Běží na Railway, funguje offline, synchronizuje data přes server a posílá push notifikace.

## Spuštění lokálně

```bash
npm install
node server.js          # spustí na http://localhost:3000
```

## Architektura

- **Frontend:** Vanilla JS + HTML + CSS, žádný framework, žádný bundler
- **Backend:** Node.js HTTP server (`server.js`) — statické soubory + REST API
- **Persistence:** `localStorage` na klientu, `.sync.json` na serveru
- **Nasazení:** Railway (`railway up`)

---

## Funkce

### Kalkulačka (F1)

Dva režimy:

**Klasická** — uživatel zadá cílový výstup a kalkulačka dopočítá potřebné ingredience.  
**Experimentální laboratoř** — uživatel zadá reálné ingredience, kalkulačka odhadne výsledek.

Co se počítá:
- Objem várky (podle nádoby nebo cílového výstupu)
- Typ a množství startéru, varování při slabém poměru
- Jeden nebo více druhů čaje (gramy/litr nebo celkem, množství vody)
- Cukr (g/litr nebo celkem) — přepínač ve stylu volume cards
- Zohlednění placky (SCOBY) — typ a počet, přepočet grámů
- Teplota — teplotní pásma (mráz/chladno/pokoj/teplo/hic) nebo přesná hodnota °C
- Cíl várky (jemný čajíček / vyvážená / s řízem / startér pro příště / kyselina pro nepřítele / F2)
- Okno ochutnávání (rozsah dní) na základě startéru, teploty, cukru a cíle
- Verdikt a predikce chuti
- Varování při nevhodných kombinacích

Výstup:
- Přehled ingrediencí (needs list)
- Verdict s predikcí fermentace
- Sdílení přes WhatsApp nebo schránka
- Uložení do Kombuchařky
- Přímé přesunutí do Kvasírny

---

### Kombuchařka (zápisník receptů)

- Ukládání receptů z kalkulačky
- Editace názvu receptu
- Osobní poznámka ke každému receptu
- Primární akce: **Založ várku** a **Upravit** (nahrát zpět do kalkulačky)
- Sekundární: WhatsApp, Kopírovat, Smazat
- Feedback po kopírování přímo na kartě
- **Undo smazání** — 5 vteřin na vrácení smazaného receptu

---

### Kvasírna (sledování várek)

- Zakládání várek ručně nebo z receptu (snapshot v momentu založení)
- Typy: F1, F2
- Stavy: aktivní, potřebuje ochutnání, ukončená
- **Progress bar** na každé kartě: "Den X / ~Y" podle predikovaného okna ochutnávání
- **Souhrn nahoře:** počet aktivních várek + celkový objem v litrech
- Kontroly várky (hodnocení kyselosti, sladkosti, barvy, poznámka, datum)
- Připomínky s push notifikacemi (VAPID, web-push)
- Přidání/editace/odložení připomínek
- Detail várky s chronologickou časovou osou
- F2 várka — zakládá se z ukončené F1
- Editace snapshotu receptu u várky
- Přiřazení receptu ze zápisníku
- Přejmenování várky inline
- Filtrování (aktivní / k řešení dnes / naplánované / ukončené)
- Fulltextové vyhledávání
- **Undo smazání** — 5 vteřin na vrácení smazané várky

---

### Sync a PWA

- **Multi-device sync** přes server (`POST /api/sync`) — merge při každém uložení
- **Tombstone mechanismus** pro smazané záznamy (deletedBatchIds, deletedRecipeIds)
- **Offline podpora** přes Service Worker (network-first, fallback na cache)
- **Push notifikace** — server kontroluje připomínky každou minutu, odesílá přes web-push
- **Catch-up** — nové zařízení dostane zpožděné notifikace při prvním přihlášení
- **PWA manifest** — instalovatelná jako app na mobilu i desktopu
- Verze cache v `sw.js` — bump při každém nasazení

---

## API endpointy

| Metoda | Cesta | Popis |
|--------|-------|-------|
| GET | `/api/vapid-public-key` | Vrátí VAPID public key pro push subscribe |
| POST | `/api/push-subscribe` | Registrace push subscription |
| GET | `/api/sync` | Stažení aktuálního stavu ze serveru |
| POST | `/api/sync` | Upload + merge dat (piggyback push sub) |

---

## Soubory

```
index.html      — struktura stránky, dialogy, modaly
script.js       — veškerá logika (kalkulačka, render, sync, push)
style.css       — všechny styly (desktop + mobile, container queries)
server.js       — Node.js server (API, push, statika)
sw.js           — Service Worker (cache, push handler)
manifest.webmanifest
ikony/          — PNG ikony pro manifest a notifikace
.sync.json      — serverová kopie dat (gitignored)
.push-subs.json — push subscriptions (gitignored)
.vapid.json     — VAPID klíče (gitignored)
.notified.json  — seznam již odeslaných notifikací (gitignored)
```
