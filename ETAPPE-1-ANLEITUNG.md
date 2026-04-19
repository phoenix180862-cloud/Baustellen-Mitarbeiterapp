# 🏗️ Etappe 1 — Startseite & Navigation

**Stand:** 19. April 2026 · Frischer Bau, sauber von Grund auf

---

## ✅ Was diese Etappe liefert

Eine **funktionierende, schöne, schnelle** Mitarbeiter-App mit:

- 📱 **Header-Leiste** oben (Zurück/Vor + Titel + A↑/A↓-Schriftgröße)
- 🎯 **6 Modul-Buttons** (Start, Baustellen, Kalender, Fotos, Stunden, Nachrichten)
- 🏛️ **Firmen-Kopf** mit TW-Logo + Adresse + "BAUSTELLEN APP"
- ⏰ **Premium-Uhr** mit Wochentag, Live-Zeit (pulsiert), Datum
- 🌍 **Sprach-Auswahl** mit 7 Sprachen (DE, CZ, SK, PL, EN, RO, UK)
- 👷 **Bauteam-Animation** (animierte Bau-Szene)
- 🟢 **Status-Indikator** unten

**Module 2-6 zeigen einen freundlichen "Noch im Bau"-Platzhalter** — die werden in Etappe 4-7 schrittweise mit Funktion gefüllt.

**Was NICHT in dieser Etappe drin ist (und das ist Absicht!):**
- ❌ Kein Onboarding-Bildschirm mit Code → die App startet **direkt**, kein Hindernis vor der Tür
- ❌ Kein Firebase, keine Drive-Verbindung → das ist Etappe 3 + 4
- ❌ Keine PIN-Sperre → das ist Etappe 3

**Erst die App fertig schön bauen, DANN absichern und vernetzen.**

---

## 📤 Upload-Anleitung (in 3 Minuten)

### Schritt 1: Auf GitHub einloggen

Browser → **https://github.com/phoenix180862-cloud/Baustellen-Mitarbeiterapp**

### Schritt 2: Die alte index.html ersetzen

1. Im Repo auf die Datei **`index.html`** klicken
2. Oben rechts auf das **Stift-Symbol** (✏️) klicken
3. Den **kompletten** Inhalt löschen (Strg+A → Entf)
4. Die `index.html` aus diesem ZIP öffnen, Inhalt komplett kopieren (Strg+A → Strg+C)
5. Ins GitHub-Editor-Fenster einfügen (Strg+V)
6. Ganz unten auf **"Commit changes…"** (grüner Button)
7. Pop-up: **"Commit directly to the main branch"** → **"Commit changes"**

### Schritt 3: Auf GitHub-Pages-Deployment warten (1–2 Minuten)

Im Repo → Tab **"Actions"** → oberster Eintrag bekommt erst gelben Punkt, dann grünen Haken.

### Schritt 4: Auf dem Handy testen

**WICHTIG — sonst zeigt das Handy weiter die alte Version aus dem Cache:**

1. Installierte App vom Handy **löschen** (lange auf Icon → Deinstallieren)
2. Browser **Cache komplett leeren**
   - Chrome: Einstellungen → Datenschutz → Browserdaten löschen
   - "Bilder und Dateien im Cache" + "Cookies und Websitedaten" anhaken
   - "Daten löschen"
3. Browser **komplett schließen** (alle Tabs)
4. Browser **neu** öffnen → zur App-URL:
   `https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/`
5. Wenn du jetzt **Header + 6 Modul-Buttons + Logo + Uhr** siehst → 🎉 **Erfolg!**
6. App zum Homescreen hinzufügen (Browser-Menü → "Zum Startbildschirm hinzufügen")

---

## ✅ Was du danach testen solltest

| Test | Erwartetes Ergebnis |
|---|---|
| App startet ohne Onboarding-Bildschirm | ✅ Du siehst direkt die Startseite |
| Auf "Baustellen"-Button tippen | ✅ Modul-Platzhalter "Noch im Bau" mit Helm-Icon |
| Auf "Kalender"-Button tippen | ✅ Modul-Platzhalter mit Kalender-Icon |
| Wieder auf "Start" tippen | ✅ Zurück zur Startseite mit Uhr |
| Auf Sprach-Pill 🇩🇪 tippen | ✅ Modal mit 7 Sprachen öffnet sich |
| Tschechisch auswählen | ✅ Alle Modul-Namen wechseln (Stavby, Kalendar, Fotky...) |
| Sprache bleibt nach App-Neustart | ✅ Beim nächsten Öffnen ist Tschechisch noch aktiv |
| A↑-Button drücken | ✅ Schrift wird größer |
| Uhr läuft live | ✅ Sekunden zählen hoch, Doppelpunkt pulsiert |
| Bauteam-Animation läuft | ✅ Die 4 Emojis hüpfen versetzt |

---

## 🐛 Falls etwas nicht klappt

**Weiße Seite / nichts zu sehen:**
→ Browser-Konsole öffnen (Chrome auf PC: F12 → Tab "Konsole"), Screenshot der Fehler an mich

**Uhr zeigt falsche Zeit:**
→ Geräte-Zeit prüfen (Telefon-Einstellungen → Datum & Uhrzeit → "Automatisch")

**Layout sieht zerbrochen aus:**
→ Hard-Reload im Browser: Strg+Shift+R (Desktop) oder App komplett deinstallieren + neu installieren (Handy)

**Etwas anderes:**
→ Screenshot an mich, dann gehen wir's gemeinsam durch

---

## 🚀 Was als nächstes kommt (Etappe 2)

**Etappe 2: Icon-Set + PWA-Manifest + Service Worker**

- Saubere Icon-Generierung in allen Größen (war im Repo schon drin, wird geprüft)
- `manifest.json` finalisieren
- Service Worker für Offline-Fähigkeit
- iOS-Tags für Homescreen-Installation

Danach: Etappe 3 = Firebase + PIN-Login + Geräte-Onboarding (das ist DIE Verbindung Handy ↔ PC).

**Erstmal aber dieses Stück testen — wenn das richtig läuft, ist das Fundament solide. 🏗️**

---

*TW Baustellen-App · Etappe 1 von 8 · v1.0.0-etappe1*
