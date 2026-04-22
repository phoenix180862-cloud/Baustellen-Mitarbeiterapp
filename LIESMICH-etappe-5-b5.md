# Etappe 5 · Baustein 5 — Chat-Senden + Dringend-Toggle

**Datum:** 22.04.2026
**Status:** Geliefert, Babel-validiert, deploy-bereit
**Voraussetzung:** Bausteine 1–4 deployed (`v1.0.0-etappe5-b4-nachrichten-ui` läuft)

---

## Was dieser Baustein bringt

Der Chat wird **bidirektional**. Ab sofort kann der Mitarbeiter nicht nur empfangen, sondern auch selbst schreiben — mit Auto-Resize-Textarea, Spracheingabe, Dringend-Toggle und sauberer Fehlerbehandlung. Die App schließt damit den Kommunikations-Loop zwischen Baustelle und Büro. **Die Feldkommunikation ist jetzt produktiv.**

### Sichtbar neu in der Input-Zeile

- **Autoresize-Textarea** statt einzeiligem Input — wächst mit dem Text bis max. 4 Zeilen, dann scrollbar
- **Senden-Button** (blauer Kreis mit Pfeil) — wird aktiv sobald Text eingegeben ist und eine ma_id verfügbar ist
- **Dringend-Toggle** links vom Input (🔔 Glocken-Icon):
  - Grau = normaler Sende-Modus
  - Rot + Pulsieren = nächste Nachricht wird als DRINGEND markiert
  - Oben im Chat erscheint ein roter Banner "Nächste Nachricht wird als DRINGEND gesendet"
  - Input-Zeile bekommt rötlichen Hintergrund
  - Senden-Button wechselt auf rot-gradient
  - Nach erfolgreichem Senden: Toggle springt automatisch zurück auf grau
- **🎤-Mikrofon-Button** in der Textarea (rechts unten) — Web Speech API, Text wird ans Ende angehängt, 7-sprachig wie im Kalender-Modal
- **Ctrl+Enter / Cmd+Enter** sendet (Desktop-Shortcut); normales Enter macht Zeilenumbruch (Mobile-freundlich)
- **Sende-Indikator:** Während Firebase-Write läuft, zeigt der Placeholder "Sende ..." und Input + Buttons sind disabled

### Sichtbar neu bei Fehlern

- Wenn Firebase-Write fehlschlägt: **roter Banner oberhalb der Input-Zeile**
  - ⚠ + Fehler-Text "Senden fehlgeschlagen. Nochmal versuchen?"
  - `↻` Retry-Button: sendet die Nachricht erneut
  - `×` Schließen-Button: versteckt Banner, Text bleibt im Feld
- Der eingegebene Text + Dringend-Flag bleiben erhalten, nichts geht verloren

### Was beim Senden passiert

1. **Click Senden** → `sendeChatNachricht(maId, absenderName, text, sprache, dringend)` wird gerufen
2. Firebase schreibt nach `/chats/{ma-id}/{auto-id}/` mit:
   ```
   von:              "ma"
   absender_name:    "Ivan"           ← aus /mitarbeiter/{ma-id}/name oder /users/{uid}/name
   text_original:    "Bin unterwegs"
   sprache_original: "de"             ← aktuelle UI-Sprache
   text_uebersetzt:  null             ← Cloud Function füllt danach
   timestamp:        1745324567890
   gelesen:          false
   dringend:         true             ← nur wenn Toggle aktiv war
   ```
3. Cloud Function (falls deployed) übersetzt nach allen Zielsprachen → Büro sieht automatisch DE
4. Bei `dringend: true`: Cloud Function löst zusätzlich FCM-Push ans Büro aus (laut Etappe-4.1-Protokoll)
5. **Live-Listener** zeigt die Nachricht sofort rechts als blaue Bubble mit `✓` (gesendet)
6. Sobald Büro den Chat öffnet → `gelesen: true` → `✓✓` wird grün

---

## Was geändert wurde

| Datei | vorher (B4) | nachher (B5) | Delta |
|---|---|---|---|
| `index.html` | 5.574 Zeilen | 5.863 Zeilen | +289 Zeilen |

`js/tw-ma-firebase.js` bleibt unberührt (die Senden-API ist seit Baustein 1 da).

### Aufschlüsselung

| Bereich | Zeilen |
|---|---|
| UI_LABELS (5 neue Keys × 7 Sprachen) | ~6 |
| CSS-Anpassungen + neue Regeln (Dringend-Toggle, Fehler-Banner, Auto-Resize) | ~110 |
| `MANachrichtenInput` (komplett neu, ersetzt alten `InputStub`) | ~165 |
| `MANachrichtenModul` Anpassung (`ladeMeinenMitarbeiter` statt nur `getMeineMaId`) | ~8 |

### Komponenten-Map jetzt

```
MANachrichtenModul
├── MANachrichtenHeader  (Icon + Titel + Ungelesen-Badge)
├── MANachrichtenEmpty   (wenn Chat leer)
├── MAChatThread         (Liste mit Datum-Trennern)
│   └── MAChatBubble     (Bubble Büro oder MA)
└── MANachrichtenInput   ← NEU (Baustein 5)
    ├── Fehler-Banner    (optional, bei Senden-Fehler)
    ├── Dringend-Banner  (optional, wenn Toggle aktiv)
    └── Input-Row
        ├── Dringend-Toggle (🔔)
        ├── Textarea + 🎤-Mikro
        └── Senden-Button (➤)
```

---

## Testen

### Test 1: Einfaches Senden

1. Tab "Nachrichten" öffnen
2. In die Textarea "Hallo Test" tippen
3. **Erwartung:** Senden-Button wird blau aktiv (vorher opacity 0.35 grau)
4. Senden-Button tippen
5. **Erwartung:**
   - Placeholder wechselt kurz auf "Sende ..."
   - Nach ~500ms erscheint eine blaue Bubble rechts mit "Hallo Test"
   - Textarea leer, Input wieder fokussierbar
   - Timestamp + einzelner `✓` in der Bubble-Meta
6. Firebase-Console: `/chats/{ma-id}/{neue-id}/` enthält `von: "ma"`, `gelesen: false`, `dringend: false`

### Test 2: Auto-Resize Textarea

1. Längeren Mehrzeiler tippen (4+ Zeilen)
2. **Erwartung:**
   - Textarea wächst mit — 1, 2, 3, 4 Zeilen sichtbar
   - Ab ~4 Zeilen (104px) hört sie auf zu wachsen, innen scrollbar
   - Senden-Button bleibt am unteren Rand ausgerichtet

### Test 3: Dringend-Toggle

1. Glocken-Toggle (links vom Input) tippen
2. **Erwartung:**
   - Toggle wird rot + pulsiert
   - Input-Zeile bekommt rötlichen Hintergrund
   - Darüber erscheint roter Banner "🔔 Nächste Nachricht wird als DRINGEND gesendet"
   - Senden-Button wechselt zu rot-gradient
3. "Achtung dringend" tippen, senden
4. **Erwartung:**
   - Bubble erscheint rechts mit rotem 2px-Rahmen + 🔔 DRINGEND-Badge oben
   - Dringend-Toggle springt automatisch zurück auf grau (für die nächste Nachricht)
   - Banner verschwindet, Input-Hintergrund wieder normal
5. Firebase: `dringend: true` gesetzt
6. **In der Master-App:** Nachricht erscheint mit rotem Rahmen, Büro sollte FCM-Push bekommen (falls Cloud Function deployed)

### Test 4: Spracheingabe (Diktat)

1. 🎤-Button in der Textarea tippen
2. Browser fragt Mikrofon-Erlaubnis → erlauben
3. **Erwartung:** Button pulsiert rot
4. Satz sprechen "Bin auf dem Weg zur Baustelle"
5. **Erwartung:**
   - Text erscheint in der Textarea
   - Mikrofon-Button hört auf zu pulsieren
6. Nochmal 🎤 + "komme in zehn Minuten" → wird ans Ende angehängt (mit Leerzeichen)
7. Senden

### Test 5: Ctrl+Enter Desktop-Shortcut

1. Im Browser (Desktop): Text tippen
2. Ctrl+Enter (Win/Linux) bzw. Cmd+Enter (macOS)
3. **Erwartung:** Nachricht wird gesendet (wie Click auf Senden-Button)
4. Normales Enter → macht Zeilenumbruch, sendet NICHT (wichtig auf Handy)

### Test 6: Fehler-Handling (Offline)

1. Flugmodus an
2. Text tippen, senden
3. **Erwartung:**
   - Sende-Indikator kurz sichtbar
   - Nach Timeout (~10s, Firebase-Default): roter Banner "Senden fehlgeschlagen..."
   - `↻`-Button zum Retry, `×`-Button zum Ausblenden
   - Text bleibt im Feld
4. Flugmodus aus
5. `↻`-Button tippen
6. **Erwartung:** Nachricht geht durch, Banner verschwindet

### Test 7: Langsame Verbindung — Button-Spam verhindern

1. Dummy-Nachricht in Textarea
2. Senden-Button schnell 3× hintereinander tippen
3. **Erwartung:**
   - Nach erstem Click: Button disabled (grau)
   - Weitere Clicks wirkungslos
   - Genau EINE Nachricht erscheint am Ende

### Test 8: Sprache und Nachrichten-Metadaten

1. UI-Sprache auf **PL** wechseln
2. Nachricht tippen und senden
3. Firebase prüfen: `sprache_original: "pl"` ✓
4. In der Master-App (Büro) Tab "Nachrichten" → Chat → diesen MA
5. **Erwartung:**
   - Nachricht in Original (PL) sichtbar
   - Unten/drüber die deutsche Übersetzung (falls Cloud Function deployed)
   - Wenn Cloud Function fehlt: nur Original, kein Übersetzungs-Toggle auf Büro-Seite

### Test 9: Leere Nachricht absenden verhindern

1. Input leer oder nur Leerzeichen
2. **Erwartung:** Senden-Button bleibt disabled
3. Mit Ctrl+Enter: nichts passiert
4. Nach einem Zeichen: Button wird aktiv

### Test 10: Mehrere Nachrichten in Folge

1. "Erste Nachricht" → senden
2. "Zweite direkt danach" → senden
3. "Dritte" → senden
4. **Erwartung:** Alle drei erscheinen chronologisch rechts im Thread, gruppiert unter heutigem Datum-Trenner
5. Thread scrollt automatisch ganz nach unten

---

## Troubleshooting

### Senden-Button bleibt grau trotz Text

- `maId` noch nicht aufgelöst → Konsole: `await TWMaFirebase.getMeineMaId()` muss einen Wert liefern
- Firebase nicht initialisiert → Konsole zeigt `[TWMaFirebase]`-Log beim App-Start
- Nachricht leer (nur Whitespace) → korrekt, absichtliche Validierung

### Nachricht verschwindet nach Senden, kommt aber nicht als Bubble zurück

- Live-Listener-Problem. Prüfe: `TWMaFirebase.subscribeChat` muss beim Öffnen des Tabs feuern
- Security Rules blockieren Read? → In Firebase Console Regel-Tester: `auth.uid` gegen `/chats/{ma-id}/` lesen erlaubt?

### Dringend-Toggle funktioniert, aber Büro kriegt keinen Push

- Cloud Function für FCM-Push ist nicht deployed → siehe Etappe-4.1-Protokoll Abschnitt 9.2
- `fcm_token` der Büro-Geräte fehlt in Firebase → Baustein 6 (kommt als nächstes) ist dafür zuständig **auf MA-Seite**; für Büro-Push muss die Master-App ihren eigenen Token registriert haben

### Diktat hängt / beendet sich nicht

- Web Speech API Limit: 60s Monolog max. Wenn der User zu lange nicht spricht, beendet sich die Erkennung von selbst (onend feuert)
- Firefox: Web Speech API nicht unterstützt — Fehler-Banner erscheint
- Anderen Browser probieren (Chrome Android, Safari iOS 14.5+)

### Autoresize flackert beim Tippen

Shouldn't happen. Wenn doch: Der useEffect-Trigger reagiert auf `[text]`, nicht auf jeden Keystroke. Sollte smooth sein. Falls flackernd → Screenshot an mich.

---

## Was dieser Baustein NICHT macht (Absicht)

- ❌ Keine Optimistische UI (Bubble erscheint erst nach Firebase-Echo, ~200–500ms Latenz) — bewusst konservativ, einfacher Code, robust bei Offline
- ❌ Keine Nachrichten-Bearbeitung/Löschung (Revision-safe)
- ❌ Keine Typing-Indicators ("Thomas tippt gerade...") — V2
- ❌ Keine Read-Receipts mit Avatar-Stack — V2
- ❌ Keine Datei-Attachments (Fotos kommen mit Etappe 6)
- ❌ Keine Sprach-Nachrichten (Audio-Upload) — laut Skill 4.1 "später"
- ❌ Kein FCM-Push-Empfang auf MA-Seite — Baustein 6

---

## Deployment

**Nur EINE Datei** tauschen:

1. `index.html` — ersetzen

Nach Deploy:
1. App beenden, Cache leeren, neu öffnen
2. Unten: **`v1.0.0-etappe5-b5-chat-senden`**
3. Tab "Nachrichten" → Input-Zeile aktiv, Dringend-Toggle sichtbar
4. Testreihe oben durchlaufen, mindestens Test 1, 3 und 6

Wenn alles grün → `weiter` für **Baustein 6** (FCM-Push-Registration + Ungelesen-Badge im Tab-Icon).

---

## Was als nächstes kommt (Baustein 6)

- **Service Worker Erweiterung** für FCM-Empfang
- **Token-Registration:** beim App-Start fragt die App (einmalig) nach Push-Erlaubnis, holt sich den FCM-Token und schreibt ihn nach `/geraete/{uuid}/fcm_token`
- **Hintergrund-Push:** Auch wenn App geschlossen ist, kommt bei dringender Nachricht eine System-Benachrichtigung aufs Handy
- **Tap auf Notification** öffnet App direkt im Nachrichten-Tab
- **Ungelesen-Badge im Tab-Header:** rote Pille auf dem "Nachrichten"-Tab-Button, wenn ungelesene Büro-Nachrichten existieren
- **Status-Indikator auf Startseite:** "🔔 3 neue Nachrichten" direkt auf der Home-View

---

*TW Baustellen-App · Etappe 5 · Baustein 5 · v1.0.0-etappe5-b5-chat-senden · 22.04.2026*
