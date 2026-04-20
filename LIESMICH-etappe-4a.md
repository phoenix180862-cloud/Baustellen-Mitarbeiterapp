# Etappe 4a — Navigation-Umbau: 2-Ordner-Modell

**Datum:** 20.04.2026
**Status:** Komplett, Babel-validiert, deploy-bereit
**Voraussetzung:** Etappe 3 (Onboarding + PIN) muss deployed und getestet sein

---

## Was diese Etappe bringt

Die App bekommt eine **ruhigere, aufgeräumtere Architektur** — ganz im Sinne der Master-App-Etappe 4.1: Nach dem Login landet der Mitarbeiter auf **einer einzigen Startseite** mit allem Wichtigen im Blick, und zwei großen Ordner-Kacheln führen ihn dorthin, wo er arbeiten will.

**Vorher (6 Tabs):** Start · Baustellen · Kalender · Fotos · Stunden · Nachrichten
**Nachher (2 Ordner):** Baustellen · Nachrichten

Fotos, Kalender und Stunden verschwinden nicht — sie wandern **unter** ihre passenden Ordner:
- **Fotos + Stunden** leben jetzt unter *Baustellen → [Kunde] → [Kategorie]*
- **Kalender + Chat** leben jetzt unter *Nachrichten*

Das ist mobiler, weniger überladen, weniger Tap-Targets auf dem kleinen Display.

---

## Was sichtbar geändert wurde

### Startseite (das schöne Herzstück bleibt erhalten)

- Logo + Firmen-Adresse + Untertitel ✓
- Premium-Uhr-Block ✓
- Sprach-Pill ✓
- BauteamAnimation ✓
- **NEU:** Zwei große Ordner-Kacheln (Baustellen blau, Nachrichten grün)
- Status-Indikator (online/sync/neue Nachrichten) ✓
- Versions-Footer ✓

### Was weg ist

- Die 6-Tab-Navigationsleiste unter dem Header — **komplett entfernt**
- Die Top-Level-Module Kalender, Fotos, Stunden (die leben jetzt als Sub-Views)

### Baustellen-Ordner (neu strukturiert)

Klick auf die Kachel → **Kunden-Liste** mit allen für den MA freigegebenen Baustellen.
Klick auf einen Kunden → **Detail-Seite** mit 5 Sub-Kacheln in fester Reihenfolge (lt. Skill 4.1):

1. 📐 Zeichnungen (blau)
2. 💬 Anweisungen (lila)
3. 🏗️ Baustellendaten (grau)
4. 📸 Fotos (orange)
5. ⏱️ Stunden (grün)

Jede Sub-Kachel führt zu einem Platzhalter-Screen („Kommt in einer späteren Etappe"). In Etappe 4b–7 werden diese nacheinander befüllt.

### Nachrichten-Ordner (neu strukturiert)

Klick auf die Kachel → zwei Sub-Kacheln:

1. 📅 Kalender (orange) — deine Schichten, Urlaub, Krank
2. 💬 Chat mit Büro (grün) — Anweisungen und Nachrichten

Beide sind aktuell noch Stubs — sie werden in Etappe 5 ausgebaut.

---

## Was technisch geändert wurde

### Gelöschte Dateien

| Datei | Grund |
|---|---|
| `jsx/tw-ma-fotos.jsx`     | Ersetzt durch Sub-View unter Baustellen (Etappe 6) |
| `jsx/tw-ma-kalender.jsx`  | Ersetzt durch Sub-View unter Nachrichten (Etappe 5) |
| `jsx/tw-ma-stunden.jsx`   | Ersetzt durch Sub-View unter Baustellen (Etappe 7) |

### Komplett neu gebaut

| Datei | Zeilen | Inhalt |
|---|---|---|
| `jsx/tw-ma-baustellen.jsx`  | 349 | `MABaustellenModul` Container (liste/detail/browser-State), `MABaustellenListe`, `MABaustelleDetail` mit 5 Sub-Kacheln, `MABaustelleBrowserStub`, `MASubHeader` |
| `jsx/tw-ma-nachrichten.jsx` | 163 | `MANachrichtenModul` Container, `MANachrichtenKachel`, Stubs für Kalender + Chat |

### Erweitert

| Datei | Änderung |
|---|---|
| `jsx/tw-ma-startseite.jsx`        | +103 Zeilen: `MAOrdnerKacheln` + `MAOrdnerKachel`-Komponenten |
| `jsx/tw-ma-shared-components.jsx` | +84 Zeilen: `MAIcon` von app.jsx hierher umgezogen (architektonisch sauberer) |
| `js/tw-ma-config.js`              | +137 Zeilen: `ORDNER_LABELS`-Block, 17 Keys × 7 Sprachen |

### Geschrumpft

| Datei | Änderung |
|---|---|
| `jsx/tw-ma-app.jsx`       | -156 Zeilen (von 690 auf 534): `MANavBar` komplett entfernt, Routing auf 3 States reduziert, `MAIcon` ausgelagert |

### Build-Scripts angepasst

- `build.bat` + `build-linux.sh`: Die 3 gelöschten JSX-Dateien entfernt
- `index-template.html`: Initial-Tab-Whitelist auf `['start','baustellen','nachrichten']` reduziert

---

## Build und Deploy

**Keine neuen Firebase-Arbeiten erforderlich!** Wenn Etappe 3 funktioniert hat, funktioniert Etappe 4a auch.

```bash
# Linux/Mac
./build-linux.sh

# Windows
build.bat
```

Dann wie gewohnt: `index.html` + `icons/` + `manifest.json` + `service-worker.js` + `css/` + `js/` + `jsx/` auf GitHub-Pages pushen.

---

## Testen

### Test 1: Startseite mit 2 Kacheln

1. App öffnen, PIN eingeben
2. **Erwartung:** Startseite mit Logo, Uhr, Bauteam-Animation und **zwei großen Kacheln** (Baustellen blau, Nachrichten grün)
3. **Keine Tab-Leiste** unter dem Header mehr

### Test 2: Baustellen-Navigation

1. Auf **Baustellen**-Kachel klicken
2. **Erwartung:** Kundenliste (wahrscheinlich leer, bis Etappe 4b) oder Spinner
3. Falls Kunden da: Auf einen klicken → Detail-Seite mit 5 farbigen Sub-Kacheln
4. Auf eine Sub-Kachel klicken → Platzhalter „Kommt in einer späteren Etappe"
5. Zurück-Button durchgehend funktional

### Test 3: Nachrichten-Navigation

1. Auf **Nachrichten**-Kachel klicken
2. **Erwartung:** 2 Sub-Kacheln Kalender (orange) + Chat (grün)
3. Jede Sub-Kachel führt zu einem Stub
4. Zurück zur Startseite über Header-Zurück-Button

### Test 4: Sprachwechsel

Sprach-Pill auf Startseite anklicken → Sprache wechseln. Alle neuen Labels der 2-Ordner-Kacheln, Sub-Überschriften und „Kommt in einer späteren Etappe"-Texte sollten korrekt übersetzt sein (DE/CS/SK/PL/EN/RO/UK).

---

## Was noch fehlt (nächste Etappen)

- **Etappe 4b:** Kundenliste aus Firebase/Drive befüllen, Drive-Browser für Sub-Ordner (Zeichnungen, Anweisungen lesen), Baustellendaten anzeigen
- **Etappe 5:** 3-Jahres-Kalender mit Tages-Modal, WhatsApp-style Chat mit Live-Übersetzung
- **Etappe 6:** Fotos-Workflow (Phase → Raum → Wand → Foto → Sprachnotiz → Sync)
- **Etappe 7:** Stunden-Workflow (PDF-Formular, Material-Popup)
- **Etappe 8:** FCM-Push-Notifications, Performance-Polish

---

## Troubleshooting

**Die alte Tab-Leiste ist noch sichtbar**
→ Browser-Cache hart leeren (Strg+Shift+R) + Service-Worker deregistrieren.

**Klick auf „Baustellen" zeigt nichts/Spinner dauerhaft**
→ Noch keine Kunden in Firebase freigegeben. In Etappe 4b wird die Kundenliste per Drive befüllt.

**Klick auf „Nachrichten" → Kalender/Chat zeigen Stubs**
→ Ist so beabsichtigt. Die Inhalte kommen in Etappe 5.

**„MAIcon is not defined" in der Konsole**
→ Baut nochmal mit `build.bat`/`build-linux.sh`. Die Reihenfolge muss sein: shared-components → auth → onboarding → startseite → baustellen → nachrichten → app.

---

*TW Baustellen-App · Etappe 4a · v1.0.0-etappe4a · 20.04.2026*
