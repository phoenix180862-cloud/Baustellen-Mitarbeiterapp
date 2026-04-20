---
name: master-baustellen-app-erstellung
description: Verbindlicher Master-Skill UND Uebergabeprotokoll fuer den Komplettumbau der TW Baustellen-App (Mitarbeiter-App). Triggert IMMER, wenn der User in einem neuen Chat "Start!" sagt und diese Datei hochgeladen ist. Enthaelt alle Spezifikationen fuer Startseite, Navigationsleiste, Module (Baustellen, Kalender, Fotos, Stunden, Nachrichten), Uebersetzungs-Infrastruktur, Sync mit Master-App und Etappenplan. Beim Trigger sofort mit Etappe 1 beginnen, NICHT konzeptionell diskutieren.
---

# MASTER-DOKUMENT
## TW Baustellen-App · Komplettumbau (Mitarbeiter-App)
### Skill + Uebergabeprotokoll in EINER Datei

| Feld | Wert |
|---|---|
| **Erstellt** | 18. April 2026 |
| **Auftraggeber** | Thomas Willwacher (Chef) |
| **Projekt** | TW Baustellen-App (separate Mitarbeiter-App, eigenstaendige Codebase) |
| **GitHub-Repo** | https://github.com/phoenix180862-cloud/Baustellen-Mitarbeiterapp |
| **Zugehoerig** | TW Business Suite (Master-App, Buero-Seite) |
| **Status alter Code** | Probe-Version, wegwerfbar — wird komplett ueberarbeitet |
| **Konzept-Grundlage** | `konzeptbaustellenappmodul.pdf` (Sicherheits-/Architektur-Basis) + Erweiterungen lt. diesem Dokument |
| **Bei Konflikt** | DIESES Dokument gewinnt gegen Konzept-PDF (User-Update nach Konzept-Erstellung) |

---

# 0. STARTBEFEHL — DAS LIEST CLAUDE ZUERST

Wenn der User in einem neuen Chat **"Start!"** sagt und diese Datei hochgeladen ist:

## 0.1 Reihenfolge der ersten Aktionen

1. **Dieses Master-Dokument VOLLSTAENDIG lesen.** Nichts ueberspringen, auch nicht die Anhaenge.
2. **Konzept-PDF lesen** (`konzeptbaustellenappmodul.pdf`) — die uebergeordnete Sicherheits-/Architektur-Grundlage. Bei Widerspruch zwischen Konzept und Master-Dokument **gewinnt das Master-Dokument** (User hat nach Konzept-Erstellung erweitert).
3. **Bestehende Master-App-Dateien sichten** (zur Wiederverwendung von Optik & Komponenten):
   - `tw-aufmass.jsx` Zeilen 1-540 — die `Startseite`-Komponente, visuelle Vorlage
   - `tw-shared-components.jsx` Zeilen 890-1325 — `BauteamAnimation` und Header-Komponenten
   - `tw-baustelle.jsx` — das Buero-Admin-Modul. **Wird NICHT umgebaut**, dient nur als Firebase-Integrations-Referenz
   - `SKILL-design-system.md`, `SKILL-firmenlogo.md`, `SKILL-jspdf-briefkopf.md` — verbindliche Design-Referenzen
4. **Repo-Stand pruefen:** Den existierenden Code im Mitarbeiter-Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp` kurz sichten. Mit hoher Wahrscheinlichkeit: Probe-Version, wegwerfbar. Behalten werden nur:
   - `.git`-Historie und Repo-Konfiguration
   - GitHub-Pages-Deployment-Settings
   - Falls vorhanden: vorhandene Firebase-Config (Projekt `einkaufsliste-98199` aus Master-App tw-baustelle.jsx kann uebernommen werden)
5. **Bestaetigung an Thomas:** Eine kurze Antwort:
   > "Master-Dokument gelesen. Konzept-PDF geprueft. Code-Basis gesichtet. Repo-Stand: [kurze Bestandsaufnahme]. Ich beginne mit Etappe 1: Projekt-Setup. Hier ist der erste Bauschritt: ..."
6. **Sofort mit Etappe 1 starten** (siehe Kapitel 15). NICHT konzeptionell diskutieren. NICHT die Anforderungen erneut hinterfragen. NICHT pruefen, ob die Loesung sinnvoll ist.

## 0.2 Bei jeder Etappen-Auslieferung

- **Build durchfuehren** gemaess `SKILLBuildAuslieferung.md` (analog zur Master-App, aber im neuen Repo)
- **ZIP packen** mit: frische `index.html` + alle modifizierten JSX-Dateien + ggf. neue Konfigurationsdateien (Manifest, Service Worker)
- **`present_files` aufrufen** mit dem ZIP
- **Knappe Zusammenfassung** schreiben: was gebaut wurde, was getestet werden soll, was als Naechstes kommt
- **Nicht zur naechsten Etappe springen**, ohne Feedback abzuwarten

## 0.3 Wenn etwas im Master-Dokument unspezifiziert ist

- **Lieber kurz zurueckfragen** als falsch bauen
- ABER: Nicht ueber Selbstverstaendlichkeiten fragen ("soll der Button blau sein?")
- **NUR ueber echt unterspezifizierte Punkte** fragen
- Annahmen, die Claude trifft, **explizit im Etappen-Bericht dokumentieren**, damit Thomas korrigieren kann

## 0.4 Sprache und Stil

- **Alle UI-Texte, Code-Kommentare und Kommunikation auf DEUTSCH**
- **Keine Umlaute (ae, oe, ue, ss)** in JSX-Kommentaren — fuehrt zu Babel-Encoding-Fehlern. In Strings sind Umlaute okay, aber bevorzugt ASCII-Schreibweise.
- **Conversational Tone mit Thomas:** motivierend, kollegial, mit Humor wo passend, Unternehmensjargon. Knapp halten, nicht ausschweifen.

---

# 1. PROJEKT-KONTEXT & ARCHITEKTUR

## 1.1 Zwei Apps, eine Familie

Die TW-Familie besteht aus **zwei getrennten Web-Apps**, die ueber einen geteilten Datenspeicher (Google Drive) und eine Echtzeit-Datenbank (Firebase) miteinander kommunizieren:

| Aspekt | TW Business Suite (Master) | TW Baustellen-App (Mitarbeiter) |
|---|---|---|
| **Zweck** | Vollstaendige Buero-Verwaltung | Mobile Baustellen-Begleitung |
| **Wer nutzt sie?** | Thomas + Buero (1-2 Personen) | Mitarbeiter auf der Baustelle (5-10 Personen) |
| **Wo deployed?** | Bestehende GitHub Pages URL | https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/ (vermutlich) |
| **Repo** | Bestehend | `phoenix180862-cloud/Baustellen-Mitarbeiterapp` |
| **Codebase** | Vorhanden, nicht angefasst | NEU — komplett ueberarbeitet |
| **Daten-Zugriff Drive** | Direkt, voller Zugriff (OAuth, Thomas-Account) | Nur Staging-Bereich via Service Account |
| **Daten-Zugriff Firebase** | Voll, inkl. Geraete-Verwaltung | Nur Lese/Schreib-Rechte fuer eigene Geraete-ID |
| **Login** | Google OAuth (Thomas) | PIN pro Geraet (Mitarbeiter) |
| **Hauptmodule** | Aufmass, Rechnung, Schriftverkehr, Ausgangsbuch, Baustelle-Admin | Start, Baustellen, Kalender, Fotos, Stunden, Nachrichten |
| **PWA?** | Optional | **JA — installierbar als Homescreen-App** |
| **Offline-faehig?** | Teilweise | **JA — Foto-Aufnahme, Stundenzettel-Entwurf, Lese-Cache** |

## 1.2 Datenfluss-Architektur (Kurzform)

```
+-------------------+     OAuth Vollzugriff     +------------------+
| TW Business Suite |  <----------------------->| Original-Drive   |
| (Master, Buero)   |                            | (Kundenordner)   |
+-------------------+                            +------------------+
        |                                                   |
        | manueller Sync                                    | manuelle
        | (vom Buero ausgeloest)                            | Bereitstellung
        v                                                   v
+----------------------------------------------------------------+
|              Firebase Realtime Database                         |
|  - Geraete-Whitelist                                            |
|  - Nachrichten (mit Original + Uebersetzung)                    |
|  - Anweisungen                                                  |
|  - Kalender-Eintraege                                           |
|  - Sync-Statusmeldungen                                         |
+----------------------------------------------------------------+
        ^                                                   ^
        | Service-Account                                   | Service-Account
        | (nur Staging)                                     | (lese-/schreibbeschraenkt)
        v                                                   v
+-------------------+    Service Account        +------------------+
| TW Baustellen-App |  <----------------------->| Staging-Bereich  |
| (Mitarbeiter)     |   (eingeschraenkter       | (Kopie pro       |
+-------------------+    Drive-Zugriff)         | Baustelle)       |
                                                +------------------+
```

**Drei Schluessel-Prinzipien:**
1. **Ein-Tuer-Prinzip:** Daten zwischen Original und Mitarbeiter wandern NUR ueber das Buero (manuelle Freigabe)
2. **Staging-Isolation:** Mitarbeiter-Handys kennen die Original-Drive-IDs nicht — physische Trennung
3. **Echtzeit nur fuer Kommunikation:** Firebase fuer Nachrichten/Anweisungen/Geraete-Whitelist, Drive fuer Dateien

## 1.3 Was in DIESEM Projekt gebaut wird

Die **komplette Mitarbeiter-App** als **separate Web-App** im Mitarbeiter-Repo:

- **Eigene** `index.html`, eigener `index-template.html`, eigenes `build.bat`
- **Eigene** JSX-Module (Praefix `tw-ma-` zur Unterscheidung):
  - `tw-ma-shared-components.jsx`
  - `tw-ma-startseite.jsx`
  - `tw-ma-baustellen.jsx`
  - `tw-ma-kalender.jsx`
  - `tw-ma-fotos.jsx`
  - `tw-ma-stunden.jsx`
  - `tw-ma-nachrichten.jsx`
  - `tw-ma-app.jsx` (Top-Level-Routing)
- **Eigene** JS-Infrastruktur:
  - `tw-ma-core.js` (analog tw-core.js)
  - `tw-ma-storage.js` (IndexedDB fuer Offline)
  - `tw-ma-firebase.js` (Realtime DB Anbindung)
  - `tw-ma-drive-service.js` (Service-Account-Anbindung)
  - `tw-ma-translation.js` (Gemini-Wrapper)
  - `tw-ma-config.js` (verschluesselter API-Key, App-Konstanten)
- **PWA-Dateien:**
  - `manifest.json`
  - `service-worker.js`
  - Icon-Set in mehreren Groessen

**Was wiederverwendet wird** (per Copy-Paste, keine Cross-Repo-Imports):
- `FirmenLogo`-Komponente (aus Master-App)
- `BauteamAnimation`-Komponente (aus Master-App)
- Design-Variablen (CSS, aus `tw-design.css`)
- jsPDF-Briefkopf-Pattern (fuer Stundenzettel-PDF)
- Speech-Service-Pattern (`TWSpeechService`)

## 1.4 Was NICHT gebaut wird (Abgrenzung)

- KEINE Aufmass-, Rechnung-, Schriftverkehr-Module (gibt's in der Master-App)
- KEINE KI-Foto-Analyse (laeuft ausschliesslich in Master-App, siehe Antworten Runde 2)
- KEINE Original-Drive-Zugriffe (nur Staging-Bereich)
- KEINE Geraete-Freischaltung (macht Thomas in der Master-App / Firebase-Console)
- KEINE Sync-Buttons fuer Drive ↔ Original (das ist Sache der Master-App)
- KEINE komplexen Auswertungen, KI-Akten, Ausgangsbuecher

---

# 2. TECH-STACK & PROJEKT-SETUP

## 2.1 Tech-Stack

| Komponente | Wahl | Begruendung |
|---|---|---|
| **UI-Framework** | React via Babel-im-Browser | Identisch zur Master-App, kein Build-Server, schnelle Iteration |
| **Styling** | Inline-Styles + CSS-Variablen | Identisch zur Master-App |
| **Local Storage** | IndexedDB via `tw-ma-storage.js` | Offline-Faehigkeit, grosse Foto-Mengen |
| **Echtzeit-DB** | Firebase Realtime Database | Schon in Master-App genutzt (`einkaufsliste-98199`), bewaehrt fuer Sync |
| **File-Storage** | Google Drive (Staging) via Service-Account | Konzept-PDF-konform, Sicherheits-Trennung |
| **PDF-Erzeugung** | jsPDF (CDN) | Fuer Stundenzettel-PDF, identisch zur Master-App |
| **KI / Uebersetzung** | Gemini Flash via API-Key | Schnell, billig, schon im Stack, Antworten Runde 1 |
| **Spracheingabe** | Web Speech API (Browser-nativ) | Kostenlos, offline-faehig, fuer mehrere Sprachen verfuegbar |
| **Build** | `build.bat` analog Master-App | Bewaehrt, Thomas kennt das Pattern |
| **Hosting** | GitHub Pages | Bestehend |
| **PWA** | `manifest.json` + Service Worker | Fuer Homescreen-Installation + Offline-Cache |

## 2.2 Verzeichnisstruktur des Mitarbeiter-Repos

```
Baustellen-Mitarbeiterapp/
├── README.md
├── build.bat                       # Build-Skript: erzeugt index.html aus Template + JSX
├── index-template.html              # Template mit Script-Tags, ohne Babel-Block
├── index.html                       # Build-Output (Babel-Block injected)
├── manifest.json                    # PWA-Manifest
├── service-worker.js                # PWA Service Worker (Offline-Cache)
├── icons/                           # PWA-Icons in verschiedenen Groessen
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
├── js/                              # Externe JS-Dateien (vor Babel-Block geladen)
│   ├── tw-ma-core.js
│   ├── tw-ma-storage.js
│   ├── tw-ma-firebase.js
│   ├── tw-ma-drive-service.js
│   ├── tw-ma-translation.js
│   └── tw-ma-config.js
├── jsx/                             # JSX-Module (im Babel-Block konkateniert)
│   ├── tw-ma-shared-components.jsx
│   ├── tw-ma-startseite.jsx
│   ├── tw-ma-baustellen.jsx
│   ├── tw-ma-kalender.jsx
│   ├── tw-ma-fotos.jsx
│   ├── tw-ma-stunden.jsx
│   ├── tw-ma-nachrichten.jsx
│   └── tw-ma-app.jsx
├── css/
│   └── tw-ma-design.css             # CSS-Variablen, identisch zu Master-App
└── docs/
    ├── MASTER-BAUSTELLEN-APP.md     # Diese Datei (im Repo abgelegt!)
    └── konzeptbaustellenappmodul.pdf
```

## 2.3 Build-Reihenfolge der JSX-Dateien (in `build.bat`)

```
1. tw-ma-shared-components.jsx     (Logo, BauteamAnimation, MicButton, etc.)
2. tw-ma-startseite.jsx
3. tw-ma-baustellen.jsx
4. tw-ma-kalender.jsx
5. tw-ma-fotos.jsx
6. tw-ma-stunden.jsx
7. tw-ma-nachrichten.jsx
8. tw-ma-app.jsx                    (immer zuletzt, enthaelt Top-Level-Routing)
```

JS-Dateien (im `index-template.html` als `<script src=...>` VOR dem Babel-Block):

```
1. tw-ma-core.js
2. tw-ma-storage.js
3. tw-ma-config.js                  (Firebase-Config, verschluesselter Gemini-Key)
4. tw-ma-firebase.js                (braucht Firebase-SDK aus CDN)
5. tw-ma-drive-service.js
6. tw-ma-translation.js
```

## 2.4 Wichtige Konstanten und Konventionen

- **Komponenten-Praefix:** Alle JSX-Komponenten der Mitarbeiter-App beginnen mit `MA` (z.B. `MAStartseite`, `MABaustellenListe`, `MAFotosModul`) — verhindert Verwechslung mit Master-App-Komponenten beim Code-Review
- **State-Routing:** Top-Level-Komponente `MAApp` haelt einen `aktiverTab`-State (`'start' | 'baustellen' | 'kalender' | 'fotos' | 'stunden' | 'nachrichten'`)
- **Input-Felder:** NIEMALS `type="number"` mit Spinnern. IMMER `type="text"` mit `inputMode="numeric"` — analog Master-App
- **Speech-Service:** Globaler Singleton in `tw-ma-shared-components.jsx`, identisches Pattern zur Master-App (`TWSpeechService`)
- **Sprache der Mitarbeiter-App-UI:** **MEHRSPRACHIG** — siehe Kapitel 11

---

# 3. SICHERHEITSMODELL — ZUSAMMENFASSUNG

Volle Details im Konzept-PDF, Kapitel 9-11. Hier die Mitarbeiter-App-spezifische Zusammenfassung:

## 3.1 Authentifizierung

- **Login:** PIN-Eingabe pro Geraet (4-6-stellig, vom Mitarbeiter selbst gewaehlt beim Onboarding)
- **Kein Google-Login** auf Mitarbeiter-Seite — der Mitarbeiter sieht keine Google-Auth-Dialoge
- **Geraete-Whitelist** in Firebase: jedes Geraet hat eine UUID, die von Thomas in der Master-App freigegeben werden muss
- **Sperre durch Thomas:** Geraet kann jederzeit von Thomas aus der Whitelist gestrichen werden — App startet beim naechsten Versuch nicht mehr und loescht lokale Daten

## 3.2 Autorisierung

- **Gemini-API-Key:** Verschluesselt in `tw-ma-config.js` eingebaut, Master-Passwort beim Geraete-Onboarding uebertragen, niemals im Klartext im App-Paket
- **Drive-Service-Account:** Der Service-Account-JSON wird ebenfalls verschluesselt eingebaut (gleiche Methode wie Gemini-Key)
- **Drive-Berechtigungen:** Service-Account hat NUR Zugriff auf den Staging-Root-Ordner. Originale sind technisch unsichtbar
- **Firebase-Rules:** Mitarbeiter-App darf nur in eigene Geraete-ID-Subtrees schreiben, lesen darf sie alle Nachrichten/Anweisungen ihrer freigegebenen Baustellen

## 3.3 Datenschutz

- **Keine Cloud-Synchronisation** der lokalen IndexedDB-Daten an Drittanbieter
- **Keine Telemetrie / Analytics** (keine Google Analytics, kein Sentry)
- **Logging** nur lokal in der App (Mitarbeiter sieht eigene Aktionen) und in Firebase (Audit-Log fuer Thomas)

## 3.4 Schutz vor Geraete-Verlust

- **PIN-Sperre:** App startet nicht ohne korrekte PIN
- **Falsche-PIN-Schutz:** Nach 5 falschen PIN-Versuchen werden lokale Daten geloescht und Firebase informiert
- **Remote Wipe:** Thomas kann in der Master-App ein Geraet sperren — beim naechsten Online-Zugriff loescht die App alle lokalen Daten

---

# 4. STARTSEITE — VOLLSTAENDIGE SPEZIFIKATION

## 4.1 Optisches Vorbild

Die Startseite uebernimmt die **gesamte Optik der Master-App-Startseite** (`tw-aufmass.jsx` Zeilen 225-540, Komponente `Startseite`) — **mit folgenden expliziten Aenderungen**.

## 4.2 Header (oberer Bereich, BLEIBT optisch)

- **`FirmenLogo size="large"`** — identisch
- **Adressezeile** "Flurweg 14a · 56472 Nisterau · Tel. 02661-63101" — identisch
- **Statt** "Business Suite" steht hier in gleicher Optik (Akzentblau, gesperrt, uppercase): **"Baustellen App"**

```jsx
<div style={{marginTop:'8px', fontSize:'13px', fontWeight:'700', color:'var(--accent-blue)', letterSpacing:'2px', textTransform:'uppercase'}}>
    Baustellen App
</div>
```

## 4.3 Navigationsleiste (ganz oben, neue Buttons)

Die Navigationsleiste behaelt die **gleiche Optik** wie die Master-App-Header-Leiste (`tw-shared-components.jsx` Zeilen 1095-1127, Komponente `Header`):

- **Linker Bereich:** Zurueck/Vor-Buttons (rote Akzent-Optik) — bleiben **wie in Master-App**
- **Mittelbereich (Titel):** **"Baustellen App"** (statt "TW Business Suite")
- **Rechter Bereich:** **A↑ Gross / A↓ Klein**-Toggle — **bleibt mit Funktion** (Schriftgroesse global vergroessern/verkleinern)

**Unterhalb der Header-Leiste** (oder als Teil davon, je nach Wahl) liegt eine **zweite Navigations-Leiste** mit den **6 Modul-Buttons**:

| Button | Icon-Vorschlag | Ziel |
|---|---|---|
| **Start** | Haus-SVG | Startseite (Default) |
| **Baustellen** | Helm-SVG | Baustellen-Liste |
| **Kalender** | Kalender-SVG | Kalender-Modul |
| **Fotos** | Kamera-SVG | Fotos-Modul (Auswahl Baustelle, dann Raum, dann Phase) |
| **Stunden** | Uhr-SVG | Stunden-Formular |
| **Nachrichten** | Sprechblase-SVG | Nachrichten/Anweisungen-Inbox |

**Optik der 6 Buttons:**
- **Identisch zum Master-App-Modul-Button-Stil** (`tw-modulwahl.jsx` Zeilen 60-100):
  - Gradient: `linear-gradient(135deg, #1E88E5, #1565C0)`
  - Shadow: `0 6px 20px rgba(30,136,229,0.30)`
  - Rounded: `var(--radius-lg)`
  - Schrift: Oswald, uppercase, letterSpacing 0.5px
- **Aktiver Button** wird visuell hervorgehoben (z.B. dickerer Rand oder leuchtenderer Shadow)
- **Layout:**
  - Auf Handy: 3x2-Grid oder horizontale Scroll-Leiste (testen, was sich besser anfuehlt)
  - Auf Tablet/Desktop: Eine Reihe mit 6 Buttons

## 4.4 Uhr-Block (UNVERAENDERT von Master-App)

Der Premium-Uhr-Block (`tw-aufmass.jsx` Zeilen 239-274) wird **1:1 uebernommen**:
- Tag-Anzeige (z.B. "FREITAG")
- Grosse Uhrzeit (HH:MM:SS, animiertes Pulse-Doppelpunkt)
- Datum darunter
- Dekorative Glanzlichter

## 4.5 Verbindungs-Buttons (ENTFALLEN)

**ALLE 5 Buttons unterhalb der Uhr werden ENTFERNT:**
- ❌ Gemini KI
- ❌ Google Drive
- ❌ Kundenauswahl
- ❌ Lokaler Speicher leeren
- ❌ Jetzt mit Google Drive synchronisieren

**Begruendung:** Mitarbeiter braucht keine dieser Funktionen — KI laeuft im Hintergrund (verschluesselter Key), Drive-Verbindung ueber Service-Account automatisch, Kunden gibt's nicht (nur Baustellen), Speicher-Loeschen ist gefaehrlich, Sync laeuft automatisch.

**Die freigewordene Flaeche wird genutzt fuer:**
- **Sprach-Auswahl** (siehe 4.6)
- **Hochsetzen der Bauteam-Animation** (siehe 4.7)
- **Status-Indikator** (klein, dezent): Geraet-Online-Status, letzte Sync, ungelesene Nachrichten-Zahl

## 4.6 Sprach-Auswahl-Knopf (NEU)

**Position:** Unterhalb der Uhr, mittig, kompakt (nicht so dominant wie die alten Verbindungs-Buttons).

**Optik:** Kleiner Pill-Button mit Flaggen-Emoji + Sprachname.
- Default: 🇩🇪 Deutsch
- Klick oeffnet Modal mit Sprach-Auswahl

**Unterstuetzte Sprachen (Erstaufschlag):**
- 🇩🇪 Deutsch (Default fuer Thomas und deutschsprachige MA)
- 🇨🇿 Cestina (Tschechisch)
- 🇸🇰 Slovencina (Slowakisch)
- 🇵🇱 Polski (Polnisch)
- 🇬🇧 English
- 🇷🇴 Romana (Rumaenisch)
- 🇺🇦 Ukrayinska (Ukrainisch)

Weitere Sprachen koennen jederzeit ergaenzt werden (sind nur Zeilen in der Konfiguration). Gemini unterstuetzt nahezu alle Weltsprachen.

**Wirkung der Sprach-Wahl:**
1. **Komplette UI** der App wird in der gewaehlten Sprache angezeigt (Buttons, Labels, Dialoge)
2. **Empfangene Nachrichten/Anweisungen** werden automatisch in die gewaehlte Sprache uebersetzt
3. **Eigene Nachrichten** werden vor dem Senden in die Sprache des Empfaengers uebersetzt (Default: Deutsch fuer Thomas)
4. **Spracheingabe** versucht in der gewaehlten Sprache zu transkribieren

**Speicherung:** PIN-gebunden in IndexedDB. Bleibt erhalten zwischen App-Starts.

## 4.7 Bauteam-Animation (HOCHGESETZT)

Die `BauteamAnimation`-Komponente aus der Master-App (`tw-shared-components.jsx` ab Zeile 891) wird **1:1 uebernommen**, aber **vertikal hochgesetzt**, damit sie **ohne Scrollen sichtbar** ist.

**Aktuelle Master-App-Position:** Unter den 5 Verbindungs-Buttons (zu weit unten auf Mitarbeiter-Handys).

**Neue Position in der Mitarbeiter-App:** Direkt unterhalb des Uhr-Blocks und der Sprach-Auswahl, also dort, **wo in der Master-App die Buttons "Gemini KI" und "Google Drive" stehen wuerden** (untere Kante dieser virtuellen Buttons).

**Implementation-Hinweis:** Da die Verbindungs-Buttons komplett entfallen, ist der Platz frei. Animation einfach naeher an den Uhr-Block heranruecken (ca. 16-24px Abstand).

## 4.8 Status-Indikator-Leiste (NEU, OPTIONAL)

Direkt unterhalb der Bauteam-Animation eine kleine, dezente Leiste mit:
- 🟢 Online / 🔴 Offline / 🟡 Synchronisiert
- "Letzter Sync: vor X Min"
- Falls ungelesene Nachrichten: 🔔 X neue Nachrichten

Auf Klick: Springt zum Nachrichten-Modul.

## 4.9 Footer (UNVERAENDERT)

Falls Master-App einen Footer hat (Status-Bar mit Drive-Status), wird dieser entfernt — Mitarbeiter-App braucht keinen.

## 4.10 Layout-Skizze (Textuell)

```
+--------------------------------------------------+
| ←Zurueck Vor→     Baustellen App     A↑Gross    |  Header (Master-App-Optik)
+--------------------------------------------------+
| [Start] [Baustellen] [Kalender] [Fotos]         |
| [Stunden] [Nachrichten]                          |  6 Modul-Buttons (3x2 oder Scroll)
+--------------------------------------------------+
|                                                  |
|             [TW-Logo gross]                      |  Header-Bereich
|     Flurweg 14a · 56472 Nisterau · ...           |
|             BAUSTELLEN APP                       |
|                                                  |
+--------------------------------------------------+
|                                                  |
|              [GROSSE UHR 14:23]                  |  Uhr-Block (1:1 Master-App)
|                FREITAG 18.04                     |
|                                                  |
+--------------------------------------------------+
|              [🇩🇪 Deutsch ▼]                      |  Sprach-Auswahl
+--------------------------------------------------+
|                                                  |
|         [BAUTEAM-ANIMATION laeuft]               |  Bauteam-Animation (hochgesetzt)
|                                                  |
+--------------------------------------------------+
| 🟢 Online · letzter Sync vor 2 Min · 🔔 3 neu    |  Status-Indikator
+--------------------------------------------------+
```

---

# 5. NAVIGATIONSLEISTE — DIE 6 MODUL-BUTTONS

## 5.1 Routing-Logik

Die Top-Level-Komponente `MAApp` haelt einen State `aktiverTab` mit den moeglichen Werten:
`'start' | 'baustellen' | 'kalender' | 'fotos' | 'stunden' | 'nachrichten'`

Beim Klick auf einen Modul-Button wird `setAktiverTab(...)` aufgerufen. Conditional Rendering zeigt das passende Modul.

**Wichtig:** Die Header-Leiste mit den 6 Buttons ist **immer sichtbar**, egal in welchem Modul der Mitarbeiter sich befindet. Schnelles Wechseln muss moeglich sein.

## 5.2 Aktiver Modul-Indikator

- **Aktiver Modul-Button** hat einen leuchtenderen Shadow + dickeren Rand (z.B. `border: 2px solid #fff` zusaetzlich zum Gradient)
- **Inaktive Buttons** haben den normalen Stil

## 5.3 Modul-Wechsel mit ungespeicherten Aenderungen

Wenn der Mitarbeiter z.B. einen Stundenzettel halb ausgefuellt hat und auf "Fotos" klickt:
- App speichert den Stundenzettel-Entwurf **automatisch** in IndexedDB als WIP (analog zur Master-App `TWStorage.saveWip`)
- Wechsel ist sofort
- Beim Zurueckkehren ins Stunden-Modul wird der Entwurf geladen
- Optional: Kleines Toast-Banner unten "💾 Entwurf gespeichert"

## 5.4 Buttons im Detail

| Button | Label (DE) | Symbol | Funktion |
|---|---|---|---|
| **Start** | Start | Haus | Zurueck zur Startseite (Uhr, Animation, Sprach-Wahl) |
| **Baustellen** | Baustellen | Helm | Baustellen-Liste, Auswahl, 4-Ordner-Detail (Kapitel 6) |
| **Kalender** | Kalender | Kalender | Eigener Schichtplan, Baustellen-Zuteilung, Urlaub (Kapitel 7) |
| **Fotos** | Fotos | Kamera | Foto-Aufnahme mit Wand-Zuordnung und 3 Phasen + 20 allgemeine (Kapitel 8) |
| **Stunden** | Stunden | Uhr | Stundenzettel-Formular mit Material-Popup, PDF-Export (Kapitel 9) |
| **Nachrichten** | Nachrichten | Sprechblase | Chat mit Thomas + Anweisungs-Pinnwand (Kapitel 10) |

## 5.5 Mehrsprachige Labels

Die Labels werden in der gewaehlten UI-Sprache angezeigt. Beispiel-Tabelle:

| Tab-ID | DE | CZ | EN | PL |
|---|---|---|---|---|
| start | Start | Start | Start | Start |
| baustellen | Baustellen | Stavby | Sites | Budowy |
| kalender | Kalender | Kalendar | Calendar | Kalendarz |
| fotos | Fotos | Fotky | Photos | Zdjecia |
| stunden | Stunden | Hodiny | Hours | Godziny |
| nachrichten | Nachrichten | Zpravy | Messages | Wiadomosci |

Mapping-Tabelle in `tw-ma-translation.js` als Konstante `UI_LABELS`. Bei Sprach-Wechsel: Re-Render der Navigationsleiste.


---

# 6. MODUL: BAUSTELLEN

## 6.1 Zweck

Der Mitarbeiter kann hier alle ihm freigegebenen Baustellen einsehen und in die jeweiligen Ordner einsteigen.

## 6.2 Hauptansicht: Baustellen-Liste

**Datenquelle:** Firebase `aktive_baustellen/` (von Thomas in Master-App freigegeben).

**Layout:** Liste der freigegebenen Baustellen, eine pro Zeile, gross genug fuer den Daumen-Tipp.

**Pro Eintrag wird angezeigt:**
- **Baustellen-Name** (gross, Oswald, weiss)
- **Adresse / Bauherr** (kleiner, Source Sans, gedaempft)
- **Status-Badge:** "Aktiv" (gruen), "Pausiert" (gelb), "Beendet" (grau)
- **Mini-Indikator:** wie viele neue Dateien seit letzter Sicht (Badge mit Zahl)

**Sortierung:** Aktivste zuerst (zuletzt angefasste Baustelle ganz oben).

**Suchfeld:** Oben ein Such-Input, das nach Name/Adresse filtert. Wichtig fuer MA, die viele Baustellen haben.

## 6.3 Detail-Ansicht: 4 Ordner-Kacheln

Bei Klick auf eine Baustelle oeffnen sich **4 grosse Kacheln** (2x2-Grid):

| Kachel | Drive-Quelle | Mitarbeiter-Rechte |
|---|---|---|
| **Zeichnungen** | `Staging/.../Zeichnungen` | Lesen, Anschauen, KEINE Aenderung |
| **Bilder** | `Staging/.../Bilder` | Lesen + Hochladen |
| **Stunden** | `Staging/.../Stunden` | Lesen (nur eigene) + Hochladen |
| **Nachrichten** | `Staging/.../Baustellen-App` (UI-Name "Nachrichten") | Lesen |

**Kachel-Optik:**
- Identische Gradient-Optik wie die Modul-Buttons
- Icon gross zentral
- Titel darunter
- Mini-Counter unten: "12 Dateien" oder "3 neue"

## 6.4 Ordner-Browser

Bei Klick auf eine Kachel oeffnet sich der **Ordner-Browser** — ein einfacher, mobil-optimierter Datei-Browser.

**Funktionen:**
- **Liste** aller Dateien und Unterordner im aktuellen Pfad
- **Breadcrumb-Navigation** oben (Baustelle / Ordner / Unterordner)
- **Datei-Vorschau** beim Tippen:
  - Bilder: inline anzeigen
  - PDF: in eingebettetem Viewer (PDF.js oder Browser-nativ)
  - Word/Excel: Download-Hinweis "Datei kann nur via Browser geoeffnet werden"
- **Zurueck-Button** oben links

**KEINE Funktionen** (im Vergleich zum Master-App-Browser):
- Kein "Aus Original nachladen"
- Kein Loeschen
- Kein Umbenennen
- Kein direkter Drive-Link teilen

## 6.5 Spezialfall: "Nachrichten"-Kachel mit logischen Filtern

Beim Klick auf die "Nachrichten"-Kachel oeffnet sich eine **Sub-Auswahl mit drei Filter-Tabs**:

| Filter-Tab | Inhalt |
|---|---|
| **Kalender** | Kalender-bezogene Dateien (z.B. Wochenplan, Termin-PDFs) |
| **Nachrichten** | Korrespondenz-Dateien |
| **Anweisungen** | Anweisungs-PDFs, Materiallisten, Sicherheits-Hinweise |

**Implementation:** Die Filter sind **dateinamen-basiert** oder **praefix-basiert**:
- Dateien mit Praefix `KALENDER_*` → Filter Kalender
- Dateien mit Praefix `NACHRICHT_*` → Filter Nachrichten
- Dateien mit Praefix `ANWEISUNG_*` → Filter Anweisungen
- Dateien ohne Praefix → Filter "Alle" (default Anweisungen)

Diese Praefixe werden von der Master-App beim Hochladen vergeben.

**Wichtig:** Diese Filter sind **nur logisch** — der Drive-Ordner bleibt eine flache Struktur "Baustellen-App", keine echten Subfolder.

## 6.6 Offline-Verhalten

- **Ordner-Liste:** Wird bei jedem Aufruf live von Drive geladen, **kein Offline-Cache** (Aenderungen kommen schnell)
- **Geoeffnete Dateien:** Werden temporaer im IndexedDB-Cache abgelegt fuer schnellen Re-Open
- **Bei Offline:** Anzeige "🔴 Offline — gecachte Inhalte werden gezeigt"

---

# 7. MODUL: KALENDER

> **Annahme (von Thomas zu bestaetigen):** Der Kalender zeigt eigene Schichten + Baustellen-Zuteilung + Urlaubstage. Quelle ist die Master-App via Firebase. Der Mitarbeiter kann **lesen**, aber **nicht aendern**.

## 7.1 Zweck

Der Mitarbeiter sieht auf einen Blick:
- An welcher Baustelle er heute / diese Woche / naechste Woche eingeteilt ist
- Wann er Urlaub hat
- Welche Termine fix sind (z.B. Bauherrentermin)
- Schnellzugriff auf die Wochen-/Monatsansicht

## 7.2 Hauptansicht: Monatskalender

**Layout:** Klassischer Monatskalender, mobil-optimiert.

**Pro Tag wird angezeigt:**
- Tag-Nummer
- Baustellen-Code (z.B. "MEY" fuer Meyer-Baustelle) als farbiger Balken
- Bei Urlaub: 🏖️ Symbol
- Bei Termin: 📌 Symbol
- Bei mehreren Eintraegen: Stapel-Indikator "+2"

**Farbcodierung:**
- Jede Baustelle hat eine zugewiesene Farbe (vom System automatisch oder von Thomas vergeben)
- Urlaub: gelb
- Krankheit: rot

## 7.3 Tagesdetail

Klick auf einen Tag oeffnet **Tagesdetail-Ansicht**:
- Datum gross oben
- Liste aller Eintraege fuer diesen Tag
- Pro Eintrag: Baustelle, Uhrzeit (von-bis), Bemerkung
- Bei Klick auf Baustelle: Sprung in Baustellen-Detail (Modul 6)

## 7.4 Wochenansicht (Toggle)

Toggle-Button oben "Monat / Woche" — Wochenansicht zeigt die ganze Woche untereinander mit allen Eintraegen.

## 7.5 Datenquelle

**Firebase-Pfad:** `kalender/{geraete-id}/{datum-yyyymmdd}/`

**Eintrags-Struktur:**
```json
{
  "baustelle_id": "meyer-2026-04",
  "baustelle_name": "Meyer Bad-Neusanierung",
  "von": "07:00",
  "bis": "16:30",
  "typ": "arbeit" | "urlaub" | "krankheit" | "termin",
  "bemerkung": "Material wird um 8 Uhr geliefert"
}
```

## 7.6 Lese-Recht only

Der Mitarbeiter kann **nichts aendern** — Aenderungen macht Thomas in der Master-App. Falls der MA einen Eintrag korrigieren moechte (z.B. "Habe nur bis 15 Uhr gearbeitet"), muss er das **per Nachricht** an Thomas schicken.

## 7.7 Sprach-Lokalisierung

Monatsname, Wochentage, Eintraegs-Bezeichnungen ("Urlaub", "Krankheit") werden in der UI-Sprache angezeigt.

---

# 8. MODUL: FOTOS — DAS HERZSTUECK

## 8.1 Zweck

Der Mitarbeiter dokumentiert die Baustelle fotografisch in **drei Bauphasen** (Rohzustand, Abdichtung, Fertigstellung) **wandweise**, ergaenzt durch **bis zu 20 allgemeine Fotos** pro Baustelle. **Pro Foto** kann der MA per Sprache eine Notiz hinzufuegen, die automatisch ins Deutsche uebersetzt wird.

**Wichtig:** **KEINE KI-Foto-Analyse** in der Mitarbeiter-App (Kosten + Komplexitaet). Aufnahme + Sync zur Master-App, dort macht Thomas die Analyse.

## 8.2 Workflow: vom Antippen bis zur Sync

```
[Modul oeffnen]
        ↓
[Baustelle auswaehlen]
        ↓
[Raum auswaehlen oder neuen Raum anlegen]
        ↓
[Wandzahl fuer den Raum festlegen (4-8 Wand-Kacheln)]
        ↓
[Phase auswaehlen: Rohzustand | Abdichtung | Fertigstellung]
        ↓
[Wand-Kachel antippen]
        ↓
[Kamera oeffnet, Foto aufnehmen]
        ↓
[Optional: Sprach-Notiz aufzeichnen → Transkription + Uebersetzung]
        ↓
[Speichern]
        ↓
[Sync zu Drive (automatisch sobald online)]
```

## 8.3 Stufe 1: Baustelle waehlen

Liste aller freigegebenen Baustellen (gleiche Datenquelle wie Modul 6). Tippen → weiter.

## 8.4 Stufe 2: Raum waehlen oder neu anlegen

**Raum-Liste:** Alle Raeume, die fuer diese Baustelle bereits angelegt wurden (lokal in IndexedDB + sync zu Drive).

**"Neuer Raum"-Button:** Oeffnet Dialog mit:
- **Raum-Bezeichnung** (Text-Input mit Spracheingabe-Mic-Button)
- **Raum-Nummer** (optional, Text-Input)
- **Geschoss** (Dropdown: KG, EG, OG, DG)
- **Wandzahl** (Buttons: 3, 4, 5, 6, 7, 8 — Auswahl per Tipp)
- **Speichern**-Button

Nach dem Speichern wird der Raum lokal abgelegt und in der Liste angezeigt.

## 8.5 Stufe 3: Phase waehlen

Drei grosse Buttons (volle Bildschirmbreite, gestapelt):

| Button | Farbe | Beschreibung |
|---|---|---|
| **Rohzustand** | Grau-Blau | Vor jeder Arbeit, leerer Raum |
| **Abdichtung / Vorarbeiten** | Orange | Verlegte Abdichtung, Estrich, Putz, Vorarbeiten |
| **Fertigstellung** | Gruen | Komplette Fliesenarbeit fertig |

Pro Phase wird angezeigt: "X von Y Waenden dokumentiert" (Fortschritts-Indikator).

## 8.6 Stufe 4: Wand-Auswahl (das Herzstueck)

**Layout:** Visuelles Wand-Raster — eine Kachel pro Wand des Raumes, plus eine "Boden"-Kachel und eine "Decke"-Kachel (optional).

**Wand-Kachel-Inhalt:**
- Wand-Nummer (z.B. "Wand 1", "Wand 2", ...)
- Wand-Bezeichnung (z.B. "Eingangswand", "Fenster-Wand") — frei editierbar
- **Foto-Thumbnail** falls bereits aufgenommen
- **Status-Badge:** ⚪ leer, 🟡 in Arbeit, ✅ fertig

**Wand-Anordnung:**
- Bei 4 Waenden: 2x2-Grid
- Bei 6 Waenden: 3x2-Grid
- Bei 8 Waenden: 4x2-Grid

Daneben rechts oder unten:
- **Boden** (eine Kachel)
- **Decke** (eine Kachel, optional einblendbar)

**Beim Tippen einer Kachel:** Direkt Kamera oeffnen.

## 8.7 Stufe 5: Foto aufnehmen

**Kamera-Aufruf:** ueber `getUserMedia()` API oder `<input type="file" accept="image/*" capture="environment">` (mobile-faehig).

**Nach der Aufnahme:**
- Vorschau-Dialog mit dem Foto
- Buttons: **Wiederholen** (rotes X) | **Verwenden** (gruener Haken)
- Falls "Verwenden": gehe zu Stufe 6

## 8.8 Stufe 6: Sprach-Notiz hinzufuegen (OPTIONAL aber HERVORGEHOBEN)

**Direkt unter dem Foto:**
- **Mic-Button** (gross, rot, pulsiert wenn nicht gedrueckt) "🎤 Notiz aufnehmen"
- **Text-Input** darunter (kann auch direkt getippt werden)

**Beim Druecken des Mic-Buttons:**
- Web Speech API startet Transkription in der **gewaehlten UI-Sprache** des Mitarbeiters (z.B. Tschechisch)
- Live-Transkription wird im Text-Input angezeigt
- Nach Loslassen oder "Stopp": Transkription steht fest

**Nach der Aufzeichnung:**
- **Original-Text** in MA-Sprache (z.B. CZ) wird angezeigt — der MA sieht, was er gesagt hat
- **Uebersetzter Text** (Deutsch fuer Thomas) wird klein darunter angezeigt
- MA kann beide Versionen vor dem Speichern noch korrigieren
- **Speichern**: Foto + Original-Notiz + Uebersetzung werden lokal gesichert

**Datenstruktur eines Fotos:**
```json
{
  "id": "meyer-bad-wand1-roh-1729012345",
  "baustelle_id": "meyer-bad",
  "raum_id": "bad-1",
  "phase": "rohzustand" | "abdichtung" | "fertigstellung",
  "wand_id": "wand-1" | "boden" | "decke" | "allgemein-3",
  "foto_blob": "<binary>",
  "foto_url_drive": "https://drive.google.com/file/d/...",
  "notiz_original": {
    "sprache": "cz",
    "text": "Tato stena je pripravena na obkladani"
  },
  "notiz_deutsch": "Diese Wand ist bereit zum Fliesen",
  "aufgenommen_am": "2026-04-18T14:30:22Z",
  "aufgenommen_von": "geraet-id-uuid",
  "sync_status": "pending" | "uploaded" | "fehler"
}
```

## 8.9 Allgemeine Fotos (zusaetzlich zu den Wandfotos)

**Position:** Eigener Bereich in Stufe 3 oder 4, **separater Tab** "Allgemein".

**Funktion:**
- Bis zu 20 Fotos pro Baustelle (nicht pro Raum!)
- Numeriert: Allgemein 1, Allgemein 2, ..., Allgemein 20
- Selbe Sprach-Notiz-Funktion wie bei Wandfotos
- Zweck: Schaeden, Materiallieferungen, Probleme, Werkzeug-Standorte, etc.

**Aufruf:** Vom Modul-Hauptscreen aus per Button "📷 Allgemeines Foto" — keine Wand-/Raum-Zuordnung noetig.

## 8.10 Lokale Speicherung

**IndexedDB-Store:** `fotos`
- Foto-Blob (komprimiert vor dem Speichern auf max. 1920px lange Seite, JPEG q=0.85)
- Metadaten (siehe 8.8)
- Sync-Status

**Speicher-Limit:** 1 GB pro Mitarbeiter (analog Master-App). Warnung bei >800 MB.

## 8.11 Sync zu Drive

**Trigger:**
- Automatisch bei Online-Verbindung (Polling alle 60 Sek wenn pending Fotos da)
- Manuell per Sync-Button im Fotos-Modul oben rechts

**Upload-Pfad:** `Staging/{baustelle}/Bilder/{phase}/{raum}/{wand}_{timestamp}.jpg`

**Praefix-Konvention** (damit Master-App die Fotos zuordnen kann):
- Dateiname: `{geraete-id}_{phase}_{raum}_{wand}_{timestamp}.jpg`
- Beispiel: `IVAN_roh_bad-1_wand-1_20260418-143022.jpg`

**Notiz-Datei:** Pro Foto wird eine `.json`-Datei mit gleichem Namen + `.json` hochgeladen, die die Metadaten enthaelt.

## 8.12 Was Mitarbeiter NICHT sehen

- Keine **anderen Mitarbeiter-Fotos** im UI sichtbar (nur die eigenen)
- Keine **KI-Analyse-Ergebnisse** (passiert nur in Master-App)
- Keine **Original-Drive-Pfade** (nur Staging)

---

# 9. MODUL: STUNDEN — STRUKTURIERTES PDF-FORMULAR

## 9.1 Zweck

Mitarbeiter fuellt am Ende des Tages (oder zwischendurch) seinen Stundenzettel aus. Das Ergebnis ist ein **professionelles PDF** im selben Briefkopf-Stil wie die Rechnungen der Master-App, das automatisch in den Staging-Ordner `Stunden` hochgeladen wird.

## 9.2 PDF-Briefkopf

**1:1 derselbe** wie das Rechnungsmodul der Master-App:
- Firmenlogo Thomas Willwacher (Skill `SKILL-jspdf-briefkopf.md`, exakte Koordinaten dort)
- Adresszeile, Telefon
- "Stundenzettel" als Dokumenttitel (statt "Rechnung")
- Datum, Mitarbeitername, Geraete-ID

## 9.3 Formular-Felder (alles per Tap, kein freies Schreiben wo es geht)

| Feld | Typ | Pflicht? | Default |
|---|---|---|---|
| **Datum** | Datepicker | ja | heute |
| **Baustelle** | Dropdown aus aktiven Baustellen | ja | letzte Baustelle |
| **Mitarbeiter** | Auto (aus Geraete-ID) | ja | — |
| **Anfang** | Time-Picker (15-Min-Schritte) | ja | 07:00 |
| **Ende** | Time-Picker (15-Min-Schritte) | ja | 16:30 |
| **Pause** | Dropdown (0, 15, 30, 45, 60 Min) | ja | 30 |
| **Netto-Stunden** | Auto-berechnet | — | — |
| **Taetigkeit** | Multi-Select Pickliste + Freitext | ja | — |
| **Material verwendet?** | Toggle (ja/nein) | ja | nein |
| **Materialliste** | Popup (siehe 9.5) | wenn Material=ja | — |
| **Bemerkung** | Text (mit Spracheingabe) | nein | — |
| **Wetter** | Dropdown (Sonnig, Bewoelkt, Regen, Schnee) | nein | aus Wetter-API automatisch |

## 9.4 Taetigkeits-Pickliste

Vorkonfigurierte Taetigkeiten (per Tap auswaehlbar, mehrere moeglich):

- Fliesen Wand verlegen
- Fliesen Boden verlegen
- Verfugen
- Silikon
- Abdichtung verlegen
- Estrich vorbereiten
- Demontage Altbestand
- Material liefern / einraeumen
- Vorbereitung / Einrichtung Baustelle
- Endreinigung
- Kundengespraech / Aufmass
- Fahrzeit
- Sonstiges (Freitext)

## 9.5 Material-Popup (das wichtige Feature)

**Aufgerufen ueber:** Toggle "Material verwendet?" → ja → Button "Materialien hinzufuegen"

**Popup-Layout:**
- **Suchfeld** oben (filtert die Material-Liste)
- **Material-Kategorien** als Tab-Navigation:
  - Fliesen
  - Kleber / Moertel
  - Fugenmasse
  - Silikon / Dichtmittel
  - Abdichtung
  - Hilfsmittel (Kreuze, Keile, Schienen)
  - Werkzeug
  - Sonstiges
- **Material-Liste** mit Vorschau-Bild + Name
- **Pro Material:** ein Tap-to-Add-Button

**Beim Hinzufuegen eines Materials:**
- Material wandert in die "Verwendet"-Liste unten
- **Mengen-Input** erscheint (Zahl + Einheit, z.B. "5 kg" oder "12 Stueck")
- **Spracheingabe-Mic** fuer schnelle Mengen-Eingabe ("zwei komma fuenf Kilo" → 2.5 kg)
- **Loeschen-Button** (rotes X)

**Datenquelle Material-Liste:**
- **Statisch in `tw-ma-config.js`** (kann von Thomas in Master-App spaeter erweitert werden via Firebase-Sync)
- Beispiel-Eintraege:
  ```json
  [
    { "kategorie": "Kleber", "name": "Sopro Trasflexkleber", "default_einheit": "kg", "verpackung_kg": 25 },
    { "kategorie": "Fugenmasse", "name": "PCI Nanofug Premium silbergrau", "default_einheit": "kg", "verpackung_kg": 5 },
    { "kategorie": "Silikon", "name": "Otto Novasil S70 grau", "default_einheit": "Kartusche", "verpackung_kg": null }
  ]
  ```

## 9.6 Bemerkungs-Feld mit Spracheingabe

**Wie beim Foto-Modul:**
- Mic-Button gross daneben
- Web Speech API in MA-Sprache
- Original-Text + Deutsch-Uebersetzung beide angezeigt
- Beide werden im PDF abgedruckt (Original als Untertitel, Deutsch als Haupttext)

## 9.7 PDF-Erzeugung

**Bei "Speichern":**
1. Alle Felder validieren (Pflichtfelder ausgefuellt?)
2. Net-Stunden berechnen: (Ende - Anfang) - Pause
3. PDF erzeugen via jsPDF mit Briefkopf (siehe `SKILL-jspdf-briefkopf.md`)
4. PDF lokal in IndexedDB speichern (Cache)
5. Sync zu Drive triggern

**PDF-Inhalt (Reihenfolge):**
1. Briefkopf (Firmenlogo + Adresse)
2. Titel "Stundenzettel"
3. Datum, Baustelle, Mitarbeiter (Tabelle)
4. Arbeitszeiten (Tabelle: von, bis, Pause, Netto)
5. Taetigkeiten (Liste)
6. Material (Tabelle: Material, Menge, Einheit) — wenn vorhanden
7. Bemerkung (Block, beide Sprachen)
8. Wetter
9. Footer: "Erstellt mit TW Baustellen-App am ..."

**Dateiname:** `{geraete-id}_Stundenzettel_{datum-yyyymmdd}.pdf`
Beispiel: `IVAN_Stundenzettel_20260418.pdf`

## 9.8 WIP-Speicherung (Entwurf)

Wenn der Mitarbeiter das Formular nicht fertig ausfuellt und Modul wechselt:
- **Auto-Save** in IndexedDB nach jedem Feld-Aenderung
- Beim Wiederbetreten: WIP wird geladen, Toast "💾 Entwurf wiederhergestellt"
- Erst beim Klick auf "Speichern und PDF erstellen" wird PDF erzeugt und Sync getriggert

## 9.9 Eigene Stunden-Historie

Auf der Stunden-Modul-Hauptseite:
- **Reiter "Heute"** — neuer Stundenzettel oder bereits abgegebener
- **Reiter "Diese Woche"** — Liste aller Stundenzettel
- **Reiter "Letzten 30 Tage"** — Listen-Ansicht

Bei Klick auf einen alten Eintrag: PDF anschauen (read-only).

**Wichtig:** MA sieht **NUR EIGENE** Stunden, nie die anderer Mitarbeiter.

---

# 10. MODUL: NACHRICHTEN — WHATSAPP-STIL MIT LIVE-UEBERSETZUNG

## 10.1 Zweck

Bidirektionaler Chat zwischen Mitarbeiter und Thomas (Buero), mit **automatischer Live-Uebersetzung** in beide Richtungen. Optik und Geschwindigkeit wie WhatsApp, aber mit dem entscheidenden Unterschied: Sprachbarriere ist aufgehoben.

## 10.2 Layout

**Hauptansicht:** Chat-Liste-Optik wie WhatsApp:
- **Linker Bereich** (auf Tablet/Desktop) oder **eigene Seite** (auf Handy):
  - Liste aller Konversationen
  - Pro Konversation: Avatar, Name (z.B. "Buero (Thomas)"), letzte Nachricht (Vorschau), Zeitstempel, ungelesen-Badge
- **Rechter Bereich** oder **Detailseite:**
  - Chat-Verlauf (Bubbles links/rechts)
  - Eingabefeld unten mit Mic + Senden-Button

## 10.3 Konversationen

In der ersten Version: **eine Konversation pro Mitarbeiter** (1:1 mit Thomas).

Spaeter erweiterbar (nicht in Etappe 1):
- Gruppen-Chat pro Baustelle
- Broadcast-Anweisungen (alle MA einer Baustelle)

## 10.4 Nachrichten-Bubble

**Eigene Nachricht (rechts, blau):**
- Top: Original-Text (in MA-Sprache, voller Schwarz-Anteil)
- Mitte: 🌐-Symbol als visueller Trenner
- Bottom: **Uebersetzung** (in DE), kleiner und gedaempft
- Footer: Zeit + Status (✓ gesendet, ✓✓ angekommen, ✓✓ blau = gelesen)

**Empfangene Nachricht (links, weiss/grau):**
- Top: **Uebersetzte Version** (in MA-Sprache, voller Schwarz)
- Mitte: 🌐-Symbol
- Bottom: Original-Text (in DE), kleiner und gedaempft
- Footer: Zeit, Absender ("Thomas")

**Warum beide Versionen sichtbar?**
Thomas hat explizit erwaehnt: **Uebersetzungen koennen fehlschlagen**. Beide Sprachen anzuzeigen ist das Sicherheitsnetz. Bei kniffligen Stellen kann der Empfaenger die Original-Version pruefen oder rueckfragen.

## 10.5 Nachricht senden (Workflow)

```
[MA tippt Nachricht in MA-Sprache, z.B. CZ]
        ↓
[Mic-Button optional fuer Spracheingabe]
        ↓
[Senden-Button]
        ↓
[App ruft Gemini Flash mit Original + Ziel-Sprache auf]
        ↓
[Uebersetzung wird in der Bubble angezeigt]
        ↓
[Beide Versionen werden in Firebase gespeichert]
        ↓
[Thomas-App empfaengt via Firebase-Listener (sehr schnell, <1s)]
```

## 10.6 Mic-Button (Spracheingabe)

Identisches Pattern wie in den anderen Modulen:
- Web Speech API in MA-Sprache
- Live-Transkription waehrend des Sprechens
- Nach Loslassen: Original-Text steht im Eingabefeld
- MA kann editieren oder direkt "Senden"

## 10.7 Anweisungs-Tab (Broadcast von Thomas)

**Zweiter Tab im Nachrichten-Modul: "Anweisungen"**

Hier landen alle Broadcast-Nachrichten/Anweisungen von Thomas, die an alle MA einer Baustelle gehen:
- Pinnwand-Optik (Karten untereinander, neueste oben)
- **Lesen-Quittung:** MA tippt "Gelesen" → wird in Firebase markiert, Thomas sieht Lese-Status in Master-App
- **Pflicht-Anweisungen** koennen mit "Akzeptieren"-Button versehen sein (z.B. Sicherheitsbelehrung)

**Anweisungs-Karte:**
- Titel
- Voller Text (Original + Uebersetzung)
- Datum
- Anhang (optional, z.B. PDF-Sicherheitsbelehrung)
- Lese-Status

## 10.8 Push-Benachrichtigungen (PWA)

- Bei neuer Nachricht: Push-Notification an MA-Geraet (sofern Berechtigung erteilt)
- Bei neuer Anweisung: ebenso
- Click auf Notification → oeffnet App im Nachrichten-Tab

**Implementation:** Service Worker mit `pushManager.subscribe()`, Versand via Firebase Cloud Messaging (FCM).

## 10.9 Datenstruktur in Firebase

**Pfad:** `nachrichten/{geraete-id}/{nachrichten-id}`

```json
{
  "id": "msg-20260418-143022",
  "richtung": "von_buero" | "von_ma",
  "absender_name": "Thomas" | "Ivan",
  "original": {
    "sprache": "de",
    "text": "Bitte fang um 8 Uhr an, Material kommt um 7:30."
  },
  "uebersetzung": {
    "sprache": "cz",
    "text": "Prosim, zacni v 8 hodin, material prijde v 7:30."
  },
  "gesendet_am": "2026-04-18T14:30:22Z",
  "gelesen_am": null,
  "anhang_url": null,
  "typ": "chat" | "anweisung",
  "baustelle_id": "meyer-bad" | null
}
```

## 10.10 Latenz-Garantie

Ziel: **Nachricht erscheint beim Empfaenger in unter 2 Sekunden** (Online-Bedingungen vorausgesetzt).

Aufschluesselung:
- Gemini-Uebersetzungs-Aufruf: ~500-800ms (Gemini Flash ist schnell)
- Firebase-Schreiben: ~200ms
- Firebase-Listener-Trigger beim Empfaenger: ~100ms
- UI-Render: ~50ms

**Worst Case:** ~1.2 Sekunden. Gefuehlt sofort.

## 10.11 Offline-Verhalten

- **Senden offline:** Nachricht wird lokal mit Status "wartet" markiert, sobald online → Gemini-Aufruf + Firebase-Push
- **Empfangen offline:** Beim naechsten Online-Gehen werden alle ausstehenden Nachrichten gepullt


---

# 11. UEBERSETZUNGS-INFRASTRUKTUR

## 11.1 Engine: Google Gemini Flash

**Modell:** `gemini-2.5-flash` (schnell, billig, qualitativ ausreichend)

**Fallback bei Fehler:** `gemini-2.5-pro` (langsamer, aber zuverlaessiger)

**Fallback bei Total-Ausfall:** Original-Text wird mit Warn-Hinweis "⚠️ Uebersetzung fehlgeschlagen" gesendet — **niemals stille Stille**.

## 11.2 API-Key-Management

**Wichtigster Punkt:** Mitarbeiter sieht **NIE** einen API-Key oder muss sich einloggen.

**Implementation:**
1. **Erzeugung:** Thomas legt einen separaten Gemini-API-Key in der Google Cloud Console an (NICHT der Master-App-Key)
2. **Verschluesselung:** Key wird mit AES-256 verschluesselt, Master-Passwort ist statisch in `tw-ma-config.js` (vor Auslieferung von Hand eingebaut)
3. **Einbau:** Verschluesselter String + Master-Passwort liegen beide im App-Code, aber nur der App-Build-Prozess weiss, wie sie zusammenkommen
4. **Laufzeit:** Beim App-Start wird der Key entschluesselt in einer Closure abgelegt, niemals im Klartext in `localStorage` oder Window-Variablen

**Schutz vor Code-Inspection:** Bei einer Browser-App ist absoluter Schutz unmoeglich (Konzept-PDF Kapitel 9 ist ehrlich darueber). Die Maske erschwert es genug, dass Gelegenheitskopierer scheitern.

**Rotation:** Alle 30 Tage erzeugt Thomas einen neuen Key, alter wird in der Console deaktiviert. App-Update via GitHub Pages ist ein Knopfdruck.

## 11.3 Wrapper-API in `tw-ma-translation.js`

Eine zentrale Funktion fuer alle Uebersetzungen:

```javascript
// tw-ma-translation.js
window.TWMATranslate = {
  /**
   * Uebersetzt einen Text in die Zielsprache.
   * @param {string} text - Zu uebersetzender Text
   * @param {string} fromLang - Quellsprache (BCP-47, z.B. 'de', 'cz')
   * @param {string} toLang - Zielsprache
   * @returns {Promise<{text: string, success: boolean, error?: string}>}
   */
  async translate(text, fromLang, toLang) {
    if (fromLang === toLang) return { text: text, success: true };
    // ... Gemini-Aufruf mit Prompt:
    // "Translate the following from {fromLang} to {toLang}.
    //  Return ONLY the translation, no explanation, no quotes."
    // ... Fallback bei Fehler
  },

  /**
   * Erkennt die Sprache eines Textes (falls nicht bekannt)
   */
  async detectLanguage(text) { /* ... */ },

  /**
   * Uebersetzt ein UI-Label (mit Cache, da sehr oft aufgerufen)
   */
  uiLabel(key, lang) {
    // 1. Pruefe Hard-Coded-Tabelle UI_LABELS in tw-ma-config.js
    // 2. Falls nicht da: aufruf translate() und cache in IndexedDB
  },
};
```

## 11.4 UI-Label-Tabelle (statische Uebersetzungen)

Fuer haeufige UI-Texte (Button-Labels, Modul-Namen, Standard-Dialoge) ist eine **statische Tabelle** in `tw-ma-config.js` hinterlegt — schneller als API-Call, kein Latenz-Spike beim Sprach-Wechsel.

```javascript
window.UI_LABELS = {
  start: { de: 'Start', cz: 'Start', en: 'Start', pl: 'Start', sk: 'Start', ro: 'Start', ua: 'Start' },
  baustellen: { de: 'Baustellen', cz: 'Stavby', en: 'Sites', pl: 'Budowy', sk: 'Stavby', ro: 'Santiere', ua: 'Budivnytstvo' },
  kalender: { de: 'Kalender', cz: 'Kalendar', en: 'Calendar', pl: 'Kalendarz', sk: 'Kalendar', ro: 'Calendar', ua: 'Kalendar' },
  fotos: { de: 'Fotos', cz: 'Fotky', en: 'Photos', pl: 'Zdjecia', sk: 'Fotky', ro: 'Foto', ua: 'Foto' },
  stunden: { de: 'Stunden', cz: 'Hodiny', en: 'Hours', pl: 'Godziny', sk: 'Hodiny', ro: 'Ore', ua: 'Hodyny' },
  nachrichten: { de: 'Nachrichten', cz: 'Zpravy', en: 'Messages', pl: 'Wiadomosci', sk: 'Spravy', ro: 'Mesaje', ua: 'Povidomlennya' },
  speichern: { de: 'Speichern', cz: 'Ulozit', en: 'Save', pl: 'Zapisz', sk: 'Ulozit', ro: 'Salveaza', ua: 'Zberehty' },
  abbrechen: { de: 'Abbrechen', cz: 'Zrusit', en: 'Cancel', pl: 'Anuluj', sk: 'Zrusit', ro: 'Anuleaza', ua: 'Skasuvaty' },
  // ... weitere ~100 Standard-Labels
};
```

Diese Tabelle wird beim Bau der ersten Etappe vorbefuellt und kann jederzeit erweitert werden.

## 11.5 Caching von dynamischen Uebersetzungen

Damit nicht **dieselbe Phrase 100x uebersetzt wird** (Geld + Latenz):

- **IndexedDB-Store:** `translation_cache`
- **Key:** `{fromLang}_{toLang}_{md5(text)}`
- **Value:** uebersetzter Text
- **TTL:** 90 Tage

Beim Aufruf von `translate()` wird zuerst der Cache geprueft.

## 11.6 Kosten-Monitoring

In `tw-ma-config.js`:
- Counter fuer API-Calls (taeglich, woechentlich, monatlich)
- Bei Erreichen einer **Tageslimit-Schwelle** (z.B. 1000 Calls): Warnung an Thomas via Firebase
- Bei Erreichen eines **Monatslimits** (z.B. 30.000 Calls): App schaltet auf "Notbetrieb" — keine automatische Uebersetzung, MA muss manuell triggern

So bleibt's auch im Worst-Case unter 50 € im Jahr.

---

# 12. SYNC-MECHANIK

## 12.1 Drei Sync-Kanaele

| Kanal | Daten | Zielsystem | Frequenz |
|---|---|---|---|
| **Drive-Push** | Fotos, Stundenzettel-PDFs | Google Drive Staging | Auto bei Online + manuell |
| **Drive-Pull** | Zeichnungen, Anweisungen, Materiallisten | Google Drive Staging | Auto bei Modul-Oeffnen + manuell |
| **Firebase Realtime** | Nachrichten, Kalender, Geraete-Whitelist, Anweisungs-Status | Firebase | Live-Listener |

## 12.2 Service-Account fuer Drive

**Erzeugung:** Thomas legt in Google Cloud Console einen Service-Account an, gibt ihm **NUR Lese-/Schreib-Zugriff auf den Staging-Root-Ordner** (z.B. `Baustellen-App-Staging`).

**Einbau in App:**
- JSON-Key wird AES-256 verschluesselt (analog Gemini-Key)
- Liegt in `tw-ma-config.js`
- Beim App-Start wird Service-Account-OAuth-Flow durchlaufen (silent, kein User-Dialog)

**Wichtig:** Der Service-Account hat **keinen Zugriff auf die Original-Kundenordner** ("Baustellen neu"). Selbst bei Kompromittierung sind die Originale sicher.

## 12.3 Drive-Push (von App zu Drive)

**Was wird gepusht:**
- Foto-Blobs aus IndexedDB
- Foto-Metadata-JSONs
- Stundenzettel-PDFs

**Sync-Queue:**
- IndexedDB-Store `sync_queue` mit Eintraegen `{ typ, datei, ziel_pfad, status, retries }`
- Worker laeuft alle 30s wenn online und Queue nicht leer
- Bei Fehler: 3x Retry mit exponential backoff (30s, 2min, 10min)
- Nach 3 Fehlern: Eintrag bleibt mit Status "fehler", Anzeige im UI

**Path-Schema:**
```
Staging/
└── {baustelle-name}/
    ├── Bilder/
    │   ├── {phase}/
    │   │   ├── {raum}/
    │   │   │   ├── {geraete-id}_{wand}_{timestamp}.jpg
    │   │   │   └── {geraete-id}_{wand}_{timestamp}.json
    │   │   └── ...
    │   └── allgemein/
    │       ├── {geraete-id}_allgemein_{n}_{timestamp}.jpg
    │       └── {geraete-id}_allgemein_{n}_{timestamp}.json
    ├── Stunden/
    │   └── {geraete-id}_Stundenzettel_{datum}.pdf
    ├── Zeichnungen/  (read-only)
    └── Baustellen-App/  (read-only, UI-Name "Nachrichten")
```

## 12.4 Drive-Pull (von Drive zu App)

**Was wird gepullt:**
- Datei-Listings (beim Oeffnen eines Ordner-Browsers)
- Konkrete Datei-Inhalte (beim Antippen einer Datei)

**Caching:**
- Listings: 5 Min TTL
- Datei-Inhalte: 24h TTL (oder bis Modul geschlossen)

## 12.5 Firebase Realtime Sync

**Listener fuer:**
- `geraete/{geraete-id}/status` — eigene Geraete-Status (aktiv, gesperrt, gewipt)
- `aktive_baustellen/` — Liste freigegebener Baustellen
- `nachrichten/{geraete-id}/` — eingehende Nachrichten
- `anweisungen/{baustelle-id}/` — Broadcast-Anweisungen
- `kalender/{geraete-id}/` — eigene Kalender-Eintraege

**Schreib-Operationen:**
- Eigene gesendete Nachrichten
- Lese-Bestaetigungen fuer Anweisungen
- Letzter-Online-Zeitstempel (heartbeat alle 60s)

## 12.6 Geraete-Onboarding

**Prozess (siehe Konzept-PDF Kapitel 6.3):**

1. App startet erstmals → erkennt: keine Geraete-ID lokal
2. App erzeugt UUID (z.B. `device-{uuid-v4}`)
3. App zeigt **6-stelligen Anmelde-Code** (Random)
4. MA gibt diesen Code an Thomas weiter (Telefon, WhatsApp)
5. Thomas oeffnet Master-App-Modul "BaustellenAppAdmin", sieht Wartepunkt, gibt Code ein, vergibt Namen ("Ivan"), bestaetigt
6. App pollt alle 5s `geraete/{geraete-id}/status` — sobald `freigegeben`, wird die App entsperrt
7. Beim ersten echten Login: MA waehlt eine 4-6-stellige PIN
8. PIN-Hash wird in Firebase abgelegt
9. Ab jetzt: bei jedem App-Start PIN-Abfrage

## 12.7 PIN-Schutz

- **5 falsche PIN-Versuche** → Lokale Daten loeschen + Firebase informieren
- **PIN-Aenderung** nur durch Thomas in Master-App ausloesbar (Reset-Funktion)

## 12.8 Remote Wipe

Wenn Thomas in Master-App `geraete/{geraete-id}/status = wipe` setzt:
- App pruegt beim naechsten Online-Aufruf Status
- Bei `wipe`: alle IndexedDB-Stores leeren, Service-Worker-Cache leeren, dann App-Reload
- Nutzer sieht "Geraet wurde zurueckgesetzt — bitte erneut einrichten"

---

# 13. DESKTOP-ICON & PWA-MANIFEST

## 13.1 Icon-Konzept

**Motiv:** Stilisierter Bauhelm in TW-Akzentblau mit Orange-Highlights, **mit "TW"-Monogramm** auf dem Helm-Schild.

**Stilrichtung:**
- Modern, flach, minimalistisch (kein Skeuomorphismus)
- Klare Konturen, gut auf kleinen Groessen lesbar
- Akzent-Farben: TW-Blau (#1E88E5), Orange (#e67e22), Weiss
- Hintergrund: Helles Weiss oder leichter Gradient

**Komposition:**
```
+----------------------+
|    \  /\         |
|     \/  \        |
|    [Bauhelm in    |
|     blau/orange]  |
|     ___________   |
|    |    TW    |   |   <- "TW" weiss auf dem Helm-Schild
|    |__________|   |
+----------------------+
```

## 13.2 Erforderliche Icon-Groessen

Fuer PWA-Installation auf allen Plattformen:

| Datei | Groesse | Zweck |
|---|---|---|
| `icon-72.png` | 72x72 | Android (alt) |
| `icon-96.png` | 96x96 | Android |
| `icon-128.png` | 128x128 | Chrome Web Store, Android |
| `icon-144.png` | 144x144 | Android Hi-Res |
| `icon-152.png` | 152x152 | iPad |
| `icon-180.png` | 180x180 | iPhone |
| `icon-192.png` | 192x192 | Android Standard |
| `icon-384.png` | 384x384 | Android XHDPI |
| `icon-512.png` | 512x512 | Splash Screen, Manifest |
| `icon-maskable-192.png` | 192x192 | Android adaptive (mit Padding) |
| `icon-maskable-512.png` | 512x512 | Android adaptive (mit Padding) |
| `favicon.ico` | 32x32 | Browser-Tab |
| `apple-touch-icon.png` | 180x180 | iOS Homescreen |

**Erzeugung:**
- Master-Datei als SVG erstellen (in Etappe 0 des Bauplans)
- Per Skript (z.B. `sharp` in Node) alle PNG-Groessen automatisch generieren
- Maskable-Variante mit ~20% Safe-Zone-Padding

## 13.3 PWA-Manifest

`manifest.json` im Repo-Root:

```json
{
  "name": "TW Baustellen-App",
  "short_name": "TW Baustelle",
  "description": "Baustellen-App von Thomas Willwacher Fliesenlegermeister e.K.",
  "start_url": "/Baustellen-Mitarbeiterapp/",
  "scope": "/Baustellen-Mitarbeiterapp/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a1019",
  "theme_color": "#1E88E5",
  "lang": "de-DE",
  "icons": [
    { "src": "icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["business", "productivity"]
}
```

## 13.4 Service Worker

`service-worker.js` — Offline-Cache + Push-Notifications:

```javascript
// Vereinfachtes Geruest, Detail beim Bauen
const CACHE_NAME = 'tw-baustelle-v1';
const APP_SHELL = [
  '/Baustellen-Mitarbeiterapp/',
  '/Baustellen-Mitarbeiterapp/index.html',
  '/Baustellen-Mitarbeiterapp/css/tw-ma-design.css',
  // ... weitere statische Assets
];

self.addEventListener('install', e => { /* App-Shell cachen */ });
self.addEventListener('fetch', e => { /* Cache-First fuer Shell, Network-First fuer Daten */ });
self.addEventListener('push', e => { /* Push-Notification anzeigen */ });
```

## 13.5 iOS-spezifische Tags in `index-template.html`

```html
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="TW Baustelle">
```

---

# 14. DESIGN-SYSTEM & WIEDERVERWENDETE KOMPONENTEN

## 14.1 CSS-Variablen (1:1 aus Master-App)

Aus `tw-design.css` der Master-App uebernehmen:

```css
:root {
  --bg-primary: #0a1019;
  --bg-secondary: #141e2e;
  --bg-card: #1a2638;
  --text-white: #ffffff;
  --text-primary: #e8ecf2;
  --text-light: #b0bcc8;
  --text-muted: #8896a8;
  --accent-blue: #1E88E5;
  --accent-blue-dark: #1565C0;
  --accent-orange: #e67e22;
  --accent-red: #c41e1e;
  --accent-red-light: #ff4757;
  --success: #27ae60;
  --warning: #f39c12;
  --border-color: rgba(255,255,255,0.08);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
}
```

## 14.2 Button-Stile (verbindlich)

**Action-Button (Modul-Auswahl, Speichern, Senden):**
- Background: `linear-gradient(135deg, #1E88E5, #1565C0)`
- Shadow: `0 6px 20px rgba(30,136,229,0.30)`
- Border-Radius: `var(--radius-lg)`
- Text: weiss, Oswald, uppercase, letterSpacing 0.5px

**Sekundaer-Button (Abbrechen, Zurueck):**
- Background: `var(--accent-red)` oder transparent mit rotem Rand
- Shadow: `0 4px 15px rgba(196,30,30,0.3)`

**Disable-Stil:**
- Opacity 0.4
- cursor: not-allowed

## 14.3 Wiederverwendete Komponenten (Copy-Paste aus Master-App)

| Komponente | Quelle in Master-App | In Mitarbeiter-App |
|---|---|---|
| `FirmenLogo` | `tw-shared-components.jsx` (siehe `SKILL-firmenlogo.md`) | unveraendert |
| `BauteamAnimation` | `tw-shared-components.jsx` Z. 891+ | unveraendert |
| `MicButton`, `MicLabel`, `MicInput`, `useSpeech` | `tw-shared-components.jsx` (TWSpeechService) | unveraendert |
| Header-Optik | `tw-shared-components.jsx` Z. 1095+ | Titel "Baustellen App" + neue Button-Reihe |
| jsPDF-Briefkopf-Pattern | `SKILL-jspdf-briefkopf.md` | fuer Stundenzettel |
| ExitGuard-Logik | `tw-core.js` | unveraendert |

## 14.4 Was NICHT uebernommen wird

- `KiAkteView`, `KiAnalyseProgress` (gehoeren zur Master-App)
- `OrdnerBrowser` (Master-App-Version mit Original-Drive-Zugriff)
- `OrdnerAnalyseEngine`, `callGeminiVision` (KI-Analyse passiert in Master-App)
- `Aufmass`-Komponenten, `Rechnung`-Komponenten, etc.

---

# 15. ETAPPENPLAN

Die Umsetzung erfolgt in **8 Etappen**. Nach jeder Etappe gibt's ein lauffaehiges, testbares Teilstueck und eine ZIP-Auslieferung.

## Etappe 0: Repo-Audit & Projekt-Setup
**Dauer-Schaetzung:** kurz (~30 Min)
- Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp` clonen, alten Code sichten
- Entscheidung: was bleibt (Repo-Config, Pages-Settings), was wird geloescht (Code)
- Verzeichnisstruktur lt. Kapitel 2.2 anlegen
- Leeres `index-template.html`, `build.bat`, `manifest.json`, `service-worker.js` Geruest
- README mit kurzer Beschreibung
- **ZIP-Auslieferung:** komplettes Skelett

## Etappe 1: Startseite + Navigationsleiste
- `tw-ma-shared-components.jsx`: FirmenLogo, BauteamAnimation aus Master-App importieren
- `tw-ma-startseite.jsx`: Startseite mit Header, Uhr-Block, Sprach-Auswahl, hochgesetzte Animation
- `tw-ma-app.jsx`: Top-Level-Routing mit den 6 Modul-Buttons
- Mehrsprachige UI-Labels in `tw-ma-config.js`
- Sprach-Wechsel-Funktionalitaet
- Leere Modul-Komponenten (Platzhalter, "noch im Bau")
- **ZIP-Auslieferung:** App startet, alle Tabs sind klickbar (Inhalt aber leer)

## Etappe 2: Icon-Set + PWA-Manifest + Service Worker
- SVG-Master-Icon erstellen (Bauhelm + TW-Monogramm)
- Alle Icon-Groessen generieren
- `manifest.json` finalisieren
- Service Worker mit App-Shell-Cache
- iOS-Tags in Template
- **Test:** App auf Handy als PWA installieren, Icon erscheint im Homescreen
- **ZIP-Auslieferung:** PWA-faehige App

## Etappe 3: Geraete-Onboarding + PIN-Login
- `tw-ma-firebase.js`: Firebase-Anbindung (Config aus Master-App uebernehmen)
- Onboarding-Flow: UUID-Generierung, 6-stelliger Code, Polling auf Freigabe
- PIN-Setup nach Freigabe
- PIN-Login bei jedem App-Start
- 5-Falsch-Versuche-Schutz, Wipe-Logik
- **ZIP-Auslieferung:** App ist abgesichert, Geraete-Onboarding funktioniert

## Etappe 4: Modul "Baustellen" (Liste + 4-Kacheln + Browser)
- `tw-ma-drive-service.js`: Service-Account-Anbindung
- `tw-ma-baustellen.jsx`: Liste, Detail, 4 Ordner-Kacheln, Browser
- Datei-Vorschau (Bild, PDF)
- Logische Filter "Kalender / Nachrichten / Anweisungen" im Nachrichten-Ordner
- **ZIP-Auslieferung:** MA kann freigegebene Baustellen einsehen

## Etappe 5: Modul "Fotos" (kompletter Workflow)
- `tw-ma-fotos.jsx`: Baustelle → Raum → Phase → Wand → Foto → Sprach-Notiz → Speichern
- Wand-Anzahl-Auswahl pro Raum
- 3 Phasen (Rohzustand, Abdichtung, Fertigstellung)
- 20 allgemeine Fotos pro Baustelle
- IndexedDB-Storage + Sync-Queue
- Drive-Push mit Praefix-Konvention
- **ZIP-Auslieferung:** Fotos koennen aufgenommen, beschriftet und synchronisiert werden

## Etappe 6: Modul "Stunden" (PDF-Formular + Material-Popup)
- `tw-ma-stunden.jsx`: Formular-UI
- Material-Popup mit Kategorie-Tabs und Pickliste
- Spracheingabe fuer Bemerkung + Material-Mengen
- jsPDF-Briefkopf adaptieren (aus Master-App-Skill)
- PDF-Erzeugung und Drive-Upload
- WIP-Speicherung
- Eigene Stunden-Historie
- **ZIP-Auslieferung:** MA kann Stundenzettel erstellen, abgeben, einsehen

## Etappe 7: Modul "Nachrichten" + "Anweisungen" + Live-Uebersetzung
- `tw-ma-translation.js`: Gemini-Wrapper mit Cache
- Verschluesselter API-Key in `tw-ma-config.js`
- `tw-ma-nachrichten.jsx`: Chat-UI, Bubbles mit beiden Sprachen, Mic-Eingabe
- Anweisungs-Tab mit Pinnwand und Lese-Quittung
- Firebase-Listener fuer eingehende Nachrichten
- Push-Notifications via Service Worker
- **ZIP-Auslieferung:** Voll funktionsfaehiger uebersetzter Chat

## Etappe 8: Modul "Kalender" + Fein-Schliff + Tests
- `tw-ma-kalender.jsx`: Monatsansicht, Wochenansicht, Tagesdetail
- Firebase-Sync der Kalender-Eintraege
- Fein-Schliff:
  - Animations-Smoothing
  - Loading-Indikatoren
  - Fehler-Toasts
  - A11y (Screenreader-Labels, Touch-Target-Groessen)
- End-to-End-Tests: Onboarding → Foto → Stunden → Nachricht → Sync zur Master-App
- **ZIP-Auslieferung:** Produktionsreife V1

## Empfohlenes Vorgehen pro Etappe

1. Build durchfuehren
2. ZIP packen (komplettes Repo + nur geaenderte Dateien als kleinere ZIP zur Uebersicht)
3. Kurze Zusammenfassung schreiben:
   - Was wurde gebaut?
   - Was ist zu testen?
   - Welche offenen Fragen / Annahmen?
   - Was kommt in der naechsten Etappe?
4. Auf Thomas-Feedback warten

---

# 16. BUILD & DEPLOYMENT

## 16.1 `build.bat` (analog Master-App)

```batch
@echo off
REM Build-Skript fuer TW Baustellen-App
REM Konkateniert alle JSX-Dateien in der korrekten Reihenfolge in die index.html

echo Baue index.html ...

REM 1. Template kopieren
copy index-template.html index.html /Y

REM 2. Babel-Block oeffnen
echo. >> index.html
echo ^<script type="text/babel"^> >> index.html

REM 3. JSX-Dateien in der korrekten Reihenfolge anhaengen
type jsx\tw-ma-shared-components.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-startseite.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-baustellen.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-kalender.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-fotos.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-stunden.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-nachrichten.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-app.jsx >> index.html

REM 4. Babel-Block schliessen
echo ^</script^> >> index.html

REM 5. Render-Aufruf
echo ^<script type="text/babel"^>ReactDOM.render(^<MAApp /^>, document.getElementById('root'));^</script^> >> index.html

echo.
echo Fertig: index.html ist bereit.
echo.
pause
```

**Wichtig:** Das `build.bat` darf KEINE Babel-Validierung nachreichen — die kommt im naechsten Schritt.

## 16.2 Babel-Validierung

Wie in der Master-App: Vor jeder Auslieferung mit `@babel/cli` und `@babel/preset-react` validieren.

```bash
npx babel jsx/tw-ma-startseite.jsx --presets=@babel/preset-react --no-babelrc -o /dev/null
# fuer jede JSX-Datei
```

## 16.3 Deployment auf GitHub Pages

- Push auf `main`-Branch
- GitHub Pages ist auf Branch `main`, Verzeichnis `/` konfiguriert (oder `/docs` — beim Etappe 0 Audit klaeren)
- Innerhalb von 1-2 Minuten ist die neue Version live
- Service Worker erkennt neue Version und triggert Update beim naechsten App-Start

## 16.4 Versionierung

- In `tw-ma-config.js` Konstante `APP_VERSION = '1.0.0'`
- Bei jedem Deployment erhoehen
- Wird im Footer der Startseite klein angezeigt
- Service Worker triggert Update bei Versions-Wechsel

## 16.5 ZIP-Konvention (fuer Auslieferung an Thomas)

Pro Etappe:
- **Komplett-ZIP:** `tw-baustellen-app-etappe-{n}-komplett.zip` — gesamte Codebasis
- **Diff-ZIP:** `tw-baustellen-app-etappe-{n}-diff.zip` — nur geaenderte/neue Dateien

Beide werden via `present_files` an Thomas geliefert.

---

# 17. OFFENE PUNKTE & ANNAHMEN

## 17.1 Annahmen, die Claude trifft (von Thomas zu bestaetigen oder zu korrigieren)

| Annahme | Standard | Wann zu klaeren |
|---|---|---|
| Kalender zeigt Schichten + Urlaub + Termine, nur lesbar | Bei Etappe 8 | bei Bau-Start fragen |
| Material-Liste in App vorinstalliert, von Thomas spaeter erweiterbar | ~30 Standard-Materialien | bei Etappe 6 fragen |
| Taetigkeits-Pickliste vorinstalliert | ~12 Standard-Taetigkeiten | bei Etappe 6 fragen |
| Service Account fuer Drive existiert noch nicht | Anleitung mitliefern | bei Etappe 0 fragen |
| Firebase-Projekt `einkaufsliste-98199` wird wiederverwendet | Ja | bei Etappe 3 bestaetigen |
| Master-App stellt Daten via Firebase bereit | Ja, separates Etappenmodul in Master-App | bei Etappe 3 abklaeren |

## 17.2 Was Thomas vorbereiten sollte (parallel zum Bau)

1. **Google Cloud Console:**
   - Neuen API-Key fuer Gemini erstellen (separat vom Master-App-Key)
   - Service-Account fuer Drive-Staging anlegen
   - JSON-Schluessel herunterladen
   - Beides per sicherem Kanal an Claude (oder selbst in `tw-ma-config.js` einbauen)

2. **Google Drive:**
   - Root-Ordner "Baustellen-App-Staging" anlegen
   - Service-Account zum Ordner einladen mit Editor-Rechten

3. **Firebase Console:**
   - Mitarbeiter-spezifische Security-Rules definieren
   - Mitarbeiter-Whitelist-Initialisierung

4. **GitHub:**
   - Pages-Settings im Repo `Baustellen-Mitarbeiterapp` pruefen (Branch + Verzeichnis)
   - Falls noch keine Custom Domain: GitHub-Pages-URL bestaetigen

## 17.3 Was NICHT in V1 enthalten ist (fuer V2 vormerken)

- Mehrere Konversationen pro Mitarbeiter (Gruppen-Chats)
- Sprachnachrichten als Audio (nur Transkription, nicht Original-Audio)
- Video-Aufnahmen
- Mitarbeiter-Stunden-Auswertung in der App (Statistiken, Wochensummen — gibt's nur in Master-App)
- Material-Liste live editierbar in der App (kommt erstmal aus statischer Konfig)
- Offline-Sprach-Uebersetzung (braucht zwingend Online-Verbindung)
- Multi-Geraete-Sync (ein MA mit zwei Handys — selten relevant)

## 17.4 Bekannte Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Gegenmassnahme |
|---|---|---|---|
| Web Speech API nicht in allen Browsern verfuegbar | mittel | Spracheingabe faellt aus | Fallback: Text-Eingabe weiterhin moeglich |
| Push-Notifications blockiert vom Nutzer | hoch | Keine Live-Benachrichtigung | App pollt zusaetzlich alle 60s im Hintergrund |
| Foto-Speicher voll (>1 GB) | mittel | Aufnahme schlaegt fehl | Warnung ab 800 MB, Loesch-Vorschlag fuer alte Fotos |
| Gemini-API-Limit ueberschritten | niedrig | Uebersetzungen fallen aus | Cache + Notbetrieb-Modus |
| Service-Account-Key kompromittiert | niedrig | Staging-Zugriff offen | Rotation alle 30 Tage, sofortige Sperrung moeglich |
| iOS-Safari hat eingeschraenkte PWA-Faehigkeit | mittel | Kein Push, eingeschraenktes Offline | iOS-spezifischer Hinweis in App |

---

# 18. ANHANG

## 18.1 Datei-Checkliste fuer V1

Nach Etappe 8 sollten folgende Dateien im Repo liegen:

```
README.md
build.bat
index-template.html
index.html (Build-Output)
manifest.json
service-worker.js
icons/  (13 PNG-Dateien)
js/
  tw-ma-core.js
  tw-ma-storage.js
  tw-ma-config.js
  tw-ma-firebase.js
  tw-ma-drive-service.js
  tw-ma-translation.js
jsx/
  tw-ma-shared-components.jsx
  tw-ma-startseite.jsx
  tw-ma-baustellen.jsx
  tw-ma-kalender.jsx
  tw-ma-fotos.jsx
  tw-ma-stunden.jsx
  tw-ma-nachrichten.jsx
  tw-ma-app.jsx
css/
  tw-ma-design.css
docs/
  MASTER-BAUSTELLEN-APP.md (diese Datei)
  konzeptbaustellenappmodul.pdf
```

## 18.2 Glossar

| Begriff | Bedeutung |
|---|---|
| **Master-App** | TW Business Suite (Buero-App von Thomas) |
| **Mitarbeiter-App / MA-App** | TW Baustellen-App (diese App, hier dokumentiert) |
| **Staging** | Drive-Bereich, der MA-zugaenglich ist (von Originalen getrennt) |
| **Original** | Echte Kundenordner unter "Baustellen neu" — fuer MA unsichtbar |
| **Service-Account** | Google-Cloud-Konto, das nur Staging sieht |
| **Geraete-ID** | UUID, die jedes MA-Handy einmalig erhaelt |
| **PWA** | Progressive Web App — installierbar wie native App |
| **WIP** | Work-in-Progress, lokal gespeicherter Bearbeitungs-Stand |

## 18.3 Referenz-Skills (im Master-App-Projekt vorhanden)

- `SKILL-design-system.md` — Farben, Buttons, Layout-Regeln
- `SKILL-firmenlogo.md` — FirmenLogo-Komponente, exakte Spezifikation
- `SKILL-jspdf-briefkopf.md` — jsPDF-Briefkopf mit exakten Koordinaten
- `SKILLBuildAuslieferung.md` — Build-Prozess der Master-App (analog adaptierbar)

## 18.4 Test-Szenarien fuer Etappe 8

1. **Onboarding:** Neues Handy → Code → Freigabe → PIN → erster Login
2. **Baustelle einsehen:** Liste → Detail → 4 Ordner → Datei oeffnen
3. **Foto aufnehmen:** Baustelle → Raum → Wand → Foto → Notiz → Speichern → Sync
4. **Stundenzettel:** Formular ausfuellen → Material → PDF → Sync
5. **Nachricht:** Tippen → Senden (CZ→DE) → Antwort empfangen (DE→CZ)
6. **Anweisung:** von Thomas geschickt → MA empfaengt → Lese-Quittung
7. **Kalender:** Aktuelle Woche pruefen → Tagesdetail
8. **Geraete-Sperrung:** Thomas sperrt Geraet → MA-App wird gewipt
9. **Offline:** Internet aus → Foto aufnehmen → Internet an → Sync funktioniert
10. **Sprach-Wechsel:** UI von DE auf CZ umstellen → alle Labels neu

## 18.5 Schluss-Notiz

Dieses Master-Dokument ist das **lebende Arbeitspapier** fuer das gesamte Projekt. Aenderungen, Erweiterungen und Korrekturen koennen jederzeit eingearbeitet werden — am besten als neue Etappe oder als nachtraegliche Korrektur-Spec.

**Bei Widerspruechen** zwischen diesem Dokument und dem Konzept-PDF gewinnt **dieses Master-Dokument**, weil es die juengeren Anforderungen reflektiert.

**Bei Unklarheiten** im Bau: lieber kurz zurueckfragen als raten — Thomas ist erreichbar, und die App soll die Hand am Handy genauso umschmeicheln wie eine gut sortierte Werkzeugkiste.

---

**ENDE DES MASTER-DOKUMENTS**

*Erstellt von Claude im Auftrag von Thomas Willwacher Fliesenlegermeister e.K.*
*Letzte Aktualisierung: 18. April 2026*
*TW Business Suite · TW Baustellen-App · Komplettumbau*

