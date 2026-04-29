# 📸 Phase 3.1 + 3.2 Lieferung — Foto-Modul mit Aufnahme

**Stand:** 29.04.2026 · Build `1.0.0-etappe5-b6-hotfix1+thomas+e6.1+e6.2`

---

## Was ist neu?

✅ **Modul Fotos vollwertig in Betrieb** — keine Stub-Anzeige mehr!

### Phase 3.1 (= B6.1) — Raum-Verwaltung
- **Neuer Raum anlegen:** Bezeichnung (z.B. "Bad EG"), optional Raum-Nummer, Geschoss (KG/EG/OG/DG), Wandanzahl (3-8), optional Boden + Decke
- **Raum-Liste** mit allen angelegten Raeumen einer Baustelle, plus Foto-Anzahl pro Phase
- **Phasen-Auswahl:** 3 Buttons — Rohzustand (orange) / Vorarbeiten (blau) / Fertigstellung (gruen) — mit Fortschrittsanzeige (X von Y Faechern)
- **Wand-Raster:** Klickbare Kacheln pro Wand, plus Boden/Decke wenn aktiviert

### Phase 3.2 (= B6.2) — Foto-Aufnahme
- **Wand antippen** → Kamera oeffnet sich (Smartphone-Kamera, Hauptkamera bevorzugt)
- **Komprimierung:** Max. 1920px Kantenlaenge, JPEG q=0.85 (deutliche Speicher-Ersparnis ohne sichtbaren Qualitaetsverlust)
- **Vorschau:** Foto wird gezeigt mit "Wiederholen" / "Verwenden" / "Abbrechen"
- **Speicherung:** Lokal in IndexedDB (bleibt erhalten auch ohne Netz)
- **Detail-Ansicht:** Vorhandene Fotos koennen angesehen, geloescht oder neu aufgenommen werden
- **Thumbnail-Vorschau** auf der Wand-Kachel zeigt das letzte Foto

## Wo ist das Modul zu finden?

Auf einer Baustelle anklicken → **Sub-Kachel "Fotos"** → Modul oeffnet sich.

**HINWEIS:** Der Hauptmenue-Tab "Fotos" zeigt bewusst **noch** den ModulPlatzhalter — die Foto-Aufnahme braucht den Baustellen-Kontext (Raum gehoert zu einer Baustelle). Das ist konsistent mit der Master-App-Architektur. Ueber die Baustelle ist der Weg eindeutig.

## Was wurde NICHT angefasst?

🛡️ Sonst gar nichts:

- ✅ FigurThomas im Cabrio mit Yallah-Sprechblase — bleibt
- ✅ 7 weitere Bauteam-Figuren — bleiben
- ✅ Dunkles Theme #0f1923 — KEIN blauer Hintergrund irgendwo
- ✅ MAKalenderModul, MAPushPermissionBanner, MANachrichtenModul — alle unveraendert
- ✅ Auth/Onboarding/PIN-Setup — unveraendert
- ✅ Firebase-Anbindung — unveraendert
- ✅ Alle 6 Tabs auf der Hauptseite — bleiben

## Was ist NICHT in dieser Lieferung?

⏭️ Phase 3.3 (= B6.3): **Foto-Editor** mit Crop + 6 Markierungsfarben + Zeichnen
⏭️ Phase 3.4 (= B6.4): **Sprach-Notiz** mit Web Speech API + Live-Transkription

Beide folgen, sobald du Phase 3.1+3.2 auf dem Handy abgesegnet hast.

## Architektur-Hinweis

Diese Lieferung enthaelt **3 zu aktualisierende Dateien** (nicht nur eine wie bei Phase 2):

| Datei | Zweck |
|---|---|
| `index.html` | Babel-Block mit Foto-Komponenten + MAKachelRouter umgestellt |
| `js/tw-ma-storage.js` | IndexedDB v1 → v2: neuer `raeume`-Store + Foto-Funktionen |
| `js/tw-ma-config.js` | +60 neue Uebersetzungen (DE/CS/SK/PL/EN/RO/UK) fuer Foto-Texte |

## IndexedDB-Migration

⚠️ **WICHTIG:** Die App-Datenbank wird automatisch von Version 1 auf Version 2 hochgezogen. Das passiert beim ersten Start und ist transparent — keine Aktion noetig. Bestehende Daten (Onboarding, Settings) bleiben erhalten. Neuer Store `raeume` wird leer angelegt.

Auch der bestehende `fotos`-Store wird von v14 schon angelegt (war als Stub vorhanden, wird jetzt aktiv genutzt).

## Validierung

- ✅ Babel-Parser-Test: **PARSE OK** (112 AST-Top-Level-Knoten)
- ✅ Klammer-Balance OK
- ✅ Alle 13 Foto-Komponenten als `function MA...()` definiert
- ✅ MAKachelRouter umgestellt: `<MAFotosView>` statt `<MAStubView>`
- ✅ FigurThomas, alle 7 anderen Figuren erhalten
- ✅ Hauptmenue-Tab-Fotos bleibt absichtlich Platzhalter
- ✅ Build-Stempel: `1.0.0-etappe5-b6-hotfix1+thomas+e6.1+e6.2`

## Upload-Anleitung

### Schritt 1: index.html ersetzen
1. Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp` → `index.html` anklicken
2. Stift (✏️) → Strg+A → Entf
3. `index.html` aus diesem ZIP einfuegen → Commit changes
4. **Verifikation:** Datei-Header zeigt **8.076 Zeilen** (vorher 6.446)

### Schritt 2: js/tw-ma-storage.js ersetzen
1. In `js/`-Ordner navigieren → `tw-ma-storage.js` anklicken
2. Stift (✏️) → Strg+A → Entf
3. Inhalt aus ZIP einfuegen → Commit changes
4. **Verifikation:** **479 Zeilen** (vorher 257)

### Schritt 3: js/tw-ma-config.js ersetzen
1. In `js/`-Ordner navigieren → `tw-ma-config.js` anklicken
2. Stift (✏️) → Strg+A → Entf
3. Inhalt aus ZIP einfuegen → Commit changes
4. **Verifikation:** **1.515 Zeilen** (vorher 1.454)

### Schritt 4: GitHub-Pages-Deployment abwarten
Tab "Actions" → grueener Haken am letzten Commit (1-2 Min)

### Schritt 5: Auf dem Handy
1. App deinstallieren
2. Browser-Cache leeren
3. Browser komplett schliessen (alle Tabs)
4. Neu oeffnen → URL aufrufen
5. App neu zum Homescreen

## Test-Checkliste

| Test | Erwartet |
|---|---|
| Startseite weiterhin dunkel mit Thomas im Cabrio | ✅ |
| Auf Baustelle klicken → 5 Sub-Kacheln (incl. **Fotos**) | ✅ |
| Klick auf "Fotos"-Sub-Kachel → Raum-Liste (initial leer) | ✅ |
| Button "Neuer Raum" → Dialog mit allen Feldern | ✅ |
| Raum anlegen "Bad EG", 4 Waende, mit Boden | ✅ |
| Raum erscheint in Liste mit "0 Fotos pro Phase" | ✅ |
| Raum antippen → 3 Phase-Kacheln (Rohzustand/Vorarbeiten/Fertigstellung) | ✅ |
| Phase antippen → Wand-Raster mit 4 Waenden + Boden | ✅ |
| Wand antippen → Kamera oeffnet sich (Genehmigung pruefen!) | ✅ |
| Foto aufnehmen → Vorschau mit Wiederholen/Verwenden/Abbrechen | ✅ |
| "Verwenden" → Foto wird gespeichert, Wand-Kachel zeigt Mini-Vorschau | ✅ |
| App komplett zumachen + neu oeffnen → Foto ist noch da (IndexedDB) | ✅ |
| Sprache umschalten (Tschechisch) → Alle Foto-Texte uebersetzt | ✅ |

## Falls auf dem Handy etwas hakt

- **"Kamera-Zugriff verweigert":** Browser-Einstellungen → Site-Permissions → Kamera erlauben
- **"Speicher nicht bereit":** Browser-Cache leeren, dann App neu oeffnen
- **Fotos sind weg nach App-Update:** Kann passieren wenn Browser-Datenbanken geleert wurden — ist normal beim Service-Worker-Update
- **Wand-Kachel zeigt kein Thumbnail trotz Foto:** Ein Cache-Problem, App-Wischen + Wieder oeffnen

Yallah! 🚗📸 Die Mitarbeiter koennen jetzt richtig dokumentieren.
