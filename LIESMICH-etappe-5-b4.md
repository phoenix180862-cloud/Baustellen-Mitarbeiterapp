# Etappe 5 · Baustein 4 — Nachrichten-Modul UI-Gerüst (Empfangen)

**Datum:** 22.04.2026
**Status:** Geliefert, Babel-validiert, deploy-bereit
**Voraussetzung:** Bausteine 1–3 deployed (`v1.0.0-etappe5-b3-tages-modal` läuft)

---

## Was dieser Baustein bringt

Der Tab **"Nachrichten"** wird vom Platzhalter zum **lebenden Chat-Thread**. Der Mitarbeiter sieht alle Nachrichten vom Büro und seine eigenen (aus der Historie), live synchronisiert über Firebase. **Senden** ist bewusst noch deaktiviert — das ist Baustein 5.

Warum in zwei Schritten? Weil Empfangen + Anzeigen eine komplett andere Baustelle ist als Senden. Senden braucht zusätzlich Input-Validierung, Dringend-Toggle, Optimistische UI und Fehlerbehandlung bei Offline. Wenn beides in einem Baustein wäre, hätten wir 1500 Zeilen Code in einem Rutsch — und keinen klaren Testpunkt dazwischen.

### Sichtbar neu im Tab "Nachrichten"

- **Sticky-Header oben:** 💬-Icon + "Chat mit dem Büro" + Ungelesen-Zähler (rote Pille rechts)
- **Scrollbarer Chat-Thread** mit:
  - **Datum-Trenner** zwischen Tagen (Heute / Gestern / Wochentag / "12. Mai 2026")
  - **Eingehende Büro-Nachrichten** → links, graue Card mit Absender-Name in rot
  - **Eigene Nachrichten** → rechts, blauer Farbverlauf (bereit für Baustein 5)
  - **Dringend-Nachrichten** → roter 2px-Rahmen + 🔔 `DRINGEND`-Badge oben in der Bubble
  - **Timestamp** (Uhrzeit HH:MM) in der Meta-Zeile der Bubble
  - **Lesestatus für eigene Nachrichten:** `✓` (gesendet) / `✓✓` grün (gelesen vom Büro)
- **Auto-Scroll** auf neueste Nachricht beim Öffnen und bei neuen Nachrichten
- **Auto-mark-as-read:** Eingehende Nachrichten werden nach 1,2 Sek als gelesen markiert (Firebase `gelesen: true, gelesen_am: <timestamp>`)
- **Empty-State:** 📬-Icon + "Noch keine Nachrichten" + Erklärtext wenn Chat leer
- **Input-Stub unten:** Disabled-Textfeld + grauer Senden-Button + Hinweis "Senden folgt in Baustein 5"

### Übersetzungs-Anzeige (WICHTIG)

Der Chat spielt automatisch zwei Rollen je nach Nachricht:

1. **Nachricht ist in der UI-Sprache des Nutzers** (z.B. MA hat DE eingestellt, Büro schickt DE) → zeige nur den Originaltext, kein Toggle.

2. **Nachricht ist in fremder Sprache und Übersetzung existiert** (Cloud Function hat bereits übersetzt → `text_uebersetzt[ma-sprache]` gefüllt) → zeige die Übersetzung, darunter ein kleiner Link "Original anzeigen". Tap öffnet den Original-Text gestrichelt-abgetrennt.

3. **Nachricht in fremder Sprache, Übersetzung LÄUFT NOCH** (typisch die ersten 1–3 Sekunden nach Senden) → zeige grauen kursiven Platzhalter "Übersetze ..." statt des Texts. Sobald Firebase die Übersetzung schreibt, wechselt die Bubble automatisch (Live-Listener).

---

## Was geändert wurde

| Datei | vorher (B3) | nachher (B4) | Delta |
|---|---|---|---|
| `index.html` | 5.009 Zeilen | 5.574 Zeilen | +565 Zeilen |

**Keine Änderungen** an: `js/tw-ma-firebase.js` (die Chat-API ist seit Baustein 1 live), Design-Basis, bestehenden Komponenten.

### Aufschlüsselung

| Bereich | Zeilen |
|---|---|
| UI_LABELS (14 neue Keys × 7 Sprachen) | ~15 |
| CSS-Regeln (23 Klassen: Header, Thread, Bubbles, Trenner, Empty, Input-Stub) | ~230 |
| React-Komponenten (5 Stück: Modul, Header, Empty, Thread, Bubble, InputStub) + Helper | ~290 |
| Platzhalter-Replace + Version-Bump | ~5 |

### Neue Firebase-Writes

Pro eingehender Büro-Nachricht wird nach 1,2s ein Update gepusht:
```
/chats/{ma-id}/{nachricht-id}/
    gelesen:    true              ← NEU
    gelesen_am: 1745324567890     ← NEU
```

Pro Tab-Öffnung-Batch nur einmal (die `useEffect`-Dependency ist `nachrichten`, nicht `count`). Das Büro sieht den `✓✓` grünen Doppel-Check also live, sobald der Mitarbeiter den Tab offen hatte.

---

## Testen

### Voraussetzung: Mindestens eine Test-Nachricht vom Büro

Bevor man den Chat testet, muss das Büro mindestens eine Nachricht geschickt haben (oder man legt manuell eine in Firebase an):

```
/chats/{ma-id}/{auto-id}/
    von:              "buero"
    absender_name:    "Thomas"
    text_original:    "Guten Morgen Ivan, bitte morgen 7 Uhr starten."
    sprache_original: "de"
    timestamp:        1745324567890
    gelesen:          false
    dringend:         false
```

### Test 1: Empty-State

1. MA-ID ohne Chat-Verlauf → Tab "Nachrichten" öffnen
2. **Erwartung:**
   - Header sichtbar: 💬 "Chat mit dem Büro" (ohne Ungelesen-Badge)
   - Mitte: 📬 "Noch keine Nachrichten" + Erklärtext
   - Input-Zeile unten disabled, Hinweis "Senden folgt in Baustein 5"

### Test 2: Eingehende Büro-Nachricht live empfangen

1. Tab "Nachrichten" offen halten
2. **In der Master-App:** NACHRICHTEN → Chat → diesen MA → "Hallo Test" senden
3. **Erwartung Baustellen-App (ohne Reload):**
   - Innerhalb ~1s erscheint die Nachricht links als graue Bubble
   - Absender-Name "Thomas" oben in Rot
   - Timestamp unten rechts in der Bubble
   - Header zeigt jetzt Ungelesen-Badge "1"
4. Nach ~1,2s:
   - Badge verschwindet (Nachricht wurde automatisch als gelesen markiert)
   - In der Master-App: bei dieser Nachricht erscheint `gelesen: true` bzw. grüner Doppel-Check
5. Firebase-Console prüfen: `/chats/{ma-id}/{nachricht-id}/gelesen === true`

### Test 3: Dringend-Markierung

1. In der Master-App: Nachricht mit `dringend: true` senden (🔔-Button "DRINGEND senden")
2. **Erwartung:**
   - Bubble hat zusätzlich einen roten 2px-Rahmen + roten Schatten
   - Oben in der Bubble: rotes Badge mit 🔔 und "DRINGEND" (lokalisiert)

### Test 4: Datum-Trenner

1. Nachrichten über mehrere Tage anlegen (z.B. manuell in Firebase):
   - Eine Nachricht von vor 3 Tagen
   - Eine von gestern
   - Eine von heute früh
   - Eine von heute vor 10 Minuten
2. **Erwartung:**
   - "Montag" / "Mittwoch" (je nach Wochentag) als Trenner vor der ältesten
   - "Gestern" vor der mittleren
   - "Heute" vor den beiden aktuellen
3. Für eine Nachricht älter als 7 Tage: Trenner zeigt "N. Monat Jahr" (z.B. "15. April 2026")

### Test 5: Übersetzungs-Anzeige

**Voraussetzung:** Cloud Function für Übersetzung ist NICHT deployed (sonst würde die Nachricht schon vorübersetzt ankommen)

1. MA-Sprache auf **EN** stellen
2. In der Master-App eine deutsche Nachricht senden
3. **Erwartung (ohne Cloud Function):**
   - Bubble zeigt grauen kursiven Text "Translating ..." (englische Version)
   - Kein Original-Text sichtbar
   - Wenn man manuell in Firebase `text_uebersetzt.en: "Hello test"` setzt → Bubble wechselt live zur Übersetzung + "Show original"-Toggle erscheint

**Mit deployed Cloud Function:**

1. Deutsche Nachricht "Guten Morgen" → Bubble zeigt nach 1-3s den englischen Text "Good morning" + kleiner Toggle "Show original"
2. Tap auf Toggle → Original "Guten Morgen" erscheint darunter, gestrichelt abgetrennt
3. Nochmal tippen → Original wird versteckt, Toggle wird wieder "Show original"

### Test 6: Sprach-Wechsel mit offenem Chat

1. Chat offen, mehrere Nachrichten im Thread
2. Sprach-Pill wechseln von DE zu PL
3. **Erwartung:**
   - Header-Titel, Empty-Texte, Badge-Label, Datum-Trenner alle auf Polnisch
   - Nachrichten-Texte: falls `text_uebersetzt.pl` existiert → polnische Version; sonst Original
   - Absender-Name bleibt wie gespeichert (z.B. "Thomas")

### Test 7: Lesestatus für eigene Nachrichten (Vorschau)

> Diese Nachrichten gibt's erst wenn Baustein 5 live ist. Für Test 7 manuell eine ausgehende Nachricht in Firebase anlegen:

```
/chats/{ma-id}/{auto-id}/
    von:              "ma"
    absender_name:    "Ivan"
    text_original:    "Bin unterwegs zur Baustelle"
    sprache_original: "de"
    timestamp:        <heute>
    gelesen:          false
    dringend:         false
```

1. **Erwartung:**
   - Bubble rechts, blauer Farbverlauf
   - Keine Absender-Zeile (nur bei Büro-Nachrichten)
   - Timestamp unten + einzelner grauer `✓` (gesendet, nicht gelesen)
2. In Firebase manuell `gelesen: true` setzen
3. **Erwartung:** `✓` wechselt zu grünem `✓✓`

### Test 8: Auto-Scroll

1. 20+ Testnachrichten anlegen, Tab öffnen
2. **Erwartung:** Thread scrollt automatisch ganz nach unten, neueste Nachricht sichtbar
3. Hoch scrollen, manuell bei älterer Nachricht stehen bleiben
4. Neue Büro-Nachricht kommt rein
5. **Erwartung:** Thread springt wieder ans Ende (bei jedem neuen Eintrag)

---

## Was die Master-App-Seite sieht

1. Sobald der MA den Tab öffnet und das Auto-Read-Interval läuft, bekommt jede vorher ungelesene Büro-Nachricht `gelesen: true` gesetzt
2. Das Büro-UI zeigt grüne Doppel-Checks (siehe Etappe-4.1-Baustein-6 `MaChatThread`)
3. Falls der MA den Chat gar nicht öffnet, bleiben Nachrichten `gelesen: false` — das Büro sieht den Unterschied (grauer vs. grüner Check)

---

## Troubleshooting

### Chat bleibt leer, obwohl Nachrichten in Firebase existieren

1. Konsole: `await TWMaFirebase.getMeineMaId()` liefert die richtige ID?
2. In Firebase: `/chats/{diese-id}/` — steht der `/{auto-id}/`-Knoten dort?
3. Jede Nachricht braucht zwingend ein `timestamp`-Feld (Number, Millisekunden). Ohne werden sie ignoriert (Schutz gegen Meta-Knoten wie `angelegt`).
4. Security Rules: `/chats/{ma-id}/` braucht read für `auth.uid === ma_id` oder Mapping via `/users/{uid}/ma_id`

### Ungelesen-Badge verschwindet zu früh / zu spät

- Nach 1,2s werden alle sichtbaren Büro-Nachrichten als gelesen markiert. Das ist bewusst schnell, damit der MA die Zahl nicht zwischen Tabs "mitnimmt".
- Wenn der MA den Tab verlässt bevor die 1,2s um sind, wird das Timer-Cleanup ausgelöst und die Nachrichten bleiben ungelesen (korrekt)

### "Übersetze ..." bleibt ewig stehen

- Cloud Function ist nicht deployed, das ist Etappe-4.1-Option. Entweder deployen (siehe Etappe-4.1-Protokoll 9.1) oder eine UI-Sprache wählen, in der die Nachrichten ankommen → dann braucht's keine Übersetzung
- Workaround für Test: manuell in Firebase `text_uebersetzt.{lang}: "text"` setzen

### Bubbles zeigen nicht links/rechts wie erwartet

- `von: "buero"` → links, grau. `von: "ma"` → rechts, blau.
- Wenn `von` was anderes ist (z.B. `undefined`): als Büro-Nachricht gerendert (Fallback)

### Dringend-Badge erscheint nicht

- `dringend` muss exakt `true` (boolean) sein, nicht `1`, nicht `"true"`

---

## Was dieser Baustein NICHT macht (Absicht)

- ❌ Kein Senden — Baustein 5 aktiviert die Input-Zeile + Senden-Logik + Dringend-Toggle
- ❌ Kein Nachrichten-Löschen (kommt nicht geplant — Historie ist revisionssicher)
- ❌ Keine Volltextsuche im Chat (V2)
- ❌ Keine Datei-/Bild-Anhänge (kommen mit Fotos-Modul Etappe 6)
- ❌ Keine Sprach-Nachrichten (Audio-Diktat kommt "später" laut Skill 4.1)
- ❌ Kein FCM-Push (Baustein 6)

---

## Deployment

**Nur EINE Datei** im Repo tauschen:

1. `index.html` — ersetzen

`js/tw-ma-firebase.js` bleibt unberührt (Stand Baustein 1).

Nach Deploy:
1. App beenden, Cache leeren, neu öffnen
2. Unten: **`v1.0.0-etappe5-b4-nachrichten-ui`**
3. Tab "Nachrichten" → Chat-UI sichtbar (leer oder mit Historie)
4. Testmatrix durchlaufen

Wenn alles grün → `weiter` für **Baustein 5** (Chat-Senden + Dringend-Toggle).

---

## Was als nächstes kommt (Baustein 5)

- Input-Zeile unten wird aktiviert (kein disabled mehr)
- Autoresize-Textarea (wächst mit Zeilen, max 4 Zeilen)
- Senden-Button grün, Click schreibt nach `/chats/{ma-id}/{auto-id}/` via `sendeChatNachricht()`
- **Dringend-Toggle:** Halte-Press auf Senden-Button → rotes Badge erscheint, bei Release wird Nachricht mit `dringend: true` gesendet (Cloud Function löst dann FCM-Push ans Büro aus)
- Optimistische UI: Bubble erscheint sofort rechts mit grauem `✓` (Senden), wird durch Server-Echo ersetzt
- Fehlerbehandlung: Wenn Senden fehlschlägt → roter Toast, Bubble bleibt mit ⚠-Icon stehen, Retry-Button
- Sprach-Info: Nachricht wird in der aktuellen UI-Sprache des MA gespeichert (`sprache_original`), Cloud Function übersetzt nach DE für das Büro

---

*TW Baustellen-App · Etappe 5 · Baustein 4 · v1.0.0-etappe5-b4-nachrichten-ui · 22.04.2026*
