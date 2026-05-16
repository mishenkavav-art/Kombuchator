# Sync Security

Kombuchator nepouziva plne uzivatelske prihlaseni. Synchronizace je proto chranena minimalnim per-install tokenem.

## Jak token funguje

Pri prvnim spusteni aplikace si klient v prohlizeci vytvori:

- `syncId`
- `syncSecret`

Obe hodnoty jsou generovane pomoci `crypto.getRandomValues()` a ukladaji se lokalne do `localStorage` pod klicem:

```text
kombuchator.syncIdentity.v1
```

Klient je neposila v URL ani je nevypisuje do konzole. Server je dostava pouze v HTTP hlavickach:

```text
X-Sync-Id
X-Sync-Token
```

Server uklada jen hash secretu v `.sync-auth.json`, ne samotny secret.

## Jak jsou oddelena data

Kazdy `syncId` ma vlastni sync soubor:

```text
.sync-stores/<syncId>.json
```

Push subscriptions jsou take oddelene podle `syncId` v `.push-subs.json`.

`/api/sync` bez platneho paru `syncId + syncSecret` vraci `401` nebo `403` a nevraci soukroma data.

## Migrace starych dat

Stary globalni `.sync.json` se nemaze.

Pri prvnim bootstrapu nove identity server:

1. zkontroluje, zda existuji legacy data v `.sync.json`,
2. vytvori zalohu do `.sync-migration-backups/`,
3. priradi legacy data prvni vytvorene sync identite,
4. dalsi identity dostanou prazdny oddeleny store.

Pred touto upravou byla navic vytvorena rucni zaloha mimo repo:

```text
/tmp/kombuchator-security-backup-20260516-092720
```

## Reset lokalni identity

Reset znamena, ze dana instalace prestane pouzivat puvodni serverovy store a vytvori si novou identitu.

V prohlizeci lze reset provest smazanim localStorage klice:

```text
kombuchator.syncIdentity.v1
```

Pozor: tim se nezmaze lokalni historie varek ani receptu, ale nova identita bude mit vlastni oddeleny serverovy prostor. Pokud se lokalni data nasledne synchronizuji, nahraji se pod novou identitou.

## Zbyvajici rizika

Per-install token neni plnohodnotne prihlaseni:

- kdo ziska localStorage daneho zarizeni, ziska i sync secret,
- token neni pohodlne sdilitelny mezi zarizenimi bez dalsi UI vrstvy,
- neni zde role/ucet/obnova pristupu,
- server stale nema uzivatelskou databazi ani audit login udalosti.

Pro produkcni viceuzivatelskou aplikaci je dalsi krok plna autentizace a databaze s per-user autorizaci.
