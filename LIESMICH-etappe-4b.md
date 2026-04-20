# Etappe 4b — Baustellen-Ordner mit echtem Drive-Browser

**Datum:** 20.04.2026
**Status:** Komplett, Babel-validiert, deploy-bereit
**Voraussetzung:** Etappe 4a (2-Ordner-Modell, 5 Sub-Kacheln als Stubs) deployed und getestet

---

## Was diese Etappe bringt

Die 5 Sub-Kacheln unter jeder Baustelle sind keine Platzhalter mehr. Drei davon werden in Etappe 4b mit echtem Leben gefüllt, zwei bleiben bewusst Stubs bis zu ihren dedizierten Etappen:

| Sub-Kachel | Etappe 4b | Inhalt |
|---|---|---|
| 📐 **Zeichnungen** | ✅ fertig | Drive-Browser — Grundrisse, Detailpläne, Schnitte |
| 💬 **Anweisungen** | ✅ fertig | Drive-Browser — Arbeitsanweisungen, Sicherheit, Material |
| 🏗️ **Baustellendaten** | ✅ fertig | Strukturierte Felder-Ansicht aus Firebase |
| 📸 **Fotos** | 🔜 Etappe 6 | Stub mit Hinweis |
| ⏱️ **Stunden** | 🔜 Etappe 7 | Stub mit Hinweis |

Außerdem:

- Die Kundenliste filtert jetzt **serverseitig nach Mitarbeiter-UID** (`freigegebene_geraete/{uid}: true`) und ist ein echter Live-Listener — neue Freigaben aus der Master-App erscheinen ohne Reload.
- Listings sortieren nach `letzter_push` absteigend, beendete Baustellen wandern ans Ende.
- Status-Punkt pro Baustelle (grün/gelb/grau) zeigt aktiv/pausiert/beendet.

---

## Was sichtbar geändert wurde

### Baustellen-Liste

- Live-Update bei Änderungen in Firebase (kein manuelles Pull-to-Refresh nötig)
- Kleiner farbiger Status-Punkt unten rechts am Helm-Icon
- Sortierung: aktuellste aktive Baustelle oben, beendete unten

### Drive-Browser (Zeichnungen + Anweisungen)

- Dateiliste mit Mime-Icons (Ordner gelb, Bild violett, PDF rot, andere grau)
- Datum + Größe pro Datei
- **Breadcrumb-Navigation** oben: klickbar, springt zur jeweiligen Ebene
- **Refresh-Button** oben rechts (leert Cache, lädt neu)
- **Zurück-Button** im Sub-Header: eine Ebene hoch, auf Wurzel-Ebene zurück zu den Sub-Kacheln
- Klick auf Bild → **Fullscreen-Lightbox** mit Pinch-Zoom, Download-Button, ESC schließt
- Klick auf PDF → **Fullscreen-Viewer** (Google Drive Preview-iframe) mit Download + ESC
- Klick auf Word/Excel/anderes → öffnet neue Browser-Tab mit Drive-Weboberfläche
- Saubere Empty-/Fehler-Screens mit passenden Emojis statt weißer Seiten

### Baustellendaten-Ansicht

Strukturierte Felder-Anzeige in sieben aufklappbaren Gruppen — gefüllte Gruppen werden gezeigt, leere automatisch versteckt:

1. **Objekt** — Name, Adresse (aus dem Top-Level der Baustelle)
2. **Bauherr** — Name, Telefon (als `tel:`-Link), E-Mail (als `mailto:`-Link)
3. **Beteiligte** — Architekt, Bauleitung, Ansprechpartner jeweils mit Telefon
4. **Zugang vor Ort** — Hausmeister + Telefon, freier Zugangstext
5. **Technik** — Strom/Wasser verfügbar (Ja/Nein)
6. **Zeitraum** — Start-/Enddatum
7. **Besonderheiten** — Mehrzeilger Freitext

Ein Tipp auf eine Telefonnummer ruft sie an, ein Tipp auf eine E-Mail öffnet das Mail-Programm.

---

## Was die Master-App jetzt liefern muss

Drei Dinge müssen auf der Master-App-Seite stimmen, sonst bleibt die Baustellen-App zwar lauffähig, aber inhaltsleer. Die App zeigt dann klare, mehrsprachige Hinweis-Screens — keine kaputten Views.

### 1. Google-Drive-API-Key

Einmalig einen Browser-API-Key in der Google-Cloud-Console erstellen und in `js/tw-ma-config.js` eintragen:

```javascript
const DRIVE_CONFIG = {
    apiKey: 'AIzaSy...',  // <-- hier
    ...
};
```

**Schritt-für-Schritt (in der Google-Cloud-Console):**

1. Projekt `einkaufsliste-98199` auswählen (dasselbe wie Firebase).
2. *APIs & Services → Bibliothek* → **Google Drive API** aktivieren.
3. *APIs & Services → Anmeldedaten* → *Anmeldedaten erstellen → API-Schlüssel*.
4. **Sofort einschränken:** Schlüssel bearbeiten →
   - *Anwendungseinschränkungen:* „HTTP-Verweise (Websites)" → `https://<github-user>.github.io/*` und `http://localhost:*/*` (für lokale Tests)
   - *API-Einschränkungen:* „Schlüssel beschränken" → nur **Google Drive API** anhaken.
5. Schlüssel kopieren, in `DRIVE_CONFIG.apiKey` einfügen, **deployen**.

Alternativ für schnelle Tests ohne Rebuild: Den Key zur Laufzeit in der Browser-Konsole setzen:

```javascript
TWMaDriveService.setApiKey('AIzaSy...');
location.reload();
```

### 2. Staging-Parent-Ordner per Link freigeben

Damit der Browser-API-Key ohne OAuth lesen darf, muss der Staging-Bereich in Drive per Link-Sharing sichtbar sein:

1. In Drive: Rechtsklick auf `Baustellen-App-Staging` → **Teilen**.
2. *Allgemeiner Zugriff* → „Jeder mit dem Link" → Rolle **Zuschauer**.
3. Fertig — die Freigabe vererbt sich auf alle Unterordner und Dateien.

Wichtig: Der Link selbst landet **nicht** öffentlich im Netz — die Drive-API erfordert weiterhin den API-Key. Die Freigabe macht die Dateien nur für die API sichtbar. Trotzdem: **Nichts Privates** außerhalb von `Baustellen-App-Staging` anfassen.

### 3. Erweiterungen im Firebase-Knoten `/aktive_baustellen/{id}/`

Pro freigegebener Baustelle erwartet die MA-App folgende Zusatz-Felder — alles optional (ohne zeigt die MA-App einen Hinweis), aber ohne `staging_folder_id` bleibt der Drive-Browser leer:

```
/aktive_baustellen/{baustelle-id}/
  ├── name, adresse, status, letzter_push     ← wie gehabt
  ├── freigegebene_geraete/{uid}: true         ← wie gehabt
  ├── staging_folder_id: "1aBcDeF..."          ← NEU: Drive-Folder-ID des Baustellen-Root im Staging
  ├── staging_folder_ids/                      ← NEU, OPTIONAL: Shortcut mit direkten Sub-IDs
  │     ├── zeichnungen:     "1..."
  │     ├── anweisungen:     "1..."
  │     ├── baustellendaten: "1..."
  │     ├── fotos:           "1..."
  │     └── stunden:         "1..."
  └── baustellendaten/                         ← NEU: strukturierte Felder fuer die Baustellendaten-View
        ├── bauherr:              "Familie Meyer"
        ├── bauherr_tel:          "+49 171 1234567"
        ├── bauherr_mail:         "meyer@example.com"
        ├── architekt:            "Architekturbuero Schmidt"
        ├── architekt_tel:        "..."
        ├── bauleitung:           "..."
        ├── bauleitung_tel:       "..."
        ├── ansprechpartner:      "..."
        ├── ansprechpartner_tel:  "..."
        ├── hausmeister:          "..."
        ├── hausmeister_tel:      "..."
        ├── zugangsinfo:          "Schluessel bei Nachbarn links, Klingeln reicht nicht"
        ├── strom_verfuegbar:     true
        ├── wasser_verfuegbar:    true
        ├── start_datum:          "2026-05-01"   (ISO oder Unix-ms)
        ├── end_datum:            "2026-06-15"
        └── besonderheiten:       "Altbau 1920, Leitungen komplett neu"
```

**Shortcut-Empfehlung:** Wenn die Master-App die 5 Sub-Ordner-IDs beim Anlegen kennt, sollte sie `staging_folder_ids/` direkt mitschreiben. Das spart der MA-App ein Listing-Request pro Sub-Kachel-Öffnung. Wenn nicht gesetzt, löst die MA-App per Name-Match auf (funktioniert auch, ist nur einen Request teurer).

### Firebase Security Rules (Ergänzung)

Die bestehenden Rules für `aktive_baustellen/` erlauben bereits Lese-Zugriff pro UID. Keine Änderung nötig für Etappe 4b. Die neuen Felder (`staging_folder_id`, `baustellendaten`) fallen unter dieselbe Read-Rule des Baustellen-Knotens.

---

## Was technisch geändert wurde

### Komplett neu gebaut

| Datei | Zeilen | Inhalt |
|---|---|---|
| `js/tw-ma-drive-service.js` | ~400 | Vom 41-Zeilen-Stub zum Vollausbau: API-Key-Mgmt, `listFolder`, `findChildByName`, `listKachelFolder`, `getFileMetadata`, URL-Builder für Bild/PDF/Download, Mime-Helper, Memory-Cache (5 Min TTL) |

### Komplett ersetzt

| Datei | vorher → nachher | Änderung |
|---|---|---|
| `jsx/tw-ma-baustellen.jsx` | 349 → 1165 Z. | `MABaustelleBrowserStub` weg, neu: `MAKachelRouter`, `MABaustelleBrowser`, `MABrowserToolbar`, `MADateiListe`, `MADateiRow`, `MABrowserHinweis`, `MABildLightbox`, `MAPdfViewer`, `MABaustellendatenView`, `MABdGruppe`, `MABdFeld`, `MAStubView`; Liste nutzt jetzt Live-Subscription |

### Erweitert

| Datei | Änderung |
|---|---|
| `js/tw-ma-config.js` | +`DRIVE_CONFIG`-Block (~20 Z.), +`BROWSER_LABELS` (~450 Z. — 60+ Keys × 7 Sprachen), Export ergänzt |
| `js/tw-ma-firebase.js` | `ladeAktiveBaustellen` filtert nach `auth.uid` + sortiert nach `letzter_push`, NEU: `subscribeAktiveBaustellen`, `ladeBaustelle` |
| `jsx/tw-ma-shared-components.jsx` | 9 neue `MAIcon`-Namen: `ordner`, `datei`, `pdf`, `bild`, `download`, `x-close`, `aktualisieren`, `telefon`, `mail`, `info` |

### Build-Scripts

Keine Anpassung nötig — die JSX-Reihenfolge aus 4a passt weiterhin:
`shared-components → auth → onboarding → startseite → baustellen → nachrichten → app`

---

## Testen

### Voraussetzung: Mindest-Setup

Ohne diese zwei Dinge kann man nichts testen:

1. `DRIVE_CONFIG.apiKey` in `js/tw-ma-config.js` eingetragen **oder** `TWMaDriveService.setApiKey(...)` in der Konsole
2. Mindestens eine Baustelle in Firebase mit `staging_folder_id` + `freigegebene_geraete/{uid}: true` für das Test-Gerät

### Test 1: Kundenliste

1. App öffnen, PIN eingeben
2. Auf **Baustellen**-Kachel tippen
3. **Erwartung:** Liste der freigegebenen Baustellen, Status-Punkt sichtbar, Adresse darunter
4. In der Master-App eine weitere Baustelle freigeben → **muss sofort** in der MA-App erscheinen (Live-Listener)

### Test 2: Detail-Screen mit 5 Sub-Kacheln

1. Baustelle antippen
2. **Erwartung:** Adresse als grauer Chip oben, 2×3-Grid mit 5 Sub-Kacheln (letzte Zeile hat nur 1 Kachel bei 5 = ok)
3. Label in gewählter Sprache, jeweils passendes Icon

### Test 3: Zeichnungen-Browser

1. Sub-Kachel **Zeichnungen** tippen
2. **Erwartung:** Spinner → Dateiliste des `Zeichnungen/`-Unterordners
3. Breadcrumb oben zeigt `Zeichnungen` (disabled), rechts Refresh-Button + Zähler
4. PDF antippen → Fullscreen-Viewer öffnet, Download-Button funktioniert, ESC schließt
5. Bild antippen → Lightbox, pinch-zoom geht (auf Handy/iPad), Download + ESC funktionieren
6. Falls Unterordner existieren: Ordner öffnen → Breadcrumb wächst, Zurück-Button geht eine Ebene hoch

### Test 4: Anweisungen-Browser

Wie Test 3, aber Sub-Kachel **Anweisungen**. Falls das Büro noch keinen `Anweisungen/`-Unterordner angelegt hat → MA-App zeigt `Der Unterordner "Anweisungen" existiert noch nicht` (kein Fehler, sondern freundlicher Hinweis).

### Test 5: Baustellendaten

1. Sub-Kachel **Baustellendaten** tippen
2. **Erwartung:** Strukturierte Gruppen mit den hinterlegten Feldern
3. Telefonnummer antippen → Handy ruft an
4. E-Mail antippen → Mail-App öffnet
5. Leere Gruppen (z.B. wenn `hausmeister` nicht gesetzt) verschwinden automatisch
6. Komplett leere Baustellendaten → Hinweis-Screen „Für diese Baustelle sind noch keine Daten hinterlegt"

### Test 6: Fotos / Stunden (Stubs)

1. Jeweils antippen
2. **Erwartung:** Klarer Hinweis-Screen mit Emoji, Titel, Erklärtext. Kein Fehler.

### Test 7: Fehler-Pfade

- Kein API-Key → „Der Drive-Zugriff ist noch nicht konfiguriert"
- `staging_folder_id` fehlt → „Diese Baustelle ist noch nicht vollständig eingerichtet"
- API-Key falsch/abgelaufen → „Dateien konnten nicht geladen werden" + Fehlertext in Monospace
- Offline → dieselbe Fehlermeldung (Cache liefert, was noch im Speicher ist)

### Test 8: Sprachwechsel

Sprach-Pill → jede der 7 Sprachen durchgehen. Alle neuen Labels (Sub-Kacheln, Browser-Hinweise, Baustellendaten-Feldnamen, Stub-Texte) müssen korrekt übersetzt sein. Auch die Toolbar-Texte („Aktualisieren", „{n} Datei(en)").

---

## Troubleshooting

### „Dateien konnten nicht geladen werden — HTTP 403"

Der API-Key ist da, aber der Staging-Ordner ist nicht per Link freigegeben. **Lösung:** Staging-Parent-Ordner in Drive „Jeder mit dem Link (Zuschauer)" setzen.

### „Dateien konnten nicht geladen werden — HTTP 400"

Meist ist der API-Key falsch eingeschränkt (Referrer passt nicht zur Domain) oder die Drive-API ist im GCP-Projekt nicht aktiviert. **Lösung:** In der Cloud Console die Key-Einschränkungen prüfen; API aktivieren.

### Bilder in der Lightbox laden nicht

Die Drive-URLs `drive.google.com/uc?export=view&id=...` benötigen, dass die Datei per Link freigegeben ist. Wenn ein einzelnes Bild nicht lädt, aber andere schon: manuell prüfen, ob diese Datei eine eigene Freigabe-Einstellung hat, die sie versteckt.

### PDF-Viewer bleibt weiß

Gleiche Ursache wie oben — die PDF-Preview-URL funktioniert nur bei Link-Freigabe. Der **Herunterladen**-Button ist in dem Fall der Notausgang.

### Kundenliste bleibt leer, obwohl Baustelle freigegeben

- `freigegebene_geraete/{uid}: true` — die UID muss die des *Anonymous-Auth-User* sein, den die MA-App bei Einlösung des Einladungs-Codes bekommt. Prüfen in Firebase Console unter `users/{uid}` — dort steht der Mitarbeitername; diese UID muss unter `aktive_baustellen/{id}/freigegebene_geraete/` als Key stehen.
- Security-Rules: Die Read-Rule prüft `data.child('freigegebene_geraete').child(auth.uid).val() === true`. Bei Abweichung wird das Firebase-Listing leer sein.

### „MAIcon is not defined" in der Konsole

Build-Script noch mal laufen lassen (`./build-linux.sh` oder `build.bat`). Die JSX-Reihenfolge muss zwingend `shared-components` zuerst haben.

---

## Was noch fehlt (nächste Etappen)

- **Etappe 5:** 3-Jahres-Kalender mit Tages-Modal, WhatsApp-style Chat mit Live-Übersetzung
- **Etappe 6:** Fotos-Workflow (Phase → Raum → Wand → Foto → Sprachnotiz → Sync)
- **Etappe 7:** Stunden-Workflow (PDF-Formular, Material-Popup)
- **Etappe 8:** FCM-Push-Notifications, Performance-Polish
- **Später:** Offline-IndexedDB-Cache für Drive-Listings (derzeit nur Memory-Cache, verfällt bei App-Neustart)

---

*TW Baustellen-App · Etappe 4b · v1.0.0-etappe4b · 20.04.2026*
