# HOTFIX 1 · Nachrichten-Eingabefeld · Stand 22.04.2026

**Version:** `v1.0.0-etappe5-b6-fcm-badge-hotfix1`
**Cache-Version:** `tw-ma-v1.0.2`
**Scope:** nur `index.html` + `service-worker.js` (Cache-Bump fuer Auslieferung)
**Etappe:** 5 — Hotfix nach Produktivgang

---

## Bug-Report

Thomas meldete: **"Die Nachrichten-Eingabe laesst sich nicht aktivieren. Das Feld ist tot, man kann dort keinen Text eingeben."**

## Ursachen-Analyse

Der Bug sass **nicht im Layout** (wie zunaechst vermutet), sondern in der Logik der Komponente `MANachrichtenInput`:

```javascript
// ALT (buggy):
const inputDisabled = !maId || sendet;
```

Wenn beim App-Start die Mitarbeiter-Identity (`maId`) noch nicht aufgeloest war — typischerweise ein **Auth-Race**, bei dem `MANachrichtenModul` mountete, bevor `firebase.auth().currentUser` da war — blieb `maId = null`. Das `useEffect` feuerte zwar `TWMaFirebase.ladeMeinenMitarbeiter()`, aber:

1. `getMeineUid()` gab `null` zurueck (Auth noch nicht fertig)
2. `ladeMeinenMitarbeiter()` gab konsequent `null` zurueck
3. Der Code-Pfad `if (ma) { setMaId(...); }` lief leer
4. Es gab **keinen Retry** — nur einmal beim Mount, dann Schicht im Schacht
5. Die Textarea war fuer immer `disabled`

Resultat: Das Feld bekam keinen Focus, die Tastatur ging auf Mobile nicht auf. Fuer Thomas sah es aus wie "Feld nicht aktivierbar".

## Fix 1 — `MANachrichtenInput` (index.html ~Zeile 5829)

```javascript
// NEU:
// HOTFIX v1.0.0-etappe5-b6-fcm-badge-hotfix1:
// Eingabe ist immer moeglich, nur waehrend des Sendens kurz gesperrt.
// Der Senden-Button bleibt weiterhin ueber istSendbereit() korrekt gesteuert.
const inputDisabled = sendet;
```

**Wichtig:** Der Senden-Button bleibt weiterhin via `istSendbereit()` korrekt gesteuert — er ist nur enabled, wenn `maId && text.trim().length > 0 && !sendet`. Es kann also nichts Unsendbares gesendet werden. Der User kann jetzt **tippen, auch wenn die Identity noch nicht fertig aufgeloest ist** — und sobald sie da ist (typisch <500ms), wird der Senden-Button lebendig.

## Fix 2 — `MANachrichtenModul` (index.html ~Zeile 5443)

Die Identity-Aufloesung wurde **resilient** gemacht:

- **Retry-Logik:** Bis zu 12 Versuche, sanft ansteigend (500ms / 600ms-Delay)
- **UID-Fallback:** Wenn `ladeMeinenMitarbeiter()` kein Mitarbeiter-Objekt liefert (Stammdaten fehlen), wird via `TWMaFirebase.getMeineMaId()` direkt die blanke maId gezogen — reicht, um Nachrichten senden zu koennen
- **Service-Warten:** Falls `window.TWMaFirebase` beim Mount noch nicht injiziert ist, wartet der Loader, statt aufzugeben

Damit ist die Komponente robust gegen:
- Spaeten Auth-State-Change
- Verzoegertes Laden von `tw-ma-firebase.js`
- Fehlende oder noch nicht angelegte Mitarbeiter-Stammdaten im Firebase

## Was unveraendert bleibt

- Alle Architektur-Regeln aus dem Uebergabe-Protokoll, Abschnitt 4
- Alle Etappe-5-Entscheidungen (Abschnitt 5): `getMeineMaId()`-Kapselung, Chat-Firebase-Pfade, Auto-Mark-as-Read, Dringend-opt-in pro Nachricht, kein optimistisches UI im Chat
- Firebase-Rules, Cloud Functions, VAPID-Key-Integration — alles out of scope

## Dateien geaendert

| Datei | Aenderung |
|---|---|
| `index.html` | `APP_VERSION`-Bump, MANachrichtenModul-useEffect neu, MANachrichtenInput.inputDisabled neu |
| `service-worker.js` | `CACHE_VERSION` auf `tw-ma-v1.0.2` gebumpt (alle Clients holen die neue index.html) |

## Sanity-Checks vor Auslieferung

- ✓ Babel-Parse: 224973 Zeichen, kein Syntaxfehler
- ✓ Klammern-Balance: 1560/1560 geschweift, 1722/1722 rund
- ✓ APP_VERSION + CACHE_VERSION gebumpt → SW laedt neu

## Auslieferung / Upload-Anleitung

1. Die 2 geaenderten Dateien via GitHub hochladen (Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp`):
   - `index.html`
   - `service-worker.js`
2. GitHub Pages deployt automatisch.
3. **Auf den Mitarbeiter-Geraeten:** Beim naechsten App-Start erscheint das `SW_UPDATED`-Event — die App zieht sich die neue Version. Falls die App schon offen ist, einfach **einmal Tab schliessen und neu oeffnen** — der SW aktiviert dann die neue Version.

## Test-Pfad fuer Thomas

1. App im Bueromirror oeffnen (oder auf dem Testgeraet als Mitarbeiter einloggen)
2. In den Nachrichten-Tab wechseln
3. Sofort (ohne zu warten) ins Eingabefeld tippen
4. **Soll:** Cursor erscheint, Tastatur geht auf, Text kann eingegeben werden
5. **Soll:** Senden-Button wird lebendig, sobald die Identity-Aufloesung durchgelaufen ist (meist <500ms)
6. Nachricht abschicken → landet im Thread → kommt im Buero an

---

**Kein Rollback noetig** — dieser Hotfix ist rueckwaerts-kompatibel und reduziert nur das `disabled`-Verhalten und vergroessert die Robustheit der Identity-Aufloesung.
