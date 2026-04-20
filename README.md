# TW Baustellen-App

**Mobile Begleiter-App fuer Baustellenmitarbeiter**
Teil der TW Business Suite · Thomas Willwacher Fliesenlegermeister e.K.

---

## Was ist das?

Die Baustellen-App ist eine eigenstaendige PWA (Progressive Web App), die auf
Mitarbeiter-Handys laeuft. Sie synchronisiert ueber Firebase und einen
Drive-Staging-Bereich mit der Buero-App (TW Business Suite).

**Architektur in einem Satz:** Mitarbeiter sehen nur das, was das Buero
freigibt — keine Google-Logins, keine Original-Drive-Zugriffe, alles ueber
Service-Account und PIN-geschuetzte Geraete.

---

## Dateistruktur

```
Baustellen-Mitarbeiterapp/
├── README.md                         (diese Datei)
├── build.bat                         Build-Skript (Windows)
├── index-template.html               Template mit Script-Tags
├── index.html                        Build-Output
├── manifest.json                     PWA-Manifest
├── service-worker.js                 Offline-Cache
├── icons/                            10 PNG-Icons (72-512px)
├── js/
│   ├── tw-ma-core.js                 Logger, Device-ID, Datum-Helpers
│   ├── tw-ma-storage.js              IndexedDB-Wrapper
│   ├── tw-ma-config.js               i18n + App-Config
│   ├── tw-ma-firebase.js             Realtime-DB-Anbindung (Stub)
│   ├── tw-ma-drive-service.js        Drive-Staging-Anbindung (Stub)
│   └── tw-ma-translation.js          Gemini-Wrapper (Stub)
├── jsx/
│   ├── tw-ma-shared-components.jsx   Logo, Animation, Uhr, Sprach-Pill
│   ├── tw-ma-startseite.jsx          Startseite
│   ├── tw-ma-baustellen.jsx          Modul (Platzhalter)
│   ├── tw-ma-kalender.jsx            Modul (Platzhalter)
│   ├── tw-ma-fotos.jsx               Modul (Platzhalter)
│   ├── tw-ma-stunden.jsx             Modul (Platzhalter)
│   ├── tw-ma-nachrichten.jsx         Modul (Platzhalter)
│   └── tw-ma-app.jsx                 Root + Routing + Navi
├── css/
│   └── tw-ma-design.css              Design-System (Farben, Radius, etc.)
└── docs/
    ├── MASTER-BAUSTELLEN-APP.md      Master-Dokument / Skill
    └── konzeptbaustellenappmodul.pdf Sicherheits-/Architektur-Basis
```

---

## Build ausfuehren

**Windows:** Doppelklick auf `build.bat`

**macOS/Linux:** Das Skript ist .bat — Alternative:
```bash
cp index-template.html index.html
echo '<script type="text/babel">' >> index.html
cat jsx/tw-ma-shared-components.jsx jsx/tw-ma-startseite.jsx \
    jsx/tw-ma-baustellen.jsx jsx/tw-ma-kalender.jsx \
    jsx/tw-ma-fotos.jsx jsx/tw-ma-stunden.jsx \
    jsx/tw-ma-nachrichten.jsx jsx/tw-ma-app.jsx >> index.html
echo '</script>' >> index.html
echo '<script type="text/babel">ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(MAApp));</script>' >> index.html
```

---

## Deployment

GitHub Pages auf Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp`:

1. `build.bat` ausfuehren
2. `git add -A && git commit -m "Etappe X" && git push`
3. Nach 1-2 Minuten ist die neue Version live
4. Service Worker erkennt neue Version und triggert Update beim naechsten Start

---

## Etappenplan (siehe `docs/MASTER-BAUSTELLEN-APP.md` Kapitel 15)

| Etappe | Titel | Status |
|--------|-------|--------|
| 0 | Repo-Audit & Projekt-Setup | ✓ |
| 1 | Startseite + Navigationsleiste | ✓ |
| 2 | Icon-Set finalisieren + Service Worker + PWA-Test | teils ✓ |
| 3 | Geraete-Onboarding + PIN-Login | offen |
| 4 | Modul Baustellen (Liste + 4 Kacheln + Browser) | offen |
| 5 | Modul Fotos (kompletter Workflow) | offen |
| 6 | Modul Stunden (PDF + Material-Popup) | offen |
| 7 | Modul Nachrichten + Anweisungen + Uebersetzung | offen |
| 8 | Modul Kalender + Fein-Schliff + Tests | offen |

---

## Conventions

- **Komponenten-Praefix:** Alle JSX-Komponenten beginnen mit `MA` (z.B. `MAStartseite`)
- **Input-Felder:** Nie `type="number"` — immer `type="text"` mit `inputMode`
- **Umlaute in Kommentaren:** vermeiden (ae/oe/ue/ss) — Babel-Encoding-Problem
- **Fragment-Syntax:** `<React.Fragment>` statt `<>...</>`
- **Sprache:** UI-Texte mehrsprachig (7 Sprachen), Code-Kommentare auf Deutsch/ASCII

---

**Bei Fragen:** siehe `docs/MASTER-BAUSTELLEN-APP.md`
