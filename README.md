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
| 4 | Fotos | Wand-/Phasen-Dokumentation mit Sprach-Notiz | **E5** |
| 5 | Stunden | Stundenzettel-PDF mit Material-Popup | E6 |
| 6 | Nachrichten | Live-uebersetzter Chat mit Buero | E7 |

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

**Etappe 5 abgeschlossen** — Modul "Fotos" (HERZSTUECK) voll funktional.

### Workflow
- **Stufe 1:** Baustellen-Auswahl (Live-Liste aus Firebase)
- **Stufe 2:** Raum-Auswahl mit Dialog "Neuer Raum" (Bezeichnung + Spracheingabe, Raum-Nr, Geschoss KG/EG/OG/DG, Wandzahl 3-8)
- **Stufe 3:** Phase-Wahl (Rohzustand grau-blau / Abdichtung orange / Fertigstellung gruen) mit Live-Fortschritts-Badge
- **Stufe 4:** Wand-Raster (2x2 / 3x2 / 4x2) plus Boden plus optional Decke; Foto-Thumbnails inline; Status-Punkt (gruen/orange/rot)
- **Stufe 5:** Kamera oeffnet automatisch (Mobile: getUserMedia/capture=environment), Vorschau, Wiederholen
- **Stufe 6:** Sprach-Notiz via Web Speech API in MA-Sprache, Auto-Uebersetzung Deutsch (Passthrough bis Etappe 7), beide Versionen editierbar

### Allgemeine Fotos
- Bis zu 20 pro Baustelle, eigener Tab
- Numerierung: allgemein-1 ... allgemein-20
- Loesch-Button pro Foto

### Offline-First-Stack
- **IndexedDB** mit Stores `fotos`, `raeume`, `sync_queue` (inkl. Indexe baustelle/sync_status/raum_phase/next_try_at)
- **Foto-Kompression** auf max. 1920px lange Seite, JPEG q=0.85
- **Thumbnails** 320px fuer schnelles Wand-Raster
- **Sync-Queue** mit Exponential Backoff (30s -> 2m -> 8m -> 30m -> 2h, max 5 Versuche)
- **Auto-Sync** alle 60 Sekunden + Trigger bei online-Event
- **Drive-Pfad:** `Staging/{Baustelle}/Bilder/{Phase}/{Raum}/{geraet}_{phase}_{raum}_{wand}_{ts}.jpg`
- **Notiz-JSON** parallel zu jedem Foto hochgeladen (selber Name + .json) mit Metadaten

### Sync-UI
- Live-Pending-Badge in Sub-Header aller Foto-Stufen
- Manueller Sync-Button
- Online/Offline-Erkennung
- Foto-Blob wird nach erfolgreichem Upload aus IndexedDB freigegeben (Speicher-Schonung)

**Davor:** Etappe 4 (Modul Baustellen + Drive-Service), 3 (Onboarding/PIN), 2 (Icons/PWA), 1 (Startseite/Nav), 0 (Skelett).

Naechste Etappe: 6 — Modul "Stunden" (PDF-Formular + Material-Popup).

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
