# Etappe 5 · Baustein 3 — Tages-Modal zum Eintragen/Bearbeiten

**Datum:** 22.04.2026
**Status:** Geliefert, Babel-validiert, deploy-bereit
**Voraussetzung:** Baustein 1 + 2 deployed (`v1.0.0-etappe5-b2-kalender-ui` läuft)

---

## Was dieser Baustein bringt

Der Tab **"Kalender"** wird vom Read-Only-Display zum **vollfunktionalen Eingabe-Workspace**. Tap auf einen Tag öffnet das Bearbeiten-Modal — der Mitarbeiter kann seinen Status, seine Stunden, die Baustelle und Sonderheiten eintragen. Alles landet live in Firebase unter `/kalender/{ma-id}/{jahr}/{datum}/` und ist für das Büro sofort sichtbar.

### Sichtbar neu im Tab "Kalender"

- **Tap auf einen Tag** öffnet das Modal (statt dem Platzhalter-Alert aus Baustein 2)
- **Datum-Header** oben im Modal: "Freitag · 1. Mai 2026" (vollständig 7-sprachig)
- **Status-Auswahl** als 4 Karten-Buttons (2×2-Grid), der aktive ist rot umrandet:
  - 🟢 Anwesend
  - 🔵 Urlaub
  - 🔴 Krank
  - ⚪ Frei
- **Stunden-Picker** (erscheint nur bei "Anwesend"):
  - `−` und `+` Buttons, 15-Min-Schritte, 0–24h Bereich
  - Anzeige: `8,00 h` (lokalisiert mit Komma)
- **Baustellen-Dropdown** (erscheint nur bei "Anwesend"):
  - Liste aus `ladeAktiveBaustellen()`, alphabetisch sortiert
  - Erster Eintrag: "— bitte wählen —"
  - Wenn keine aktiven Baustellen existieren: grauer Hinweis-Kasten statt leeres Dropdown
- **Sonderheiten-Textarea** (immer sichtbar, optional):
  - 90px hoch, scrollbar, mit Platzhalter-Text
  - **🎤-Button** oben rechts in der Textarea für Spracheingabe via Web Speech API
- **Action-Bar unten** (sticky):
  - `ABBRECHEN` (grau, links)
  - `LÖSCHEN` (rot, erscheint nur wenn ein Eintrag existiert)
  - `SPEICHERN` (grün, rechts, groß)

### Sprach-Eingabe (Diktat)

- Tap auf 🎤 → Button pulsiert rot, Info-Toast "Spreche jetzt ..."
- Erkannter Text wird **ans Ende** der Sonderheiten angehängt (nicht überschrieben)
- Spracheingabe-Sprache folgt der UI-Sprache: de → `de-DE`, cs → `cs-CZ`, sk → `sk-SK`, pl → `pl-PL`, en → `en-US`, ro → `ro-RO`, uk → `uk-UA`
- Funktioniert auf Chrome-basierten Browsern und Safari. Firefox zeigt Fehler-Toast "Mikrofon nicht verfügbar"
- Kein Backend-Call — läuft nativ im Browser, kostet keine API-Credits

### UX-Details

- **Slide-Up-Animation** beim Öffnen (von unten)
- **Tap auf Hintergrund** (Overlay) schließt das Modal
- **ESC-Taste** schließt das Modal
- **X-Button** oben rechts im Header schließt das Modal
- **Erfolgs-Toast** "Gespeichert" erscheint für 700ms, dann schließt sich das Modal automatisch
- **Fehler-Toast** "Speichern fehlgeschlagen" bleibt stehen bis neuer Versuch (bei Netzwerk-Ausfall)
- **Bestätigungs-Dialog** beim Löschen ("Eintrag wirklich löschen?")

---

## Was geändert wurde

| Datei | vorher (B2) | nachher (B3) | Delta |
|---|---|---|---|
| `index.html` | 4.371 Zeilen | 5.009 Zeilen | +638 Zeilen |

**Keine Änderungen** an anderen Dateien (`js/tw-ma-firebase.js` aus Baustein 1 bleibt unverändert).

### Aufschlüsselung der 638 neuen Zeilen

| Bereich | Zeilen | Ort |
|---|---|---|
| UI_LABELS (18 neue Keys × 7 Sprachen) | ~22 | Ende UI_LABELS-Block |
| CSS-Regeln (20+ Klassen: Overlay, Modal, Radio, Picker, Textarea) | ~225 | vor `</style>` |
| `MAKalenderTagesModal` + Helper-Funktionen | ~330 | nach `MAKalenderLegende` |
| Anpassungen `MAKalenderModul` (Modal-State, Handler, Render) | ~40 | bestehende Komponente |
| Anpassungen `MAKalenderGrid` + `MAKalenderTag` (Prop-Chain) | ~20 | bestehende Komponenten |

### Neue Firebase-Writes

Pro Speichervorgang geht ein Update nach:
```
/kalender/{ma-id}/{jahr}/{datum}/
    status:             "anwesend"|"urlaub"|"krank"|"frei"
    stunden:            8.25                  (nur bei "anwesend")
    baustelle_id:       "meyer-bad-nisterau"  (nur bei "anwesend", optional)
    sonderheiten:       "Estrich war feucht"  (optional)
    eingetragen_von:    "ma"                  (automatisch)
    eingetragen_am:     1745324567890         (automatisch, nur beim ersten Anlegen)
    geaendert_am:       1745324567890         (automatisch, bei jedem Save)
```

Löschen entfernt den gesamten Tages-Knoten.

---

## Testen

### Voraussetzung: Baustein 2 muss laufen

In der Konsole prüfen:
```javascript
typeof TWMaFirebase.schreibeKalenderEintrag === 'function'  // muss true sein
```

### Test 1: Modal öffnen/schließen

1. Kalender öffnen, auf beliebigen Tag (im aktuellen Monat) tippen
2. **Erwartung:** Modal fährt von unten hoch, zeigt das lokalisierte Datum
3. **Test Schließen:**
   - X-Button oben rechts → Modal schließt
   - Klick außerhalb Modal (Overlay) → Modal schließt
   - ESC-Taste (bei angeschlossener Tastatur) → Modal schließt
   - ABBRECHEN-Button → Modal schließt
4. Tap auf ausgegrauten Tag (Vor/Nachmonat) → **keine Reaktion** (korrekt)

### Test 2: Neuer Eintrag "Anwesend"

1. Modal öffnen auf leeren Tag
2. Default: Status `anwesend` ist aktiv, Stunden `8,00 h`, Baustelle leer
3. Stunden-Picker testen:
   - `+` 2× → `8,50 h`
   - `−` 1× → `8,25 h`
   - `−` viele Male → stoppt bei `0,00 h`, Button wird grau
4. Baustellen-Dropdown öffnen → alphabetisch sortierte Liste
5. Eine Baustelle wählen
6. Sonderheiten: "Estrich war feucht, 1h Verzögerung"
7. **SPEICHERN** tippen
8. **Erwartung:**
   - Grüner Toast "Gespeichert"
   - Modal schließt nach ~700ms
   - Im Kalender: Grüner `✓`-Kreis am getesteten Tag (Live-Listener hat sofort aktualisiert)
9. Firebase-Console prüfen: `/kalender/{ma-id}/2026/2026-05-XX/` enthält alle Felder inkl. `eingetragen_von: "ma"`

### Test 3: Bestehenden Eintrag bearbeiten

1. Auf den Tag von Test 2 erneut tippen
2. **Erwartung:** Modal öffnet mit den vorher gespeicherten Werten (Status, Stunden, Baustelle, Sonderheiten)
3. Status auf `krank` wechseln
4. **Erwartung:** Stunden-Picker und Baustellen-Dropdown verschwinden (nicht relevant bei krank)
5. Speichern
6. **Erwartung:** Glyph am Tag wechselt von grünem `✓` zu rotem `K`
7. Im Firebase-Eintrag: `geaendert_am` hat einen neuen Timestamp, `eingetragen_am` bleibt der alte

### Test 4: Eintrag löschen

1. Auf denselben Tag tippen — Modal öffnet mit den aktuellen Werten
2. **LÖSCHEN**-Button tippen (rot, links neben Speichern)
3. Browser-Dialog: "Eintrag wirklich löschen?" → OK
4. **Erwartung:**
   - Modal schließt
   - Im Kalender: Glyph verschwindet
   - In Firebase: Tages-Knoten ist weg

### Test 5: Sprach-Eingabe (Diktat)

> **Voraussetzung:** Chrome auf Android, Chrome auf Desktop, oder Safari (iOS 14.5+). Firefox unterstützt Web Speech API nicht.

1. Modal öffnen, auf 🎤-Button in der Textarea tippen
2. Browser fragt einmalig nach Mikrofon-Erlaubnis → erlauben
3. **Erwartung:** Button pulsiert rot, Info-Toast "Spreche jetzt ..."
4. Kurzer Satz sprechen, z.B. "Estrich war feucht"
5. **Erwartung:**
   - Text erscheint in der Textarea
   - Mikrofon-Button hört auf zu pulsieren
   - Info-Toast verschwindet
6. Nochmal tippen, "zweiter Satz" sprechen → wird ANS ENDE angehängt (mit Leerzeichen), nicht überschrieben
7. Bei Firefox: Fehler-Toast "Mikrofon nicht verfügbar" erscheint

### Test 6: Sprach-Wechsel im Modal

1. Modal geöffnet halten, in anderer App-Ecke die Sprache wechseln (falls möglich) — Achtung: Sprach-Pill ist in der MainApp, nicht im Modal, also muss man das Modal schließen, Sprache wechseln, Modal neu öffnen
2. Alternativ: Vor Öffnen auf EN/CS/PL stellen
3. Modal öffnen
4. **Erwartung:** Alle Labels übersetzt — Status-Buttons, Stunden, Baustelle, Sonderheiten, Buttons (Speichern/Löschen/Abbrechen), Datum-Header (Wochentag + Monatsname)
5. Spracheingabe nutzt korrekte Speech-API-Sprache (z.B. `pl-PL` bei Polnisch)

### Test 7: Fehler-Pfade

- **Kein Internet beim Speichern:** Roter Toast "Speichern fehlgeschlagen", Modal bleibt offen, Stunden/Baustelle bleiben erhalten → nochmal Speichern funktioniert wenn Netz zurück
- **Baustellen-Dropdown leer:** Wenn `/aktive_baustellen/` nichts für den User enthält → graues Feld "Keine aktiven Baustellen" statt Dropdown
- **Datum in der Zukunft:** Funktioniert wie heute — Mitarbeiter kann vorausplanen (z.B. geplanten Urlaub eintragen)

---

## Was die Master-App-Seite sieht

Sobald der Mitarbeiter speichert, erscheint der Eintrag:

1. **In seinem eigenen MA-Kalender** (NACHRICHTEN → Kalender → diesen MA wählen) mit `eingetragen_von: "ma"` als Audit-Hinweis
2. **Im Hauptkalender** — Status-Glyph an der entsprechenden MA-Zeile + Tagesspalte
3. **In der Summen-Auswertung** für die Lohnabrechnung (falls das Büro einen monatlichen Report aufruft)

Wenn das Büro parallel den gleichen Tag editiert, gewinnt der letzte Schreibzugriff (Last-Write-Wins, konform zu Firebase Realtime DB-Verhalten). Das ist meistens kein Problem, weil typischerweise der MA morgens/abends selbst einträgt und das Büro nur korrigiert.

---

## Troubleshooting

### Modal öffnet sich nicht

1. Konsole öffnen — Fehler wie "MAKalenderTagesModal is not defined"? → Babel-Transform hat etwas verschluckt, harter Reload (Strg+Shift+R)
2. Tap auf ausgegrautem Tag wirkt nicht → **korrekt**, Vor-/Nachmonatstage sind gesperrt

### Speichern hängt

1. Konsole: Fehlermeldung `PERMISSION_DENIED: Permission denied` → Security Rules für `/kalender/{ma-id}/` fehlen oder sind zu streng. Siehe Baustein-2-LIESMICH Abschnitt "Security Rules"
2. `FIREBASE_NOT_AUTHENTICATED` → der Anonymous-Auth-Sign-In ist nicht durchgelaufen. App neu starten.

### Spracheingabe startet nicht

1. Firefox? Dann ist Web Speech API nicht unterstützt — **kein Fix**, ist Browser-Limit
2. HTTPS? Spracheingabe läuft **nur** auf HTTPS oder localhost. GitHub Pages ist HTTPS ✓
3. Erste Nutzung: Mikrofon-Berechtigung wurde abgelehnt → in Browser-Einstellungen zurücksetzen
4. iOS Safari: Funktioniert, braucht aber iOS 14.5+ und Safari 14.1+

### Stunden zeigen "8,0000000001 h" o.ä. (Float-Bug)

Shouldn't happen — der Code snappt alle Werte auf 15-Min-Raster (`Math.round(neu * 4) / 4`). Falls doch: Screenshot an mich, ist ein konkreter Bug.

### Wochenend-Tag lässt sich nicht als "anwesend" speichern

Das ist keine Einschränkung — Samstage/Sonntage lassen sich genauso eintragen wie Werktage. Rote Färbung ist nur visueller Hinweis, nicht funktional.

---

## Was dieser Baustein NICHT macht (Absicht)

- ❌ Keine Audio-Diktat-Aufnahme (nur Text-Transkription) — Audio-Upload kommt laut Skill 4.1 "später"
- ❌ Keine Validierung "Kein Tag in der Zukunft" — bewusst offen (Urlaub vorplanen)
- ❌ Keine Konflikt-Warnung wenn Büro parallel editiert — Last-Write-Wins
- ❌ Keine Bulk-Eingabe (mehrere Tage gleichzeitig)
- ❌ Kein Offline-Queue — Speichern braucht Netzverbindung (Offline-Support kommt mit IndexedDB in Baustein 6 / Etappe 6)

---

## Deployment

**Nur EINE Datei** austauschen in `phoenix180862-cloud/Baustellen-Mitarbeiterapp`:

1. `index.html` — ersetzen

`js/tw-ma-firebase.js` bleibt UNBERÜHRT (ist Stand Baustein 1).

Nach dem Deploy:
1. App beenden, Cache leeren (Strg+Shift+R), neu öffnen
2. Unten sollte **`v1.0.0-etappe5-b3-tages-modal`** stehen
3. Tab "Kalender" → heutigen Tag antippen → Modal öffnet sich
4. Testen gemäß Testreihe oben

Wenn alles grün → `weiter` für **Baustein 4** (Nachrichten-Modul: WhatsApp-Chat Gerüst).

---

## Was als nächstes kommt (Baustein 4)

- Tab "Nachrichten" wird vom `ModulPlatzhalter` zum echten WhatsApp-Style-Chat-Thread
- Live-Listener auf `/chats/{ma-id}/` — empfangene Nachrichten chronologisch sortiert
- Eingehende (vom Büro) links grau, ausgehende (eigene) rechts blau
- Timestamp + Lesestatus-Häkchen pro Nachricht
- Dringend-Markierung (rotes Glocken-Icon + roter Rahmen) für Nachrichten mit `dringend: true`
- **Noch kein** Senden (Baustein 5), noch keine Übersetzungs-Anzeige (Baustein 5)

---

*TW Baustellen-App · Etappe 5 · Baustein 3 · v1.0.0-etappe5-b3-tages-modal · 22.04.2026*
