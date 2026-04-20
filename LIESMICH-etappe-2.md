# LIESMICH - TW Baustellen-App - Etappe 2

**Datum:** 20.04.2026
**Inhalt:** Icon-Set aus SVG-Master + PWA-Manifest-Finish + Service Worker mit Offline-Fallback + iOS-Splash-Screens

---

## Was in dieser Etappe neu ist

### 1. SVG-Master-Icon (`icons/master.svg`)
- Vektorgrafik als Single-Source-of-Truth fuer alle Icon-Groessen
- Motiv: Bauhelm (Baustellengelb mit Volumen-Gradient) auf blauem Radial-Gradient-Hintergrund
- TW-Monogramm zentral im Helm, weiss mit sanftem Bluegradient
- Detail-Akzente: Lueftungsschlitze am Helm, Glanzlicht oben, "BAUSTELLE"-Schriftzug unten
- Alle Icons werden hieraus via CairoSVG gerastert — bei spaeteren Aenderungen nur master.svg anpassen und `generate_icons_v2.py` laufen lassen

### 2. Alle PWA-Icons neu gerastert (10 Stueck)
| Datei | Groesse | Zweck |
|---|---|---|
| icon-72.png     | 72x72   | PWA (Android) |
| icon-96.png     | 96x96   | PWA (Android) |
| icon-128.png    | 128x128 | Desktop (Chrome) |
| icon-144.png    | 144x144 | Windows Tile |
| icon-152.png    | 152x152 | iOS Home-Screen |
| icon-192.png    | 192x192 | PWA Standard |
| icon-384.png    | 384x384 | Android hohe DPI |
| icon-512.png    | 512x512 | Splash / grosse Displays |
| icon-maskable-192.png | 192x192 | Android Adaptive (Safe-Zone) |
| icon-maskable-512.png | 512x512 | Android Adaptive (Safe-Zone) |

### 3. iOS-Splash-Screens (8 Stueck)
Startup-Bilder fuer den Homescreen-Launch im Standalone-Modus. Abgedeckt:
- iPhone 15 Pro Max (1290x2796)
- iPhone 15 Pro       (1179x2556)
- iPhone 14 Plus      (1284x2778)
- iPhone 14           (1170x2532)
- iPhone X/11/12/13   (1125x2436)
- iPhone 8/SE         (750x1334)
- iPad Pro 12.9"      (2048x2732)
- iPad Pro 11"        (1668x2388)

Jedes Splash zeigt das TW-Icon zentriert auf Firmenblau mit "Thomas Willwacher Fliesenlegermeister e.K."-Schriftzug.

### 4. Favicon
`icons/favicon.ico` — Multi-Size-ICO (16/32/48 Pixel), verlinkt im Template.

### 5. Service Worker v2 (`service-worker.js`)
Komplett ueberarbeitet mit drei getrennten Caches und vier verschiedenen Strategien:

| Request-Typ | Strategie | Grund |
|---|---|---|
| Navigation (HTML-Seiten) | network-first → index.html → offline.html | Frische Version bevorzugt, aber nie leere Seite |
| App-Shell (JS/CSS/Icons) | cache-first | Schnell, entlastet Netz |
| Bilder (Fotos, Splash)   | cache-first mit LRU (max. 50) | Speichereffizienz |
| Google Fonts              | stale-while-revalidate | Fonts aendern sich selten |
| Firebase/Googleapis      | network-only (nicht gecacht) | Echtzeit-Sync muss aktuell sein |
| CDN (React/Babel)        | stale-while-revalidate | Start schnell, im HG updaten |

**Update-Flow:**
1. Neuer SW installiert sich im Hintergrund
2. Wenn alter SW noch laeuft → Event `updatefound` → JSX zeigt **Update-Toast**
3. User tippt "Aktualisieren" → `skipWaiting()` → Seite reloadt mit neuer Version

### 6. Manifest v2 (`manifest.json`)
- Alle 10 Icons (any + maskable) korrekt deklariert
- **App-Shortcuts** hinzugefuegt: Langes Druecken auf das Icon (Android) oeffnet Quick-Menue mit 3 Direktzugriffen:
  - "Fotos aufnehmen" → `?tab=fotos`
  - "Stundenzettel"   → `?tab=stunden`
  - "Nachrichten"     → `?tab=nachrichten`
- `background_color` und `theme_color` auf Firmenblau `#1E88E5`
- `display: standalone`, `orientation: portrait-primary`
- `id: "/tw-baustellen-app/"` fuer stabile App-Identifikation

### 7. index-template.html v2
- Favicon verlinkt (inkl. PNG-Fallbacks fuer Safari)
- 8× `<link rel="apple-touch-startup-image">` fuer iOS-Splash-Screens (mit passenden media-queries)
- Hochwertiger Loading-Placeholder mit pulsendem TW-Logo
- Service-Worker-Registrierung mit Update-Detection
- URL-Query `?tab=X` wird ausgelesen → Initial-Tab fuer Manifest-Shortcuts

### 8. Neue Komponenten in `tw-ma-app.jsx`
- `MAUpdateToast` — Pill-Toast unten mitte, erscheint via Custom Event, bietet "Aktualisieren"- und "Schliessen"-Button
- Initial-Tab-Handling: `MAApp` liest `window.__TW_MA_INITIAL_TAB__` beim ersten Render

### 9. Offline-Fallback-Seite (`offline.html`)
- Eigenstaendige Seite, wenn Navigation misslingt und kein Cache da ist
- Firmen-Logo, pulsender roter Status-Punkt, beruhigender Erklaertext
- Auto-Reload sobald `online`-Event feuert
- Oeffnet dann die App neu geladen

---

## Was zu testen ist

### Test 1: PWA-Installation (Android Chrome)
1. `index.html` auf einen HTTPS-Server packen (GitHub Pages reicht)
2. Chrome oeffnen, URL eingeben
3. Menue → "Zum Startbildschirm hinzufuegen"
4. **Erwartung:** TW-Helm-Icon erscheint auf dem Homescreen
5. Auf Icon tippen → App oeffnet im Standalone-Modus (keine Browser-Leiste)

### Test 2: App-Shortcuts (Android)
1. Nach Test 1: langes Druecken aufs App-Icon
2. **Erwartung:** Popup mit 3 Shortcuts: Fotos / Stunden / Nachrichten
3. "Stunden" antippen → App startet direkt im Stunden-Modul (Platzhalter-View)

### Test 3: iOS-Splash-Screen (Safari)
1. Safari oeffnen, URL eingeben
2. Teilen-Button → "Zum Home-Bildschirm"
3. Auf Icon tippen
4. **Erwartung:** Beim App-Start wird fuer ca. 1-2 Sekunden ein blauer Splash-Screen mit TW-Icon angezeigt (statt leisem weissen Flash)
5. Pruefen auf mindestens einem iPhone- und einem iPad-Modell

### Test 4: Offline-Faehigkeit
1. App einmal oeffnen und auf Startseite durchklicken
2. Browser-DevTools oeffnen, "Offline" setzen
3. Seite neu laden
4. **Erwartung:** App laedt trotzdem aus dem Cache, Status-Indikator wird rot
5. Eine nicht-gecachte URL ansteuern (z.B. `index.html?foo=bar`) → offline.html erscheint
6. Wieder online → offline.html reloadt automatisch zur App

### Test 5: Update-Toast
1. App oeffnen, warten bis SW aktiv ist (Konsole: "[SW v1.0.1] activate")
2. In `service-worker.js`: `CACHE_VERSION` aendern (z.B. auf v1.0.2)
3. Auf Server deployen
4. App im Browser offen lassen, Seite neu laden (Ctrl+R)
5. **Erwartung:** Update-Toast erscheint unten mitte: "Neue Version verfuegbar"
6. "Aktualisieren" tippen → Seite reloadt, Toast verschwindet, Console zeigt neue Version

### Test 6: Icons in allen Groessen
1. In Chrome DevTools: Application → Manifest → Icons anzeigen
2. **Erwartung:** Alle 10 Icons werden sauber gerendert, keine Pixel-Artefakte
3. Bauhelm klar erkennbar auch in 72x72

### Test 7: Tab via URL
1. `index.html?tab=fotos` im Browser oeffnen
2. **Erwartung:** App startet direkt im Fotos-Modul
3. Auf "Zurueck" tippen → landet auf Start (da History-Stack nur einen Eintrag hat,
   wird der Back-Button grau)

---

## Was bewusst NOCH nicht drin ist

- ❌ Geraete-Onboarding / PIN-Login → **Etappe 3**
- ❌ Firebase-Anbindung fuer Echtzeit-Sync → **Etappe 3**
- ❌ Baustellen-Daten aus Drive → **Etappe 4**
- ❌ Echte Funktionalitaet der 5 Module → **Etappen 4-8**

---

## Dateien in dieser Auslieferung

```
tw-baustellen-app-etappe-2-komplett.zip
├── README.md
├── LIESMICH-etappe-0-1.md
├── LIESMICH-etappe-2.md              ← diese Datei
├── build.bat / build-linux.sh
├── index-template.html               (erweitert)
├── index.html                         (neu gebaut, 51 KB)
├── manifest.json                     (erweitert mit Shortcuts)
├── service-worker.js                 (komplett neu)
├── offline.html                      (NEU)
├── icons/
│   ├── master.svg                    (NEU - Source of Truth)
│   ├── icon-72/96/128/144/152/192/384/512.png  (neu gerastert)
│   ├── icon-maskable-192/512.png     (neu gerastert)
│   ├── favicon.ico                   (NEU)
│   └── splash-*.png                  (NEU - 8 iOS-Splash-Screens)
├── js/      (unveraendert)
├── jsx/
│   └── tw-ma-app.jsx                 (MAUpdateToast + Initial-Tab)
├── css/     (unveraendert)
└── docs/
    └── MASTER-BAUSTELLEN-APP.md
```

**Zeilen-Zuwachs gegenueber Etappe 0-1:** ca. +450 Zeilen (SW-Logik +120, Template +60,
MAUpdateToast +90, offline.html +80, Generator-Skripte +100)

---

## Bekannte Einschraenkungen

1. **Chromium-basierte Browser nur:** Manifest-Shortcuts funktionieren auf iOS noch nicht
   (Apple unterstuetzt das noch nicht). Auf Android/Chrome Desktop aber voll einsetzbar.
2. **CacheVersion manuell pflegen:** Bei jedem Deployment `CACHE_VERSION` im Service Worker
   erhoehen, sonst bemerken Clients die neue Version nicht. Vorschlag: im Build-Skript
   automatisieren (spaetere Optimierung).
3. **Splash-Screens sind statisch:** Bei Sprachwechsel der App wird der Splash nicht
   nach-uebersetzt (nur der Firmenname steht drauf, daher unkritisch).

---

## Deployment

```bash
git add -A
git commit -m "Etappe 2: Icon-Master, iOS-Splash, SW v2, App-Shortcuts, Offline-Fallback"
git push origin main
```

Nach 1-2 Minuten live. Bereits installierte Instanzen bekommen den Update-Toast nach
kurzer Zeit angezeigt.

---

## Was als Naechstes kommt (Etappe 3)

**Geraete-Onboarding + PIN-Login**
- UUID-Generierung pro Geraet (ist schon in `tw-ma-core.js` vorbereitet)
- 6-stelliger Freischalt-Code wird von der Master-App generiert und per SMS/Mail an
  den Mitarbeiter gesendet
- App fragt Code ab → validiert gegen Firebase → Geraet wird in `/geraete/{uuid}/`
  als "approved" markiert
- PIN-Setup (4-6 Ziffern) nach Freischaltung
- PIN-Login bei jedem App-Start
- 5-Falsch-Versuche-Schutz: lokaler Wipe + Firebase-Statusmeldung
- Remote-Wipe-Empfang: wenn Thomas das Geraet aus der Whitelist streicht, loescht
  die App beim naechsten Online-Zugriff alle lokalen Daten

**Vorbereitung fuer Thomas (parallel):**
- Firebase-Console: Security-Rules fuer `/geraete/{uuid}/` aufsetzen
- Firebase-Console: ersten Test-Geraete-Freischalt-Code manuell anlegen, um Flow zu testen
- Optional: Master-App um "Geraete-Freischaltung"-UI erweitern (falls noch nicht vorhanden —
  existiert vermutlich schon lt. Master-Dok 4.1 Etappe 6)

Feedback bitte — dann legen wir los mit Etappe 3.
