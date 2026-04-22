# Etappe 5 · Baustein 2 — Kalender-UI-Gerüst (Read-Only)

**Datum:** 22.04.2026
**Status:** Geliefert, Babel-validiert, deploy-bereit
**Voraussetzung:** Baustein 1 deployed (`v1.0.0-etappe5-b1-firebase` läuft, Konsole zeigt "Etappe-5-Vollausbau")

---

## Was dieser Baustein bringt

Der Tab **"Kalender"** zeigt ab sofort einen **funktionsfähigen 3-Jahres-Kalender**, live abonniert an Firebase. Er liest, er zeigt — aber er schreibt noch nicht. Das Tages-Modal zum Bearbeiten ist bewusst Baustein 3.

### Sichtbar neu im Tab "Kalender"

- **Monats-Ansicht:** Klassisches Kalender-Grid, 7 Spalten × 6 Zeilen
- **Navigation oben:** `‹` Zurück · Monat+Jahr · `HEUTE`-Button · Vor `›`
- **Wochentage-Header:** Mo bis So (europäisch), Wochenende rot hervorgehoben
- **Status-Glyph pro Tag (Kreis oben rechts):**
  - 🟢 Grün `✓` = anwesend
  - 🔵 Blau `U` = Urlaub
  - 🔴 Rot `K` = krank
  - ⚪ Grau `·` = frei
- **Baustellen-Balken am Tages-Unterrand:** bis zu 3 gestapelt, farbig laut Planung, "+N" wenn mehr
- **Heute-Markierung:** Roter Rahmen um die heutige Tageszelle
- **Wochenende:** Zart rot eingefärbte Zellen
- **Tage aus Vor-/Folgemonat:** Ausgegraut, nicht anklickbar
- **Legende unten:** Farb-Dots mit Status-Namen (7-sprachig)
- **Info-Banner:** "Tippe auf einen Tag für Details (Bearbeiten folgt)"

### Was passiert beim Tap auf einen Tag

Aktuell: Alert mit Hinweis "Tages-Modal folgt in Baustein 3". Das ist **Absicht** — das Modal wird erst im nächsten Baustein implementiert, damit dieser Baustein sauber testbar bleibt.

---

## Was geändert wurde

| Datei | vorher | nachher | Delta |
|---|---|---|---|
| `index.html` | 3.797 Zeilen | 4.371 Zeilen | +574 Zeilen |

**Keine Änderungen** an:
- Bestehenden Komponenten (MABaustellenModul, Auth, etc.)
- Bestehendem Design (schwarzer Hintergrund, rote Tabs, Figuren, Logo)
- Externen JS-Modulen (js/tw-ma-firebase.js aus Baustein 1 bleibt unverändert)
- CSS-Variablen oder existierenden Klassen

**Rein additiv gebaut** — alle neuen Stile haben den `ma-kal-` Prefix, alle neuen Komponenten beginnen mit `MAKalender`. Kein Namensraum-Konflikt.

### Aufschlüsselung der 574 neuen Zeilen

| Bereich | Zeilen | Ort in index.html |
|---|---|---|
| UI_LABELS (30 neue Keys × 7 Sprachen) | ~45 | vor Zeile 1397 (Ende UI_LABELS-Block) |
| CSS-Regeln (18 Klassen) | ~180 | vor `</style>` (Zeile ~936) |
| React-Komponenten (6 Stück) | ~320 | nach `MAStubView`, vor `MASubHeader` |
| Helper-Funktionen (7 Stück) | ~30 | im selben Block |

---

## Testen

### Voraussetzung: Baustein 1 muss laufen

Prüfe in der Konsole vor dem Upload:
```javascript
typeof TWMaFirebase.subscribeKalenderJahr === 'function'  // muss true sein
```

### Test 1: Reine Anzeige

1. Deploy, Cache leeren, App öffnen
2. Nach PIN-Login auf Tab **Kalender** tippen
3. **Erwartung:**
   - Aktueller Monat + Jahr oben zentriert
   - 6 Zeilen × 7 Spalten sichtbar
   - Heutiger Tag hat roten Rahmen
   - Samstag/Sonntag-Spalten leicht rot getönt
   - Info-Banner unten: "Tippe auf einen Tag für Details ..."

### Test 2: Navigation

1. **`‹` Button:** geht einen Monat zurück, über Jahresgrenze hinaus (Dezember → November vorheriges Jahr)
2. **`›` Button:** geht einen Monat vor, analog
3. **`HEUTE`-Button:** springt zurück auf heutigen Monat — egal wo man ist

### Test 3: Sprach-Wechsel

1. App-Sprache auf z.B. EN wechseln (Header-Sprach-Pill)
2. **Erwartung:**
   - Monatsname "January / February / ..." statt deutsch
   - Wochentage "Mo Tu We Th Fr Sa Su"
   - `HEUTE` wird zu `TODAY`
   - Legende zeigt "Present / Vacation / Sick"
3. Für alle 7 Sprachen (DE, CS, SK, PL, EN, RO, UK) kurz durchklicken

### Test 4: Kalender-Eintrag von Master-App aus anlegen

1. In der Master-App: NACHRICHTEN → Kalender → diesen Mitarbeiter auswählen
2. Auf einen Tag im aktuellen Monat klicken → Modal öffnet
3. Status `anwesend`, Stunden `8`, Baustelle wählen → Speichern
4. **Erwartung Baustellen-App:** *Ohne Reload* erscheint der grüne `✓`-Kreis am getesteten Tag (Live-Listener)
5. In Master-App Status auf `urlaub` ändern → Glyph wechselt binnen ~1 Sek auf blaues `U`
6. In Master-App Eintrag löschen → Glyph verschwindet

### Test 5: Baustellen-Balken

1. In der Master-App: Hauptkalender → `+ Baustelle planen`
2. Baustelle wählen (z.B. "Meyer"), Zeitraum 1.–10. Mai, diesen Mitarbeiter als beteiligt anhaken, blaue Farbe → Speichern
3. **Erwartung Baustellen-App:** Tage 1.–10. Mai zeigen unten einen blauen Balken
4. Weiteres Planungs-Stück anlegen, z.B. "Huber" mit Farbe Rot, überlappt teilweise
5. **Erwartung:** Überlappende Tage zeigen 2 gestapelte Balken (blau unten, rot darüber)
6. Teste mit 4+ überlappenden Planungen → ab dem 4. erscheint "+N" unter den Balken

### Test 6: Tap-Handler

1. Auf einen Tag tippen
2. **Erwartung:** Alert "Tages-Modal zum Bearbeiten folgt in Baustein 3." (oder äquivalent in gewählter Sprache)
3. Tap auf ausgegrauten Vor-/Folgemonats-Tag: **keine Reaktion** (korrekt)

---

## Was die Master-App-Seite jetzt liefern muss

### 1. Mitarbeiter-Stammdaten (erstmalig)

Falls noch nicht passiert: In der Master-App einmal `NACHRICHTEN → Kalender` öffnen — dadurch triggert `ensureMitarbeiterStammdaten()` aus Etappe-4.1-Baustein-3. Das legt unter `/mitarbeiter/{ma-id}/` die Basis-Datensätze an.

Ohne diese Knoten zeigt die Baustellen-App trotzdem den Kalender — sie fällt auf `/users/{uid}/` zurück. Der Kalender-Scope ist dann nur die Firebase-UID statt eines Slugs — funktioniert genauso, nur die IDs sehen anders aus.

### 2. ma_id-Mapping (optional, aber empfohlen)

Wenn dein Büro Mitarbeiter-Slugs wie `ivan-petrov` vergibt, muss pro Gerät das Mapping in Firebase stehen:

```
/users/{uid}/ma_id: "ivan-petrov"
```

Dann liest die Baustellen-App aus `/kalender/ivan-petrov/...` statt aus `/kalender/{uid}/...`. **Das ist der einzige Unterschied** — die App passt sich automatisch an.

### 3. Security Rules (aus Etappe 4.1 übernommen)

Prüf kurz, dass diese Rules deployed sind:

```json
"kalender": {
  "$maId": {
    ".read":  "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)",
    ".write": "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)"
  }
},
"baustellen_planung": {
  ".read":  "auth != null",
  ".write": "auth != null && root.child('users').child(auth.uid).child('rolle').val() === 'admin'"
}
```

Wenn die Rules zu streng sind → Kalender bleibt leer trotz vorhandener Einträge. Wenn zu locker → Mitarbeiter sehen fremde Kalender. Bitte **genau** diese Rules.

---

## Troubleshooting

### Kalender bleibt leer, obwohl Einträge in Firebase existieren

1. **Konsole öffnen**, prüfen: `await TWMaFirebase.getMeineMaId()` — liefert die UID oder einen Slug?
2. In Firebase Console den Pfad `/kalender/{diese-id}/2026/` anschauen — sind die Einträge wirklich da?
3. Falls ma_id ein Slug ist, Einträge aber unter UID: Master-App hat das Mapping nicht gesetzt → `/users/{uid}/ma_id: "slug"` manuell setzen

### Balken werden nicht angezeigt

1. Unter `/baustellen_planung/{baustelle-id}/{zeitraum-id}/mitarbeiter/` muss die ma_id als Key mit Wert `true` stehen (nicht `false`, nicht `null`)
2. Felder `von` und `bis` müssen Unix-Timestamps (Millisekunden) sein, keine ISO-Strings

### Monat-Wechsel ist träge

Normal — jedes Mal wenn man über die Jahresgrenze wechselt, wird ein neuer Firebase-Listener angelegt. Beim ersten Mal ~500ms Latenz, danach gecacht.

### Wochentage starten am Sonntag statt Montag

Darf nicht passieren — die Komponente ist hart europäisch verkabelt (Mo als erster Tag). Wenn doch: Babel-Transform hat etwas verschluckt, Seite neu laden.

### Sprachwechsel zeigt DE-Monatsnamen obwohl andere Sprache gewählt

Cache-Problem — harter Reload nötig (Strg+Shift+R).

---

## Was dieser Baustein NICHT macht (Absicht)

- ❌ Kein Tap-zu-Bearbeiten (Tages-Modal) — **Baustein 3**
- ❌ Kein Audio-Diktat — erst viel später (laut Etappe-4.1-Protokoll "kommt später")
- ❌ Keine Offline-Unterstützung — Kalender braucht Internet
- ❌ Kein Wochen- oder Jahresansicht-Toggle — ggf. V2
- ❌ Keine Ungelesene-Anzeige im Tab-Icon — **Baustein 6**

---

## Deployment

**Nur EINE Datei** austauschen in `phoenix180862-cloud/Baustellen-Mitarbeiterapp`:

1. `index.html` — ersetzen

`js/tw-ma-firebase.js` aus Baustein 1 bleibt UNBERÜHRT. Wenn du aus Versehen Baustein 1 nicht ausgerollt hast, wirft die App in der Konsole `TWMaFirebase.subscribeKalenderJahr is not a function` — dann erst Baustein 1 nachziehen.

Nach dem Deploy:
1. App beenden, Cache leeren, neu öffnen
2. Unten sollte **`v1.0.0-etappe5-b2-kalender-ui`** stehen
3. Tab "Kalender" öffnen → 3-Jahres-Kalender sichtbar
4. `HEUTE`-Button tippen → heutiger Tag markiert

Wenn alles grün → `weiter` für Baustein 3 (Tages-Modal zum Eintragen/Bearbeiten).

---

## Was als nächstes kommt (Baustein 3)

- `MAKalenderTagesModal` als Overlay-Dialog
- Status-Radio: anwesend / urlaub / krank / frei
- Stunden-Input mit +/- Buttons (15-Min-Schritte)
- Baustellen-Dropdown (aus `ladeAktiveBaustellen`)
- Sonderheiten-Freitext mit Spracheingabe-Button (Web Speech API)
- Speichern / Löschen / Abbrechen
- Live-Schreiben nach `/kalender/{ma-id}/{jahr}/{datum}/`

Der Alert beim Tap wird durch dieses Modal ersetzt — der bestehende Code ruft dann statt `alert()` einen `setTagesModal(datum)` auf.

---

*TW Baustellen-App · Etappe 5 · Baustein 2 · v1.0.0-etappe5-b2-kalender-ui · 22.04.2026*
