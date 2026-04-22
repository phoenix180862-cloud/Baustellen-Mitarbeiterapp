# Etappe 5 · Baustein 1 — Firebase-Fundament für Nachrichten-Modul

**Datum:** 22.04.2026
**Status:** Geliefert, Node-validiert, deploy-bereit
**Voraussetzung:** Etappe 4b deployed (Version `1.0.0-etappe4b` läuft)

---

## Was dieser Baustein macht

Baustein 1 ist **Infrastruktur ohne UI**. Er erweitert den zentralen Firebase-Service um alle API-Methoden, die Kalender, Chat, Baustellen-Planungs-Balken und FCM-Push brauchen. **Sichtbar verändert sich in der App nichts** — Tabs "Kalender" und "Nachrichten" zeigen weiterhin den Platzhalter-Screen "Noch im Bau".

Warum zuerst? Weil jeder folgende Baustein (UI-Kalender, Chat-Thread, Badge, usw.) auf diesen API-Methoden aufsitzt. Wenn die Basis nicht stimmt, kippt der ganze Rest.

---

## Was geändert wurde

| Datei | vorher | nachher | Delta |
|---|---|---|---|
| `js/tw-ma-firebase.js` | 513 Zeilen | 824 Zeilen | +311 Zeilen |
| `index.html` | `1.0.0-etappe4b` | `1.0.0-etappe5-b1-firebase` | nur Version-Bump |

**Keine Änderungen** an: Design, Layout, Komponenten, Auth, Drive-Browser, Baustellen-Modul, CSS.

---

## Neue API-Methoden (in `window.TWMaFirebase`)

### Mitarbeiter-Identity

- `getMeineMaId()` → Promise<string> — liest erst `/users/{uid}/ma_id` (Büro-Slug wie "ivan-petrov"), fällt auf die Firebase-UID zurück, wenn kein Slug gesetzt ist
- `ladeMeinenMitarbeiter()` → Promise<{ma_id, name, sprache, rolle, status}> — Einmal-Read der Stammdaten
- `subscribeMeinMitarbeiter(cb)` → unsubscribe — Live-Listener, feuert bei Stammdaten-Änderungen (z.B. Sprachwechsel durch Büro)

### Kalender

- `subscribeKalenderJahr(maId, jahr, cb)` → unsubscribe — Live-Listener auf `/kalender/{ma-id}/{jahr}/`, Callback bekommt ein Objekt `{ "2026-05-12": {status, stunden, ...}, ... }`
- `schreibeKalenderEintrag(maId, datum, data)` → Promise — Tages-Eintrag setzen; setzt automatisch `eingetragen_von='ma'`, `geaendert_am=jetzt`
- `loescheKalenderEintrag(maId, datum)` → Promise — Tages-Eintrag entfernen

### Baustellen-Planung (Balken im Kalender)

- `subscribeBaustellenPlanungen(cb)` → unsubscribe — Live-Listener auf alle vom Büro geplanten Baustellen-Zeiträume
- `filterePlanungenFuerMa(planungen, maId)` → array — Hilfsfunktion, filtert auf Zeiträume, in denen der MA beteiligt ist

### Chat

- `subscribeChat(maId, cb)` → unsubscribe — Live-Listener auf den Chat-Thread, Callback bekommt chronologisch sortiertes Array von Nachrichten
- `sendeChatNachricht(maId, absenderName, text, sprache, dringend)` → Promise<nachrichtId> — Schreibt Nachricht nach Firebase; Cloud Function übernimmt die Übersetzung async
- `markiereNachrichtGelesen(maId, nachrichtId)` → Promise — Setzt `gelesen=true, gelesen_am=jetzt`
- `zaehleUngeleseneBueroNachrichten(maId)` → Promise<number> — Einmal-Zählung für Badge

### FCM / Push

- `speichereFcmToken(token)` → Promise — Schreibt `/geraete/{uid}/fcm_token` + Timestamp (Cloud Function nutzt das für Push)

---

## Smoke-Test (Browser-Konsole)

Nach Upload der beiden Dateien (und Cache-Reset auf dem Handy) in der Browser-Konsole testen:

```javascript
// 1. Neue API verfügbar?
Object.keys(TWMaFirebase).filter(k => k.startsWith('subscribe') || k.includes('Kalender') || k.includes('Chat'))
// Erwartung: ['subscribeConnectionStatus', 'subscribeUserStatus', 'subscribeAktiveBaustellen',
//             'subscribeMeinMitarbeiter', 'subscribeKalenderJahr',
//             'subscribeBaustellenPlanungen', 'subscribeChat',
//             'schreibeKalenderEintrag', 'loescheKalenderEintrag',
//             'sendeChatNachricht', 'markiereNachrichtGelesen',
//             'zaehleUngeleseneBueroNachrichten']

// 2. Meine ma_id auflösen
await TWMaFirebase.getMeineMaId()
// Erwartung: String (entweder ein Büro-Slug wie "ivan-petrov" oder die Firebase-UID)

// 3. Stammdaten laden
await TWMaFirebase.ladeMeinenMitarbeiter()
// Erwartung: { ma_id, name, sprache, rolle, status }

// 4. Kalender-Jahr 2026 abonnieren
const unsub = TWMaFirebase.subscribeKalenderJahr(await TWMaFirebase.getMeineMaId(), 2026, console.log);
// Erwartung: Sofort wird console.log mit {} (leer) oder bestehenden Einträgen aufgerufen
// Zum Beenden: unsub()

// 5. Chat abonnieren
const chatUnsub = TWMaFirebase.subscribeChat(await TWMaFirebase.getMeineMaId(), msgs => console.log('Chat:', msgs));
// Erwartung: chronologisch sortiertes Array, initial leer

// 6. FCM-Token-Slot schreiben (Dummy)
await TWMaFirebase.speichereFcmToken('TEST-TOKEN-' + Date.now())
// In Firebase Console: /geraete/{uid}/fcm_token sollte den Dummy-Wert haben

// 7. Console-Log beim App-Start prüfen
// Erwartung: "[TWMaFirebase] Etappe-5-Vollausbau (Kalender + Chat + FCM) geladen."
```

---

## Was die Master-App-Seite jetzt liefern muss

Für den Smoke-Test oben muss Folgendes in Firebase existieren:

1. **Mitarbeiter-Knoten** — `/mitarbeiter/{ma-id}/` mit mindestens `{name, sprache, status}`.
   Die Master-App legt das in Etappe-4.1-Baustein-3 automatisch an, wenn ein Gerät zugeordnet wird (`ensureMitarbeiterStammdaten()` in `tw-infrastructure.js`). Wenn noch nicht gelaufen: der Fallback liest aus `/users/{uid}/` — App bleibt lauffähig.

2. **Optional: ma_id-Mapping** — `/users/{uid}/ma_id: "ivan-petrov"`
   Wenn gesetzt, nutzt die App den Slug. Wenn nicht, fällt sie auf die Firebase-UID zurück. Das ist **voll kompatibel** — die Master-App kann jederzeit nachziehen, die MA-App bemerkt den Wechsel beim nächsten App-Start.

3. **Security Rules** (bleiben aus Etappe 4, nur zur Erinnerung):
   - `/kalender/{ma-id}/` — read+write nur wenn `auth.uid === ma_id` oder `root.child('users').child(auth.uid).child('ma_id').val() === ma_id`
   - `/chats/{ma-id}/` — dito
   - `/baustellen_planung/` — read für alle authenticated User, write nur für Büro

---

## Was dieser Baustein NICHT macht

- ❌ Keine UI-Änderung — Tabs bleiben Platzhalter
- ❌ Keine neuen Komponenten in `index.html`
- ❌ Keine CSS-Änderungen
- ❌ Keine Offline-Sync-Logik (IndexedDB) — Baustein 6
- ❌ Kein Service Worker FCM — Baustein 6
- ❌ Keine Übersetzung — macht die Cloud Function im Hintergrund

---

## Deployment

Nur zwei Dateien hochladen in dein GitHub-Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp`:

1. `js/tw-ma-firebase.js` — ersetzen
2. `index.html` — ersetzen (einzige Änderung: Version-String)

Nach dem Deploy auf dem Handy:
1. App beenden (alle Tabs schließen)
2. Browser-Cache leeren
3. App neu laden
4. **Unten sollte `v1.0.0-etappe5-b1-firebase` stehen**
5. Konsole sollte `[TWMaFirebase] Etappe-5-Vollausbau ... geladen.` zeigen

Wenn der Version-String stimmt und die Konsole keinen Fehler wirft, ist Baustein 1 erfolgreich deployed. Dann auf "weiter" für Baustein 2 (Kalender-UI Gerüst).

---

## Was als nächstes kommt (Baustein 2)

- `MAKalenderModul` als React-Komponente in `index.html`
- 3-Jahres-Monatsansicht mit Jahr/Monat-Scroller
- Status-Glyph pro Tag (✓ / U / K)
- Baustellen-Balken am unteren Tag-Rand (farbig pro Baustelle, bis zu 3 überlagert, "+N" bei mehr)
- Live-Listener auf `/kalender/{maId}/{jahr}/` und `/baustellen_planung/`
- **Noch kein** Tages-Modal zum Bearbeiten (das ist Baustein 3)

---

*TW Baustellen-App · Etappe 5 · Baustein 1 · v1.0.0-etappe5-b1-firebase · 22.04.2026*
