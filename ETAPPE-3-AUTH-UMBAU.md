# ETAPPE 3 — Auth-Schema-Umbau (Hotfix)

## Was wurde geaendert

Die Mitarbeiter-App wurde von ihrem urspruenglichen geraete-zentrischen Schema
auf das nutzerzentrische Schema der Master-App umgestellt:

| Aspekt                 | ALT (geraete/-Schema)                  | NEU (invitations/+users/-Schema)       |
|------------------------|----------------------------------------|----------------------------------------|
| Identifikator          | UUID auf MA-Geraet generiert           | Firebase Anonymous-Auth UID            |
| Code-Generierung       | MA-App generiert 6-stellig             | Master-App vergibt Code+PIN            |
| PIN-Wahl               | MA-Mitarbeiter waehlt PIN selbst       | Thomas legt PIN bei Einladung fest     |
| Firebase-Pfad          | `geraete/{uuid}`                       | `invitations/{code}` + `users/{uid}`   |
| Freigabe-Signal        | `geraete/{uuid}/status === freigegeben`| `users/{uid}/approved === true`        |
| Sperre/Wipe            | `geraete/{uuid}/status === gesperrt`   | `users/{uid}/locked === true`          |
| PIN-Hash               | SHA-256 mit UUID als Salt              | Klartext-Vergleich gegen invitations/  |
| Login-Flow             | Code anzeigen -> warten -> PIN setzen  | Code+PIN eingeben -> warten            |

## Geaenderte Dateien

- **NEU**: `js/tw-ma-auth.js` — kompletter Auth-Layer (Public API: `window.TWMAAuth`)
- **GEAENDERT**: `index.html` — Header (Auth-SDK), AuthContainer, Code-Eingabe-Screen,
  Warte-Screen, neue Uebersetzungs-Keys in 7 Sprachen
- **GEAENDERT**: `index-template.html` — Auth-SDK + tw-ma-auth.js eingebunden

## NICHT enthalten (bewusst, lt. Absprache)

- Migrations-Skript fuer alten `geraete/`-Ast in Firebase — wird ignoriert,
  kein Schreibzugriff mehr aus MA-App auf diesen Pfad
- PIN-Setup-Screen — entfaellt, weil PIN von Thomas vorgegeben wird
- 5-Versuche-Wipe-Logik — entfaellt, weil PIN-Login bei jedem App-Start nicht
  mehr stattfindet (Anonymous-Auth-Token persistiert)

## Login-Flow (neu, knapp)

1. App startet -> liest `tw-ma-uid` aus LocalStorage
2. Kein Eintrag -> `ScreenCodeEingabe` (Code+PIN-Formular)
3. Code+PIN korrekt -> `signInAnonymously()` -> `users/{uid}` schreiben mit
   `approved: false` -> `invitations/{code}.status = 'eingeloest'`
4. `ScreenWarteAufFreigabe` -> Live-Listener auf `users/{uid}`
5. Thomas klickt in Master-App auf "✓" -> `users/{uid}/approved = true`
6. MA-App entsperrt automatisch -> `MainApp` startet
7. Bei naechstem App-Start: Anonymous-Auth-Token persistent ->
   direkt nach `MainApp` (kein PIN-Login mehr noetig)

## Edge-Cases die abgedeckt sind

- Code unbekannt → Fehlertext "Code unbekannt"
- PIN falsch → Fehlertext "PIN falsch" (Einladung bleibt nutzbar)
- Einladung abgelaufen (gueltigBis ueberschritten) → Fehlertext
- Einladung schon eingeloest → Fehlertext (verhindert Doppelnutzung)
- Einladung widerrufen → Fehlertext
- Code-Format zu kurz / falsche Zeichen → Eingabe-Maske blockt
- Im "wartet"-Status App geschlossen + neu geoeffnet → springt zurueck zu Warte-Screen
- Thomas sperrt nachtraeglich → Live-Listener triggert Wipe
- Thomas entfernt User komplett → `null`-Snapshot triggert Wipe
- Notausgang aus Wartebildschirm → "Neu anmelden"-Button

## Test-Checkliste

1. Ohne LocalStorage-Stand: App zeigt Code+PIN-Eingabe
2. Falscher Code: Fehlertext, Eingabe nicht verbraucht
3. Falsche PIN: Fehlertext, Eingabe nicht verbraucht
4. Korrekte Eingabe: Sprung zu Warte-Bildschirm, in Master-App taucht
   "Wartende Geraete-Freigabe" auf
5. Master-App: Klick auf ✓ → MA-App entsperrt automatisch
6. App schliessen + neu oeffnen: User landet direkt in MainApp
7. Master-App: Geraet sperren → MA-App zeigt Wipe-Screen
8. Notausgang: "Neu anmelden" → MA-App ist gewipt, zeigt Code-Eingabe

## Master-Dokument aktualisieren?

Das Master-Dokument `MASTER-BAUSTELLEN-APP.md` beschreibt in Kapitel 12.6
("Geraete-Onboarding") und 12.7 ("PIN-Schutz") noch das ALTE Schema. Diese
Sektionen passen nicht mehr zur Realitaet — bei Gelegenheit ueberarbeiten,
aber nicht dringend, weil das Master-Dokument den Status "lebendes Arbeits-
papier" hat.

## App-Version

`1.0.0-etappe3-fix2-auth-schema`
