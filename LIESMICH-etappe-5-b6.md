# Etappe 5 · Baustein 6 — FCM-Push + Ungelesen-Badge + Status-Indikator

**Datum:** 22.04.2026
**Status:** Geliefert, Babel-validiert, deploy-bereit
**Voraussetzung:** Bausteine 1–5 deployed (`v1.0.0-etappe5-b5-chat-senden` läuft)

---

## Was dieser Baustein bringt

Der letzte große Baustein schließt den UX-Kreis. Ab hier erreicht das Büro den Mitarbeiter auch dann, **wenn die App geschlossen ist oder das Handy im Standby liegt**. Zusätzlich bekommt der Mitarbeiter innerhalb der App sofort sichtbar mit, wenn neue Nachrichten da sind — durch Badge am Tab-Icon und dickem Indikator auf der Startseite.

### Drei sichtbare neue Features

**1. Ungelesen-Badge am Tab "Nachrichten"**
- Rote Pille mit Zahl oben rechts am Sprechblase-Icon
- Zeigt Anzahl ungelesener Büro-Nachrichten
- Zählt ab 99 als "99+"
- Aktualisiert sich live — auch auf anderen Tabs (z.B. während User im Kalender-Tab arbeitet)

**2. Status-Indikator auf Startseite**
- Rote Call-to-Action-Karte direkt unter den Nav-Tabs
- Nur sichtbar wenn ungelesene Nachrichten existieren UND aktueller Tab "Start"
- Zeigt Zahl + lokalisierter Text ("3 neue Nachrichten vom Büro")
- Pulsierender Schatten zieht Aufmerksamkeit
- Tap springt direkt zum Nachrichten-Tab

**3. Push-Benachrichtigungen (FCM)**
- **Permission-Banner** auf der Startseite fragt einmalig nach Erlaubnis
- Zwei sanfte Optionen: "Später" (versteckt Banner für diese Session) oder "Aktivieren"
- Nach "Aktivieren": Browser-Dialog, dann Token-Registration bei Firebase
- Bei bereits abgelehnter Permission: Hinweis-Banner "Push wurde blockiert — in den Browser-Einstellungen aktivieren"
- **Background-Push** kommt als System-Notification (auch bei geschlossener App):
  - Titel: "Nachricht vom Büro" (anpassbar durch Cloud Function)
  - Body: Nachrichtentext (bei Dringend: Übersetzung in MA-Sprache)
  - Bei Dringend: Vibrationsmuster, bleibt bis User reagiert
- **Tap auf Notification** öffnet/fokussiert die App direkt im Nachrichten-Tab

---

## Was geändert wurde

| Datei | vorher (B5) | nachher (B6) | Delta |
|---|---|---|---|
| `index.html` | 5.863 Zeilen | 6.192 Zeilen | +329 Zeilen |
| `js/tw-ma-firebase.js` | 824 Zeilen | 927 Zeilen | +103 Zeilen |
| `firebase-messaging-sw.js` | — | **NEU** 88 Zeilen | +88 Zeilen |

Erste Datei, die seit Baustein 1 angefasst wurde: `js/tw-ma-firebase.js`. Neue Funktionen `initFcm()` und `subscribeFcmForeground()` wurden zum Export hinzugefügt. Die bestehende `speichereFcmToken()`-API (seit Baustein 1 da) wird von `initFcm` intern genutzt.

### Aufschlüsselung `index.html` (+329 Zeilen)

| Bereich | Zeilen |
|---|---|
| UI_LABELS (10 neue Keys × 7 Sprachen) | ~10 |
| CSS-Regeln (Nav-Badge, Push-Banner, Status-Indikator, Animationen) | ~150 |
| 3 neue Komponenten (`MAUngelesenBadge`, `MAStartIndikator`, `MAPushPermissionBanner`) + `useGlobaleChatSubscription` Hook | ~95 |
| `MainApp` Anpassungen (Push-State, FCM-Init-Effect, SW-Message-Handler, Badge-Integration, Startseite-Extensions) | ~60 |
| Head: Firebase-Messaging-SDK | ~1 |

### Aufschlüsselung `tw-ma-firebase.js` (+103 Zeilen)

- `initFcm(vapidKey)` — Vollständige Setup-Orchestrierung: Permission, SW-Registration, Token holen, Speichern in Firebase. Returns sauberen Status: `granted` / `denied` / `default` / `unsupported`
- `subscribeFcmForeground(callback)` — Foreground-Message-Handler für offene App

---

## Was Thomas jetzt in der Master-App-Seite einrichten muss

### 1. VAPID-Key generieren (EINMALIG)

Ohne VAPID-Key läuft die App ganz normal, aber **Push funktioniert nicht** — Permission-Banner zeigt zwar, aber der Klick auf "Aktivieren" meldet `unsupported`.

**Schritt-für-Schritt:**

1. Firebase Console → Projekt `einkaufsliste-98199` → **Project settings** (Zahnrad oben links)
2. Tab **Cloud Messaging**
3. Scroll zu **Web Push certificates**
4. Button **"Generate key pair"** klicken
5. Den Key (langer Base64-URL-String, ca. 100 Zeichen) kopieren

### 2. VAPID-Key in die App einfügen

Zwei Optionen — beide funktionieren:

**Option A (empfohlen, persistent):** In `js/tw-ma-config.js` eine Getter-Methode ergänzen:

```javascript
// In tw-ma-config.js (oder direkt in window.TWMaConfig):
window.TWMaConfig.getFcmVapidKey = function() {
    return 'BPdieserLangeBase64StringVonFirebaseConsole...';
};
```

**Option B (schnell, nicht-persistent):** Über Browser-Konsole testen:

```javascript
window.TW_FCM_VAPID_KEY = 'BPdieserLangeBase64StringVonFirebaseConsole...';
location.reload();
```

### 3. Cloud Function für Push deployen (auf Master-App-Seite)

Laut Etappe-4.1-Protokoll-Abschnitt-9.2 ist das eine separate Firebase-Function, die auf `onCreate /chats/{ma-id}/{nachricht-id}/` lauscht und bei `dringend === true` einen FCM-Push an alle `fcm_token`s des MA schickt.

**Pseudocode für die Function:**

```javascript
exports.pushDringend = functions.database
    .ref('/chats/{maId}/{nachrichtId}')
    .onCreate(async (snap, ctx) => {
        const nachricht = snap.val();
        if (!nachricht || nachricht.dringend !== true || nachricht.von !== 'buero') return;

        // Alle Geraete des MA holen
        const geraete = await admin.database()
            .ref('/geraete').orderByChild('ma_id').equalTo(ctx.params.maId).once('value');

        const tokens = [];
        geraete.forEach(g => {
            const v = g.val();
            if (v && v.fcm_token) tokens.push(v.fcm_token);
        });
        if (tokens.length === 0) return;

        // MA-Sprache ermitteln und passenden Text waehlen
        const mitarbeiter = (await admin.database().ref('/mitarbeiter/' + ctx.params.maId).once('value')).val();
        const sprache = (mitarbeiter && mitarbeiter.sprache) || 'de';
        const text = (nachricht.text_uebersetzt && nachricht.text_uebersetzt[sprache])
            || nachricht.text_original;

        await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            notification: {
                title: 'Dringend vom Büro',
                body:  (text || '').slice(0, 80)
            },
            data: {
                nachricht_id: ctx.params.nachrichtId,
                ma_id:        ctx.params.maId,
                dringend:     'true'
            },
            webpush: {
                fcmOptions: { link: '/' }
            }
        });
    });
```

Ohne diese Function passiert bei "Dringend senden" im Büro nichts auf MA-Seite (außer dem normalen Live-Listener, wenn App offen ist).

---

## Testen

### Test 1: Nav-Badge

1. In Firebase manuell (oder in der Master-App) eine Nachricht für den MA anlegen mit `von: "buero"`, `gelesen: false`
2. **Erwartung Baustellen-App:**
   - Tab "Nachrichten" bekommt rote Pille mit "1"
   - Sichtbar auf allen Tabs (Start, Baustellen, Kalender, Fotos, Stunden)
3. Zweite ungelesene Nachricht anlegen
4. **Erwartung:** Pille zeigt "2"
5. Nachrichten-Tab öffnen, 1,2 Sek warten
6. **Erwartung:** Pille verschwindet (Auto-Mark-as-Read aus Baustein 4)

### Test 2: Status-Indikator auf Startseite

1. Mindestens 1 ungelesene Büro-Nachricht vorhanden
2. Tab "Start" öffnen
3. **Erwartung:** Rote Karte unter den Nav-Tabs mit:
   - 🔔-Icon
   - Zahl (z.B. "3")
   - Text "neue Nachrichten vom Büro"
   - `›`-Pfeil rechts
   - Pulsierender Schatten
4. Auf die Karte tippen
5. **Erwartung:** Springt zum Nachrichten-Tab
6. Alle Nachrichten lesen (Auto-Mark läuft), zurück zu "Start"
7. **Erwartung:** Karte verschwindet

### Test 3: Push-Permission-Banner (Erst-Nutzung)

1. Browser-Permission für die App-Domain zurücksetzen (Chrome: Einstellungen → Datenschutz → Website-Einstellungen)
2. App neu öffnen, PIN eingeben → Startseite
3. **Erwartung:** Blauer Banner mit 🔔
   - Titel "Push-Benachrichtigungen aktivieren"
   - Text "Damit du dringende Nachrichten..."
   - Buttons "Später" (grau) + "Aktivieren" (blau)
4. **Später** tippen → Banner verschwindet. App neu laden → Banner bleibt weg (für diese Session)
5. Seite reloaden + Tab schließen/öffnen → Banner kommt zurück
6. Diesmal **Aktivieren** tippen
7. Browser-Dialog: "Website will Benachrichtigungen zeigen" → Erlauben
8. **Erwartung:**
   - Banner verschwindet
   - Konsole: `[TWMaFirebase] FCM-Token registriert (...)`
   - Firebase `/geraete/{uid}/fcm_token` enthält den Token

### Test 4: Push-Permission blockiert

1. Browser-Permission auf "Blockieren" setzen
2. App neu laden
3. **Erwartung:** Roter Banner mit 🔕 "Push wurde blockiert — in den Browser-Einstellungen aktivieren" (kein Aktivieren-Button)

### Test 5: VAPID-Key fehlt

1. Ohne Konfigurations-Eintrag im Code oder `window.TW_FCM_VAPID_KEY`
2. Permission erteilen
3. **Erwartung:** Konsole `[TWMaFirebase] FCM nicht initialisiert: vapidKey fehlt`. App läuft normal, Banner verschwindet aber FCM ist unsupported-Status. Kein Absturz.

### Test 6: Background-Push (mit funktionierender Cloud Function)

> **Voraussetzung:** VAPID-Key gesetzt + Cloud Function aus 9.2 deployed

1. Permission erteilen, Token ist registriert
2. **App schließen** (Tab schließen auf Desktop bzw. Home-Button auf Handy)
3. Master-App: Chat mit diesem MA öffnen, Nachricht mit Glocken-Button "DRINGEND senden"
4. **Erwartung:** System-Notification erscheint auf Handy (auch wenn App zu)
   - Titel "Dringend vom Büro"
   - Body: erste ~80 Zeichen des Textes (übersetzt in MA-Sprache)
   - Vibration
5. Auf Notification tippen
6. **Erwartung:** App öffnet sich direkt im Nachrichten-Tab, die Nachricht ist bereits da

### Test 7: Foreground-Push (App offen)

1. App offen, Tab "Baustellen" (NICHT Nachrichten)
2. Master-App sendet Nachricht (auch nicht-dringend)
3. **Erwartung:**
   - Badge auf Tab "Nachrichten" zählt hoch
   - Keine System-Notification (damit kein Doppel-Alert)
   - Konsole: `[MA] Foreground FCM: {...}`

### Test 8: Kein Doppel-Badge bei Reload

1. Mehrere ungelesene Nachrichten
2. Seite hart neuladen (Strg+Shift+R)
3. **Erwartung:** Korrekte Zahl im Badge, nicht doppelt/leer

---

## Troubleshooting

### Banner erscheint nicht trotz fehlender Permission

- Banner kommt nur auf Tab "Start", nicht auf anderen Tabs
- Wenn `sessionStorage.tw_ma_push_dismissed === '1'` steht: User hat "Später" gewählt, Banner bleibt weg bis Session-Ende. Zum erzwingen: `sessionStorage.removeItem('tw_ma_push_dismissed'); location.reload();`

### `[TWMaFirebase] SW-Register fehlgeschlagen`

- `firebase-messaging-sw.js` wurde nicht im Root des Deployments abgelegt — muss direkt neben `index.html` liegen, nicht in `js/`
- GitHub Pages: Im Repo direkt auf Root-Ebene ablegen

### Token wird registriert, aber Push kommt nicht an

- Cloud Function fehlt oder wirft Fehler → Firebase Console → Functions → Logs prüfen
- Token in `/geraete/{uid}/fcm_token` ist abgelaufen (passiert alle paar Wochen) → App einmal öffnen, Permission bleibt, neuer Token wird gespeichert
- Chrome blockiert Push bei inaktiven Sites → Browser-Einstellungen → Site-Permissions → "Benachrichtigungen" auf "Zulassen"

### iOS/Safari: Kein Push möglich

- iOS Safari unterstützt Web Push erst ab iOS 16.4 UND nur wenn die App als PWA installiert ist ("Zum Home-Bildschirm hinzufügen")
- Workaround: MA-App auf Android-Handys priorisieren, oder native iOS-App als V2 bauen

### Badge zeigt "0" statt verschwindet

- Shouldn't happen — `MAUngelesenBadge` returnt `null` bei count <= 0. Wenn doch: Screenshot + Browser-Version an mich.

### Background-Notification fehlt Titel/Body

- Cloud Function sendet nur `data`, nicht `notification` → im Background-Handler wird dann der Fallback "Nachricht vom Büro" angezeigt (ohne Text)
- Lösung: Cloud Function mit `notification: {title, body}` senden (siehe Pseudocode oben)

---

## Was dieser Baustein NICHT macht (Absicht)

- ❌ Keine silent-push Sync-Logik (wenn App im Hintergrund) — zu komplex, wird durch Live-Listener beim Reopen abgedeckt
- ❌ Keine Notification-Gruppierung bei vielen Nachrichten — jede Nachricht ist eine Notification
- ❌ Keine lokalen Notifications bei verpassten Kalender-Terminen — eigenes Thema, kommt evtl. V2
- ❌ Keine Badge-Anzeige auf App-Icon (iOS/Android Home-Screen) — braucht native App, PWA kann das nur begrenzt

---

## Deployment

**DREI Dateien** ins Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp`:

1. `index.html` — ersetzen
2. `js/tw-ma-firebase.js` — ersetzen
3. `firebase-messaging-sw.js` — **NEU** in Root legen (nicht in `js/`!)

Nach dem Deploy:

1. App beenden, Cache leeren (Strg+Shift+R)
2. Neu öffnen: Version unten `v1.0.0-etappe5-b6-fcm-badge`
3. Konsole: `[TWMaFirebase] Etappe-5-Vollausbau (Kalender + Chat + FCM) geladen.`
4. Startseite: Push-Permission-Banner sichtbar (wenn noch nicht erteilt)
5. Test 1 (Badge) und Test 2 (Startseiten-Indikator) mit Dummy-Nachrichten in Firebase

Danach: VAPID-Key generieren + einbauen → **Test 6 (Background-Push)** ist das Erfolgs-Kriterium. Sobald das grün ist, ist Etappe 5 faktisch **komplett**.

---

## Was als nächstes kommt (Baustein 7 — Finale)

**Baustein 7** ist ein reines **Dokumentations- und Konsolidierungs-Paket**:

- `LIESMICH-etappe-5.md` — Gesamt-Doku für Etappe 5 mit End-to-End-Tests, Architektur-Diagramm und Feld-Einsatz-Checkliste
- Konsolidiertes ZIP mit allen Dateien (eine komplette, saubere Auslieferung)
- Optional: Mini-Patch bei Bugs die beim B1–B6-Testen aufgetaucht sind
- Check-Tool zum Prüfen ob alle Baustein-Outputs konsistent sind

Nach Baustein 7 steht die App bereit für **Etappe 6 (Fotos-Modul)** und **Etappe 7 (Stunden-Modul)** — die letzten zwei Tabs (Fotos + Stunden) können dann entstubbt werden.

---

## Gesamtbilanz Etappe 5 nach Baustein 6

**Funktional komplett:**
- ✅ Kalender lesen + schreiben (Bausteine 2+3)
- ✅ Chat empfangen + senden (Bausteine 4+5)
- ✅ Push-Notifications bei geschlossener App (Baustein 6)
- ✅ Live-Badges für ungelesene Nachrichten (Baustein 6)

**Firebase-Datenflüsse aktiv:**
- `/mitarbeiter/{ma-id}/` — Stammdaten-Read
- `/kalender/{ma-id}/{jahr}/{datum}/` — bidirektional
- `/chats/{ma-id}/{nachricht-id}/` — bidirektional mit Lesestatus
- `/baustellen_planung/{id}/{id}/` — read-only für Kalender-Balken
- `/geraete/{uid}/fcm_token` — write

**Code-Wachstum Etappe 5:**
- `index.html`: 3.797 Zeilen (Start B1) → 6.192 Zeilen (Ende B6) = **+2.395 Zeilen**
- `js/tw-ma-firebase.js`: 513 Zeilen → 927 Zeilen = **+414 Zeilen**
- Neue Datei: `firebase-messaging-sw.js` 88 Zeilen
- Gesamt: **~2.900 Zeilen neuer Code in Etappe 5**

---

*TW Baustellen-App · Etappe 5 · Baustein 6 · v1.0.0-etappe5-b6-fcm-badge · 22.04.2026*
