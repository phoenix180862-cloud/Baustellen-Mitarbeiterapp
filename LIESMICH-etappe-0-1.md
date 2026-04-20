# LIESMICH — TW Baustellen-App · Etappe 0 + 1 (kombiniert)

**Datum:** 20.04.2026
**Inhalt:** Erste lauffaehige Version der Mitarbeiter-App — Skelett + Startseite + 6-Modul-Navigation

---

## Was in dieser Auslieferung steckt

### Etappe 0 (Projekt-Setup, ✓)
- Komplette Verzeichnisstruktur gemaess Master-Dokument Kapitel 2.2
- `build.bat` (Windows-Build) lt. Master-Dok Kap. 16.1
- `index-template.html` mit allen CDN-Imports
- `manifest.json`, `service-worker.js`, 10 PWA-Icons
- README + Master-Dokument in `docs/`

### Etappe 1 (Startseite + Navigationsleiste, ✓)
- **`MAApp`** — Top-Level mit Header, Navi-Leiste, Routing, History-Stack (Zurueck/Vor)
- **`MAStartseite`** — Header-Block, Uhr-Block, Sprach-Pill, BauteamAnimation, Status-Indikator
- **`MAHeader`** — Zurueck/Vor-Buttons (rot), Titel, A-Gross/A-Klein-Toggle
- **`MANavBar`** — 6 Modul-Buttons (3x2-Grid, blau, aktiv = leuchtender Rand)
- **`MASprachPill` + `MASprachModal`** — Sprach-Wechsel zwischen 7 Sprachen
- **`MAUhrBlock`** — Premium-Uhr mit Pulse-Doppelpunkt, Wochentag in Landessprache
- **`MABauteamAnimation`** — 3 laufende Fliesenleger-Silhouetten (SVG, CSS-Animationen)
- **`MAStatusIndikator`** — Online/Offline, letzter Sync, Zaehler fuer neue Nachrichten
- **`MAPlatzhalterView`** — generischer Platzhalter fuer die 5 noch nicht gebauten Module

### 7 Sprachen komplett durchuebersetzt (UI_LABELS)
🇩🇪 Deutsch · 🇨🇿 Cestina · 🇸🇰 Slovencina · 🇵🇱 Polski · 🇬🇧 English · 🇷🇴 Romana · 🇺🇦 Ukrayinska

---

## Was zu testen ist

### Test 1: App startet (Happy Path)
1. `index.html` auf einen Webserver packen (oder `python3 -m http.server 8080` im Ordner)
2. Auf dem Handy oeffnen (`http://<IP>:8080`)
3. Erwartung: Startseite erscheint nach kurzem "TW Lade..."-Placeholder
4. Uhrzeit tickt in Sekundentakt, Doppelpunkt blinkt

### Test 2: 6-Button-Navigation
1. Auf **Baustellen** tippen → Platzhalter-View "Baustellen-Modul (Etappe 4)"
2. Auf **Fotos**, **Stunden**, **Kalender**, **Nachrichten** je einmal tippen
3. Erwartung: Platzhalter-View mit passendem Text, Zurueck-Button fuehrt zur Startseite
4. Aktiver Button hat weissen Rand + leuchtenderen Shadow

### Test 3: History-Stack (Zurueck/Vor)
1. Start → Baustellen → Fotos → Stunden
2. Zurueck-Pfeil 3× tippen → landet wieder auf Start
3. Vor-Pfeil 2× tippen → Fotos
4. Erwartung: Beide Pfeile werden rot-aktiv nur wenn History existiert, sonst grau

### Test 4: Sprach-Wechsel
1. Sprach-Pill ("🇩🇪 Deutsch") antippen → Modal mit 7 Sprachen
2. **Cestina** waehlen → alle Labels wechseln sofort (Navi, Header, Uhr-Wochentag)
3. Browser-Refresh → Sprache bleibt erhalten (localStorage)
4. In Cestina auf Baustellen tippen → Platzhalter "Modul Stavby (Etapa 4)"

### Test 5: Schriftgroesse
1. A↑ rechts oben mehrfach antippen → alle Schriften werden groesser (bis ~1.4x)
2. A↓ antippen → zurueck in kleineren Schritten (min. 0.85x)
3. Browser-Refresh → eingestellte Groesse bleibt

### Test 6: Online/Offline-Status
1. Im Browser DevTools: Netzwerk auf "Offline" schalten
2. Status-Indikator wird rot "Offline" (pulsiert nicht mehr)
3. Wieder online → gruen "Online" (mit Pulse-Animation)

### Test 7: BauteamAnimation
1. Erwartung: 3 Fliesenleger-Silhouetten (blau/rot/gruen) wandern horizontal,
   leicht huepfend. Sonne oben rechts, Haeuser + Gerueste im Hintergrund.

### Test 8: PWA-Installation (Android/iOS)
1. App im Chrome/Safari oeffnen
2. Menue → "Zum Startbildschirm hinzufuegen"
3. Erwartung: TW-Icon erscheint, App oeffnet sich im Standalone-Modus ohne Browser-Leiste

---

## Was NOCH NICHT funktioniert (bewusst, kommt in spaeteren Etappen)

- ❌ PIN-Login / Geraete-Onboarding (Etappe 3)
- ❌ Firebase-Echtzeit-Sync mit Master-App (Etappe 3+)
- ❌ Drive-Staging-Zugriff (Etappe 4)
- ❌ Baustellen-Liste / Ordner-Browser (Etappe 4)
- ❌ Foto-Aufnahme + Upload (Etappe 5)
- ❌ Stundenzettel + PDF-Export (Etappe 6)
- ❌ Chat + Live-Uebersetzung (Etappe 7)
- ❌ Kalender-Sync (Etappe 8)
- ❌ Spracheingabe (Mikrofon-Button ist da, sagt aber "Etappe 7")

Der Status-Indikator zeigt momentan "Letzter Sync: --" und 0 neue Nachrichten, weil
das Firebase-Backend noch nicht angebunden ist.

---

## Architektur-Entscheidungen in dieser Etappe

1. **Navigation:** 3x2-Grid statt horizontaler Scroll-Leiste fuer die 6 Modul-Buttons.
   Grund: kompakter auf kleinen Handys, keine versehentlichen Off-Screen-Items.
2. **History-Stack:** Eigener In-App-Stack statt Browser-History. Grund: PWA-Standalone-Modus
   hat keine Browser-Leiste; In-App-Zurueck ist verlaesslicher.
3. **Maximal 30 History-Eintraege:** Aeltere werden vorne rausgeschoben. Grund: verhindert
   unbegrenzten Stack-Aufbau bei langen Sessions.
4. **Icons als Inline-SVG:** Keine externe Icon-Library, keine Lucide-Abhaengigkeit.
   Grund: Offline-Robustheit, kleinerer Footprint.
5. **PWA-Icons programmatisch generiert:** Platzhalter-Qualitaet. Etappe 2 soll
   finale Icon-Version aus einem SVG-Master-File liefern.
6. **Render via `createRoot`** (React 18) statt altem `ReactDOM.render`.
7. **7 Sprachen bereits vollstaendig befuellt**, statt nur DE + Platzhalter. Grund: Einmal
   richtig machen, spaeter nur Keys ergaenzen statt rueckwirkend uebersetzen.

---

## Dateien in dieser Auslieferung

```
tw-baustellen-app-etappe-0-1-komplett.zip
├── README.md
├── LIESMICH-etappe-0-1.md            ← diese Datei
├── build.bat
├── build-linux.sh                    (Bonus: Bash-Variante fuer Mac/Linux)
├── index-template.html
├── index.html                         (fertig gebuildet!)
├── manifest.json
├── service-worker.js
├── icons/   (10 PNGs)
├── js/      (6 Module)
├── jsx/     (8 Module)
├── css/     (tw-ma-design.css)
└── docs/    (Master-Dokument)
```

**Zeilen-Bilanz (ohne Master-Dokument):**
- JSX-Module: ca. 1.100 Zeilen
- JS-Module: ca. 1.150 Zeilen
- CSS: ca. 180 Zeilen
- HTML-Template: ca. 70 Zeilen

---

## Deployment auf das Mitarbeiter-Repo

```bash
# 1. ZIP entpacken oder Dateien per drag-n-drop ins Repo-Arbeitsverzeichnis
# 2. Alles ausser dem fertigen index.html ist optional (wird von build.bat erzeugt)
git add -A
git commit -m "Etappe 0+1: Skelett, Startseite, 6-Modul-Navigation, 7 Sprachen"
git push origin main
```

Nach 1-2 Minuten ist die App live unter
`https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/`

---

## Was als Naechstes kommt (Etappe 2)

- Finales Icon-Design (SVG-Master + Export in alle Groessen)
- Service Worker Feintuning (Offline-Seite, Update-Benachrichtigung)
- iOS-spezifische Meta-Tags pruefen (Apple-Touch-Startup-Images)
- PWA-Installation auf mindestens 2 Handys testen (Android + iOS)
- Audit-Bericht: Ladezeiten, Lighthouse-Score

**Feedback bitte an Thomas** — dann gehts weiter mit Etappe 2.
