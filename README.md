# TW Baustellen-App (Mitarbeiter-App)

**Thomas Willwacher Fliesenlegermeister e.K.**
Mobile Begleitung fuer Mitarbeiter auf der Baustelle.

---

## Architektur

Eigenstaendige PWA (Progressive Web App) als Schwester der **TW Business Suite** (Buero-App).
Datenaustausch ausschliesslich ueber:
- **Firebase Realtime Database** (`einkaufsliste-98199`) — Nachrichten, Geraete-Whitelist, Kalender
- **Google Drive Staging-Bereich** (Service-Account) — Fotos, Stundenzettel-PDFs, Zeichnungen

Mitarbeiter-Handys haben **keinen Zugriff** auf die Original-Kundenordner.

---

## Module (V1)

| # | Modul | Funktion | Stand |
|---|---|---|---|
| 1 | Start | Uhr, Sprach-Wahl, Status | E1 |
| 2 | Baustellen | Liste freigegebener Baustellen, 4-Ordner-Detail | E4 |
| 3 | Kalender | Eigener Schichtplan (read-only) | E8 |
| 4 | Fotos | Wand-/Phasen-Dokumentation mit Sprach-Notiz | E5 |
| 5 | Stunden | Stundenzettel-PDF mit Material-Popup | E6 |
| 6 | Nachrichten | Live-uebersetzter Chat mit Buero | **E7 (Phasen A+B+C)** |

---

## Build

```cmd
build.bat
```

Konkateniert alle JSX-Dateien aus `jsx/` in der korrekten Reihenfolge in eine fertige `index.html` (Babel laeuft im Browser).

JS-Module aus `js/` werden vom Template per `<script src="...">` geladen.

---

## Deployment

GitHub Pages auf Branch `main`.
Live-URL: https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/

---

## Spezifikation

Vollstaendige Spec: `docs/MASTER-BAUSTELLEN-APP.md`

Bei Konflikt zwischen Code und Master-Dokument gewinnt das Master-Dokument.

---

## Stand

**Etappe 6 abgeschlossen** — Modul "Stunden" (Stundenzettel-PDF) voll funktional.

### Stunden-Modul (E6)
- **3-Tab-Navigation:** Heute (Formular), Diese Woche (Historie), Letzte 30 Tage (Historie)
- **Formular-Felder:** Datum (heute), Baustelle (Dropdown, letzte gemerkt), Anfang/Ende als Time-Picker mit 15-Min-Schritten, Pause-Dropdown (0/15/30/45/60 Min), Netto-Stunden live-berechnet
- **Taetigkeits-Pickliste:** 12 Standard-Taetigkeiten (Fliesen Wand/Boden, Verfugen, Silikon, Abdichtung, Estrich, Demontage, Material, Vorbereitung, Endreinigung, Kundengespraech, Fahrzeit) + Freitext "Sonstiges"
- **Material-Popup:** 8 Kategorie-Tabs, Suchfeld, 30 vorinstallierte Fliesenleger-Materialien; pro Eintrag Mengen-Input + Einheit + Speech-Mic fuer schnelle Zahlen-Eingabe
- **Bemerkung** mit Web-Speech-API in MA-Sprache + automatischem Deutsch-Feld (editierbar)
- **Wetter:** 4 Tap-Kategorien (Sonnig/Bewoelkt/Regen/Schnee) ODER Auto-Button via Open-Meteo-API (Geolocation + WMO-Weathercode-Mapping, kein API-Key noetig)
- **WIP-AutoSave:** nach jeder Aenderung (debounced 800ms), beim Wiedereintritt Toast "Entwurf wiederhergestellt"
- **PDF-Generator** (`tw-ma-pdf.js`): jsPDF + autoTable, TW-Briefkopf mit Logo-Kreis, Firmendaten, Titel "Stundenzettel", Kopfdaten-Tabelle (Baustelle, MA, Arbeitszeit, Wetter), Taetigkeiten-Liste, Material-Tabelle, Bemerkung (Deutsch + Original kursiv wenn anders), Footer
- **Drive-Upload-Pfad:** `Staging/{Baustelle}/Stunden/{geraet}_Stundenzettel_{yyyymmdd}.pdf`
- **Sync-Orchestrator** um Item-Typ erweitert (`typ: 'foto' | 'stunde'`), Backoff-Logik weiter aktiv
- **Stunden-Historie:** Einzel-Tap oeffnet PDF-Vorschau (iframe), Status-Icon (gruen=uploaded / orange=pending / rot=fehler)

### Modul "Fotos" (E5)
- **Stufe 1:** Baustellen-Auswahl (Live-Liste aus Firebase)
- **Stufe 2:** Raum-Auswahl mit Dialog "Neuer Raum" (Bezeichnung + Spracheingabe, Raum-Nr, Geschoss KG/EG/OG/DG, Wandzahl 3-8)
- **Stufe 3:** Phase-Wahl (Rohzustand/Abdichtung/Fertigstellung) mit Live-Fortschritts-Badge
- **Stufe 4:** Wand-Raster (2x2 / 3x2 / 4x2) plus Boden plus optional Decke; Foto-Thumbnails inline; Status-Punkt
- **Stufe 5:** Kamera oeffnet automatisch, Vorschau, Wiederholen
- **Stufe 6:** Sprach-Notiz via Web Speech API in MA-Sprache, Auto-Uebersetzung Deutsch, beide Versionen editierbar
- Allgemeine Fotos: bis zu 20 pro Baustelle, eigener Tab

### Offline-First-Stack
- **IndexedDB** mit Stores `fotos`, `raeume`, `stunden`, `sync_queue` (DB-Version 3)
- **Foto-Kompression** auf max. 1920px lange Seite, JPEG q=0.85; Thumbnails 320px
- **Sync-Queue** mit Exponential Backoff (30s -> 2m -> 8m -> 30m -> 2h, max 5 Versuche)
- **Auto-Sync** alle 60 Sekunden + Trigger bei online-Event
- **Item-Typen:** `foto` (Bild + JSON) und `stunde` (PDF)

**Davor:** E4 (Baustellen + Drive-Service), E3 (Onboarding/PIN), E2 (Icons/PWA), E1 (Startseite/Nav), E0 (Skelett).

Naechste Etappe: **E7** — Modul "Nachrichten" (WhatsApp-Style mit Live-Uebersetzung).

## Firebase-Fallback-Format fuer Testen

Lege testweise in Firebase folgende Struktur an:
```
/aktive_baustellen
  bst_001: { name: "Meyer Bad", adresse: "Muehlweg 3, Nisterau", bauherr: "Fam. Meyer", status: "aktiv", zuletzt_geaendert: 1729012345000 }

/baustellen_dateien/bst_001
  zeichnungen:
    z1: { name: "Grundriss.pdf", mime: "application/pdf", size: 450000, ts: 1729012345000, url: "https://..." }
  bilder:
    b1: { name: "Vorort.jpg", mime: "image/jpeg", size: 120000, ts: 1729012345000, url: "https://..." }
  nachrichten:
    n1: { name: "ANWEISUNG_Sicherheit.pdf", mime: "application/pdf", size: 80000, ts: ..., url: "https://..." }
```
