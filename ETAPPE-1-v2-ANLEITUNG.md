# 🏗️ Etappe 1 v2 — Identisch zur Master-App

**Stand:** 19. April 2026 · Pixelgenaue Übernahme der Master-App-Optik

---

## ✨ Was diese Version anders macht

Die vorherige Version sah aus wie eine Demo. Diese Version sieht aus wie **deine
Business Suite** — weil sie die echten Komponenten 1:1 übernimmt:

✅ **FirmenLogo** — exakt wie in der Master-App: "Thomas" rot kursiv, "wiLLwacher" mit übergroßem LL und rotem i-Punkt, "Fliesenlegermeister e.K." rot rechtsbündig

✅ **Bauteam-Animation** — alle 7 originalen SVG-Figuren (Ivan, Michal, Iurii, Peter, Luca AM, Luca 2, Silke), 3-Gruppen-Zyklus über 45 Sekunden, individuelle Geh-Charakteristik pro Figur

✅ **Uhr-Block** — identisch: Sekunden klein hochgestellt, Doppelpunkt pulsiert blau, dekorative Glühpunkte in den Ecken, sanfte Trennlinie

✅ **Top-Navigation in ROT** — wie in der Master-App: Zurück/Vor + zentrierter Titel + A↑/A↓-Schriftgrößen-Toggle, alles in Master-App-Rot mit Schatten

✅ **6 Modul-Tabs in ROT** — passend zur Master-App-Modulwahl: Start / Baustell. / Kalender / Fotos / Stunden / Nachrichten, mit aktivem Highlight in Orange

✅ **Tile-Pattern-Hintergrund** — der schöne Schachbrett-Effekt, der die Master-App auszeichnet

✅ **Korrekte Farben** — `--bg-primary: #0f1923`, `--accent-red: #c41e1e`, `--accent-blue: #4da6ff` (alle direkt aus tw-design.css übernommen)

**Die 5 Verbindungs-Buttons fehlen bewusst** (Gemini KI, Google Drive, Kundenauswahl, Speicher leeren, Drive-Sync) — das ist in Master-Plan Kapitel 4.5 so spezifiziert: Mitarbeiter brauchen die nicht. Stattdessen steht an dieser Stelle die **Sprach-Pille** mit den 7 Sprachen.

---

## 📤 Upload-Anleitung (3 Minuten)

### Schritt 1: Auf GitHub einloggen
Browser → **https://github.com/phoenix180862-cloud/Baustellen-Mitarbeiterapp**

### Schritt 2: Die alte index.html ersetzen
1. Datei **`index.html`** anklicken
2. Stift-Symbol (✏️) oben rechts
3. **Strg+A → Entf** (kompletten Inhalt löschen)
4. Neue `index.html` aus diesem ZIP öffnen → **Strg+A → Strg+C**
5. Ins Editor-Fenster einfügen (**Strg+V**)
6. **"Commit changes…"** unten → **"Commit directly to the main branch"** → **"Commit changes"**

### Schritt 3: Auf GitHub-Pages-Deployment warten (1–2 Min)
Tab **"Actions"** im Repo → grüner Haken am obersten Eintrag = fertig.

### Schritt 4: Auf dem Handy testen — WICHTIG!

Wegen Service-Worker-Cache **muss** die alte App weg, sonst zeigt das Handy weiter den alten Stand:

1. **Installierte App löschen** (lange auf Icon → Deinstallieren)
2. **Browser-Cache leeren** (Chrome → Einstellungen → Datenschutz → Browserdaten löschen → "Bilder und Dateien im Cache" + "Cookies und Websitedaten")
3. **Browser komplett schließen** (alle Tabs)
4. Browser **neu** öffnen → `https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/`
5. App neu zum Homescreen hinzufügen

---

## ✅ Test-Checkliste

| Test | Erwartet |
|---|---|
| Startseite öffnet sich direkt (kein Onboarding-Code) | ✅ |
| Top-Leiste ist **ROT** (Zurück/Vor/Schrift-Toggle) | ✅ |
| 6 Modul-Tabs darunter sind **ROT** mit weißer Schrift | ✅ |
| Echtes Logo "Thomas wiLLwacher" mit rotem Punkt am i | ✅ |
| Untertitel **"BAUSTELLEN APP"** in Akzentblau | ✅ |
| Uhr läuft live, Doppelpunkt pulsiert | ✅ |
| Sekunden klein hochgestellt | ✅ |
| Sprach-Pille mit 🇩🇪 Deutsch sichtbar | ✅ |
| Bauteam-Animation: Figuren laufen von links nach rechts | ✅ |
| Tile-Pattern-Hintergrund (Schachbrett) sichtbar | ✅ |
| Klick auf "Baustell." → Platzhalter mit Helm-Icon | ✅ |
| Klick auf Sprach-Pille → Modal mit 7 Sprachen | ✅ |
| Tschechisch wählen → Modul-Namen wechseln (Stavby etc.) | ✅ |
| A↑-Button → Schrift wird +50% größer | ✅ |

---

## 🎯 Identitätsvergleich

Wenn du jetzt **Master-App und Mitarbeiter-App nebeneinander** öffnest, sollten sie wie zwei Seiten einer Visitenkarte aussehen:

| Element | Master-App | Baustellen-App |
|---|---|---|
| Logo | "Thomas wiLLwacher Fliesenlegermeister e.K." | **identisch** |
| Untertitel | BUSINESS SUITE | BAUSTELLEN APP |
| Top-Navigation Farbe | Rot | **Rot** |
| Uhr-Block | Premium mit hochgest. Sek. | **identisch** |
| Hintergrund | Schachbrett-Pattern | **identisch** |
| Bauteam-Animation | 7 Figuren, 3 Gruppen | **identisch** |
| Tabs unter Header | 8 (Start/Kunden/Baustell./Daten/Ordner/Module/Foto/Akte) | **6** (Start/Baustell./Kalender/Fotos/Stunden/Nachrichten) |
| Verbindungs-Buttons (Gemini/Drive/Kunden) | ja | **NEIN** (Mitarbeiter brauchen nicht) |
| Sprach-Pille | nein | **ja** (für Mitarbeiter wichtig) |

---

## 🚀 Was als nächstes (Etappe 2)

- Service Worker für Offline-Fähigkeit aktivieren
- PWA-Manifest finalisieren
- Icon-Set checken

Danach **Etappe 3: Firebase + PIN-Login + Geräte-Onboarding** = die echte Verbindung Handy ↔ PC.

---

*TW Baustellen-App · Etappe 1 v2 · v1.0.0-etappe1-v2 · 19.04.2026*
