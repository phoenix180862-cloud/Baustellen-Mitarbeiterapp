# 🩹 Hotfix tFix — Foto-Modul Texte sichtbar machen

**Stand:** 29.04.2026 · Build `1.0.0-etappe5-b6-hotfix1+thomas+e6.1+e6.2+tFix`

---

## Was war kaputt?

Im Foto-Modul wurden statt der UI-Texte die **Code-Keys** angezeigt — z.B. `fotos.raum.neu` statt `Neuer Raum`. Folge: Das Foto-Modul oeffnete sich, aber alle Buttons und Beschriftungen waren unleserlich, der Mitarbeiter konnte nichts erkennen.

## Ursache

Die Etappe-6-Quelldateien stammen aus der Generation-B-Architektur, wo **alle Uebersetzungs-Aufrufe ueber `t()` laufen** — und dieses globale `t()` ist `window.TWMaConfig.t()`, das Punkt-Notation und Replacements unterstuetzt.

In v14 (unserem Sockel, Generation A) gibt es aber zwei verschiedene Funktionen:
- **`t(key, lang)`** — lokale Funktion fuer kurze Keys aus UI_LABELS (kein Punkt!)
- **`tConfig(key, repl)`** — Wrapper um `window.TWMaConfig.t()`, kann Punkt-Notation + Replacements

Beim Einbau des Foto-Moduls in v14 traf `t('fotos.raumliste.titel')` auf die lokale v14-Funktion → diese kannte den Key nicht → gab den Key selbst zurueck → der Mitarbeiter sah `fotos.raumliste.titel` als Text.

## Was wurde gefixt

**62 t()-Aufrufe** im Foto-Modul-Block (zwischen `// ║ MODUL FOTOS` und `// ENDE MODUL FOTOS`) wurden zu `tConfig()` umgestellt — chirurgisch, nur in diesem Block, alle anderen `t()`-Aufrufe ausserhalb sind unangetastet.

Davon **6 Aufrufe mit Replacement-Objekt** (z.B. `tConfig('fotos.wand.label', { n: 4 })` -> "Wand 4"), die jetzt korrekt verarbeitet werden.

## Was wurde NICHT angefasst

- ✅ index.html ausserhalb des Foto-Modul-Blocks — alles wie vorher
- ✅ js/tw-ma-storage.js — unveraendert
- ✅ js/tw-ma-config.js — unveraendert
- ✅ FigurThomas-Cabrio — unveraendert
- ✅ v14's lokale `t(key, lang)`-Funktion — unveraendert
- ✅ tConfig()-Funktion — unveraendert

## Validierung

- ✅ 62 `t('...'` → 62 `tConfig('...'` umgestellt
- ✅ 0 verbleibende `t('...'`-Aufrufe im Foto-Modul-Block
- ✅ Kein `tConfigConfig`-Fehler (Doppel-Ersetzung)
- ✅ Babel-Parser: **PARSE OK** (112 AST-Top-Level-Knoten)
- ✅ Klammer-Balance OK
- ✅ v14's lokale t()-Funktion noch da (fuer den Rest der App)

## Upload-Anleitung

**NUR die index.html** ersetzen — js/-Dateien sind unveraendert!

1. Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp` → `index.html`
2. Stift (✏️) → Strg+A → Entf
3. Inhalt aus diesem ZIP einfuegen → Commit changes
4. **Verifikation:** Datei zeigt **8.076 Zeilen** (gleiche Zeilenzahl wie vorher, nur 62 Zeichen mehr durch "Config")
5. GitHub-Pages-Deployment abwarten (Tab "Actions", grueener Haken)

## Auf dem Handy testen

1. App **deinstallieren**
2. Browser-Cache **leeren**
3. Browser **alle Tabs schliessen**
4. Browser neu oeffnen → URL aufrufen
5. App neu zum Homescreen
6. Auf Baustelle → **Sub-Kachel "Fotos"** anklicken

## Test-Checkliste

| Test | Erwartet |
|---|---|
| Header zeigt **"Räume"** statt `fotos.raumliste.titel` | ✅ |
| Hinweistext **"Lege fuer jeden zu fotografierenden Raum..."** lesbar | ✅ |
| Button heisst **"Neuer Raum"** | ✅ |
| Dialog: Felder heissen **"Raum-Bezeichnung"**, **"Geschoss"**, **"Anzahl Waende"** | ✅ |
| Phasen heissen **"Rohzustand"**, **"Vorarbeiten"**, **"Fertigstellung"** | ✅ |
| Wand-Kachel zeigt **"Wand 1"**, **"Wand 2"** etc. | ✅ |
| Sprache umschalten auf Tschechisch → Texte aendern sich | ✅ |
| Foto aufnehmen + speichern funktioniert | ✅ |

Yallah! 🩹📸
