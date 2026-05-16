# VAPID Rotation

VAPID klice slouzi pro web push notifikace. Stare klice povazuj za kompromitovane, protoze `/.vapid.json` byl drive verejne dostupny.

Skutecne VAPID klice nikdy necommituj. Nevkladej je do dokumentace, GitHub issue, pull requestu ani chatu.

## Railway Variables

Na Railway service Kombuchator nastav tyto variables:

```text
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

Doporuceny tvar subjectu:

```text
mailto:your-email@example.com
```

## Vygenerovani novych klicu

Spust lokalne ve slozce projektu:

```bash
npx web-push generate-vapid-keys
```

Vygenerovany public key vloz do `VAPID_PUBLIC_KEY` a private key do `VAPID_PRIVATE_KEY` v Railway Variables. Skutecne hodnoty neukladej do repozitare.

## Bezpecna rotace

1. Vygeneruj novy VAPID par lokalne.
2. Otevri Railway dashboard.
3. Otevri service Kombuchator a sekci Variables.
4. Nastav `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` a `VAPID_SUBJECT`.
5. Proved redeploy service.
6. Over, ze `GET /api/vapid-public-key` vraci public key.
7. Over, ze `GET /.vapid.json` vraci `404`.
8. Nech uzivatele obnovit aplikaci. Pokud prestanou chodit notifikace, je potreba v aplikaci/prohlizeci notifikace vypnout a znovu zapnout, aby vznikla nova push subscription.

## Lokalni vyvoj

Pouze mimo produkci muze server pri chybejicich VAPID variables pouzit nebo vytvorit lokalni `.vapid.json` uvnitr `DATA_DIR`. Soubor je ignorovany Gitem a aplikace ho verejne neserviruje.

V produkci chybejici `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` nebo `VAPID_SUBJECT` zastavi start serveru misto generovani souboroveho secretu.
