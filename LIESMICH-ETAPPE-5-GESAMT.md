# TW Baustellen-App · Etappe 5 — GESAMTDOKUMENTATION

**Datum:** 22.04.2026
**Status:** Etappe 5 vollständig abgeschlossen, 7 Bausteine ausgeliefert
**Finale Version:** `v1.0.0-etappe5-b6-fcm-badge`

---

## 1. Executive Summary

Etappe 5 der TW Baustellen-App bringt das **Nachrichten-Modul** live — bestehend aus einem 3-Jahres-Kalender für Mitarbeiter-Status und einem bidirektionalen Chat mit dem Büro, inklusive Übersetzungs-Anzeige und Push-Notifications. Nach Etappe 5 ist der Kommunikationsfluss zwischen Baustelle und Büro vollständig geschlossen — der Mitarbeiter kann seinen Arbeitstag eintragen, dringende Anweisungen empfangen, mit dem Büro chatten und wird auch dann erreicht, wenn die App geschlossen ist.

### Was die App nach Etappe 5 kann

| Modul | Status vor Etappe 5 | Status nach Etappe 5 |
|---|---|---|
| Start / Auth / PIN | ✅ fertig | ✅ fertig (unverändert) |
| Baustellen-Ordner + Drive-Browser | ✅ fertig (4b) | ✅ fertig (unverändert) |
| Kalender | ⬜ Platzhalter | ✅ **3-Jahres-Kalender mit Eintragen, Baustellen-Balken, Status-Glyphen** |
| Nachrichten (Chat) | ⬜ Platzhalter | ✅ **WhatsApp-Chat mit Übersetzung, Dringend-Toggle, Push** |
| Fotos | ⬜ Platzhalter | ⬜ Platzhalter (kommt in Etappe 6) |
| Stunden | ⬜ Platzhalter | ⬜ Platzhalter (kommt in Etappe 7) |

### Feld-Einsatz-Reife

**Kern-Kommunikation produktiv.** Der Mitarbeiter kann heute den Arbeitstag verwalten (Kalender) und dem Büro antworten (Chat) — alles aus der einen App. Fotos und Stunden bleiben die zwei offenen Punkte für komplette Autonomie, beide sind separate Etappen.

---

## 2. Architektur-Diagramm

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│   TW MASTER-APP (Büro, Thomas + Team)     │   TW BAUSTELLEN-APP (MA)      │
│                                           │                               │
│   ┌─────────────────────────────────┐     │   ┌─────────────────────────┐ │
│   │ Baustellen-Modul                │     │   │ 6 Tabs:                 │ │
│   │  ├ Kunden-Liste                 │     │   │  ├ Start                │ │
│   │  ├ 2 Ordner-Kacheln pro Bst     │     │   │  ├ Baustellen (→Drive)  │ │
│   │  │  ├ BAUSTELLEN-DATEN (5 Sub)  │     │   │  ├ Kalender ←── NEU (5) │ │
│   │  │  └ NACHRICHTEN (Kal + Chat)  │     │   │  ├ Fotos (Stub)         │ │
│   │  └ Hauptkalender (4. Button)    │     │   │  ├ Stunden (Stub)       │ │
│   │                                 │     │   │  └ Nachrichten ← NEU(5) │ │
│   └─────────────────────────────────┘     │   └─────────────────────────┘ │
│            ▲           │                  │            │        ▲         │
│            │           │                  │            │        │         │
│            ▼           ▼                  │            ▼        ▼         │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                  FIREBASE REALTIME DATABASE                       │   │
│  │                                                                   │   │
│  │  /aktive_baustellen/{id}/       (Etappe 4)                        │   │
│  │  /geraete/{uuid}/               + fcm_token (NEU in B6)           │   │
│  │  /users/{uid}/                  (ma_id Mapping)                   │   │
│  │  /mitarbeiter/{ma-id}/          (Etappe 4.1 · stammdaten)         │   │
│  │  /kalender/{ma-id}/{jahr}/{datum}/   ← NEU in B2+B3               │   │
│  │  /baustellen_planung/{id}/      (Etappe 4.1 · read-only)          │   │
│  │  /chats/{ma-id}/{nachricht-id}/ ← NEU in B4+B5                    │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│       ▲                  │                             ▲                  │
│       │                  │                             │                  │
│       │     ┌────────────▼─────────────┐       ┌──────┴───────────┐      │
│       │     │  Cloud Function          │       │ Cloud Function    │      │
│       └─────│  uebersetzung            │       │ fcm-push-dringend │      │
│             │  onCreate /chats/...     │       │ onCreate dringend │      │
│             │  → Gemini Flash          │       │ → sendMulticast   │      │
│             │  → text_uebersetzt{...}  │       │                   │      │
│             └──────────────────────────┘       └───────┬───────────┘      │
│                                                        │                   │
│                                                        ▼                   │
│                                              ┌─────────────────────┐      │
│                                              │ FCM-Push Service    │      │
│                                              │ → MA-Handy          │      │
│                                              │ → background SW     │      │
│                                              │ → Notification      │      │
│                                              └─────────────────────┘      │
└───────────────────────────────────────────────────────────────────────────┘
```

**Legende:**
- Massive Pfeile = aktiv in Etappe 5
- **NEU in B5** = kommt in dieser Etappe dazu
- Cloud Functions laufen außerhalb beider Apps (siehe Abschnitt 5)

---

## 3. Baustein-Übersicht

Alle 7 Bausteine im Überblick. Jeder einzeln deploybar und testbar. Thomas hat stufenweise abgenommen nach jedem Baustein.

| # | Titel | Geänderte Dateien | Neue Komponenten / API | Sichtbar für User |
|---|---|---|---|---|
| **1** | Firebase-Fundament | `js/tw-ma-firebase.js` (+311) | `getMeineMaId`, `subscribeKalenderJahr`, `schreibeKalenderEintrag`, `subscribeChat`, `sendeChatNachricht`, `speichereFcmToken` + 7 weitere | — (reine API) |
| **2** | Kalender-UI | `index.html` (+574) | `MAKalenderModul`, `MAKalenderGrid`, `MAKalenderTag`, `MAKalenderHeader`, `MAKalenderLegende` | 3-Jahres-Kalender mit Status-Glyphen + Baustellen-Balken |
| **3** | Tages-Modal | `index.html` (+638) | `MAKalenderTagesModal` + Helper | Tap auf Tag öffnet Modal: Status, Stunden, Baustelle, Sonderheiten, 🎤-Diktat, Speichern/Löschen |
| **4** | Nachrichten-Empfangen | `index.html` (+565) | `MANachrichtenModul`, `MAChatThread`, `MAChatBubble`, `MANachrichtenHeader`, Auto-Scroll + Auto-Mark-as-Read | Chat-Thread mit Datum-Trennern, Lesestatus, Dringend-Markierung, Übersetzungs-Toggle |
| **5** | Chat-Senden | `index.html` (+289) | `MANachrichtenInput` (ersetzt Stub), Dringend-Toggle, Autoresize-Textarea, 🎤-Diktat | Input-Zeile aktiv, Senden funktioniert, Fehler-Retry |
| **6** | FCM-Push + Badges | `index.html` (+329), `js/tw-ma-firebase.js` (+103), `firebase-messaging-sw.js` (NEU) | `initFcm`, `subscribeFcmForeground`, `useGlobaleChatSubscription`, `MAUngelesenBadge`, `MAStartIndikator`, `MAPushPermissionBanner` | Nav-Badge, pulsierender Status-Indikator auf Startseite, Permission-Banner, Background-Notifications |
| **7** | Finale + Konsolidierung | — | — | Komplett-ZIP mit allen Dateien + diese Gesamt-Doku |

**Code-Wachstum über alle Bausteine:**

- `index.html`: 3.797 → **6.192 Zeilen** (+2.395 Zeilen, ca. 63% Wachstum)
- `js/tw-ma-firebase.js`: 513 → **927 Zeilen** (+414 Zeilen, 81% Wachstum)
- NEU: `firebase-messaging-sw.js` (88 Zeilen)

---

## 4. Firebase-Datenmodell nach Etappe 5

### 4.1 Schema-Überblick

```
/aktive_baustellen/{baustelle-id}/
    name, adresse, status, letzter_push
    staging_folder_id, staging_folder_ids/
    baustellendaten/
    freigegebene_geraete/{uid}: true

/geraete/{uuid}/                                  ← erweitert in B6
    code, status, erstellt, sprache, pin_hash
    heartbeat, letzter_sync
    ma_id: "ivan-petrov"                          (Mapping via Master-App)
    fcm_token: "BPabc123..."                      ← NEU in B6
    fcm_token_aktualisiert: 1745324567890

/users/{uid}/
    name, mitarbeiter_name
    sprache: "de"|"en"|"cs"|"sk"|"pl"|"ro"|"uk"
    ma_id: "ivan-petrov"                          (optional, vom Büro gesetzt)

/mitarbeiter/{ma-id}/                             ← Etappe 4.1 stammdaten
    name, rolle, sprache, status
    erstellt_am, geraete_uuids

/kalender/{ma-id}/{jahr}/{datum}/                 ← NEU in B2+B3
    status:           "anwesend"|"urlaub"|"krank"|"frei"
    stunden:          8.25                        (nur bei "anwesend")
    baustelle_id:     "meyer-bad"                 (nur bei "anwesend")
    sonderheiten:     "Estrich war feucht"
    audio_pfad:       null                        (optional, später)
    eingetragen_von:  "ma"|"buero"
    eingetragen_am:   1745324567890
    geaendert_am:     1745324567890

/baustellen_planung/{baustelle-id}/{zeitraum-id}/ ← Etappe 4.1 · read-only für MA
    von, bis: unix-ms
    farbe: "#1E88E5"
    beschreibung
    mitarbeiter/{ma-id}: boolean

/chats/{ma-id}/{nachricht-id}/                    ← NEU in B4+B5
    von:              "buero"|"ma"
    absender_name:    "Thomas"|"Ivan"
    text_original:    "Guten Morgen"
    sprache_original: "de"
    text_uebersetzt/
        de, en, ru, tr, cs, es, pl, ro, uk        (Cloud Function füllt)
    timestamp:        1745324567890
    gelesen:          boolean
    gelesen_am:       1745324567890               (optional)
    dringend:         boolean
```

### 4.2 Datenfluss "MA trägt Arbeitstag ein"

1. MA öffnet Kalender-Tab → `subscribeKalenderJahr` subscribet `/kalender/{ma-id}/{jahr}/`
2. Tap auf 12. Mai → Modal öffnet mit Default-Werten (oder bestehendem Eintrag)
3. Status `anwesend`, 8h, Baustelle "Meyer" → SPEICHERN
4. `schreibeKalenderEintrag` → `/kalender/{ma-id}/2026/2026-05-12/`
5. Firebase propagiert via Live-Listener **sofort** an:
   - Master-App (Büro sieht ✓-Glyph)
   - Hauptkalender der Master-App (aggregiert alle MA)
   - MA-App selbst (Modal zeigt Erfolgs-Toast, schließt nach 700ms)

### 4.3 Datenfluss "Dringende Nachricht vom Büro"

1. Büro schreibt `/chats/{ma-id}/{auto-id}/` mit `dringend: true`, `von: "buero"`
2. **Cloud Function 1 (Übersetzung)** triggert: liest MA-Sprachen aus `/mitarbeiter/`, ruft Gemini Flash, schreibt `text_uebersetzt/{de,en,...}`
3. **Cloud Function 2 (FCM-Push)** triggert: liest `/geraete/*` für diesen MA, sammelt `fcm_token`s, ruft `admin.messaging().sendEachForMulticast()`
4. FCM-Service pusht an das MA-Handy:
   - Wenn App offen: Foreground-Message-Handler (Baustein 6)
   - Wenn App zu: Background-Service-Worker (`firebase-messaging-sw.js`) zeigt System-Notification mit Vibration
5. MA tippt Notification → App öffnet im Nachrichten-Tab direkt
6. Live-Listener zeigt die Nachricht als rote Dringend-Bubble
7. 1,2s später: Auto-Mark-as-Read → `gelesen: true`
8. Büro sieht grünen Doppel-Check

---

## 5. Feld-Einsatz-Checkliste

Vor Go-Live müssen folgende Konfigurationen auf Master-App-Seite stimmen. Ohne diese läuft die App, zeigt aber Fehler-Screens oder leere Views.

### 5.1 Firebase-Setup (einmalig pro Projekt)

- [ ] **Realtime Database** aktiv im Projekt `einkaufsliste-98199`
- [ ] **Anonymous Auth** Methode aktiviert (für Geräte-Login)
- [ ] **Drive API** aktiv (aus Etappe 4b)
- [ ] **Cloud Messaging** aktiv → Web Push Certificate generiert

### 5.2 VAPID-Key für FCM (einmalig)

1. Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
2. `Generate key pair` klicken
3. Public Key kopieren (Base64-URL, ca. 100 Zeichen)
4. In `js/tw-ma-config.js` als Getter einfügen:

```javascript
window.TWMaConfig.getFcmVapidKey = function() {
    return 'BPdeinLangerKey...';
};
```

**Ohne diesen Key:** Push-Banner zeigt "unsupported", Background-Notifications kommen nicht.

### 5.3 Firebase Security Rules (strikt)

```json
{
  "rules": {
    "aktive_baustellen": {
      "$bid": {
        ".read":  "data.child('freigegebene_geraete').child(auth.uid).val() === true"
      }
    },
    "geraete": {
      "$uuid": {
        ".read":  "$uuid === auth.uid",
        ".write": "$uuid === auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read":  "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "mitarbeiter": {
      ".read":   "auth != null"
    },
    "kalender": {
      "$maId": {
        ".read":  "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)",
        ".write": "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)"
      }
    },
    "baustellen_planung": {
      ".read":  "auth != null"
    },
    "chats": {
      "$maId": {
        ".read":  "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)",
        ".write": "auth != null && ($maId === auth.uid || root.child('users').child(auth.uid).child('ma_id').val() === $maId)"
      }
    }
  }
}
```

### 5.4 Cloud Functions deployen (2 Stück)

**Function A: Übersetzung** — lauscht `onCreate /chats/{maId}/{nachrichtId}/`, ruft Gemini Flash, schreibt `text_uebersetzt`:

```javascript
exports.uebersetzeChatNachricht = functions.database
    .ref('/chats/{maId}/{nachrichtId}')
    .onCreate(async (snap, ctx) => {
        const n = snap.val();
        if (!n || !n.text_original) return;
        if (n.text_uebersetzt) return; // schon übersetzt

        const zielsprachen = ['de','en','ru','tr','cs','es','pl','ro','uk']
            .filter(s => s !== n.sprache_original);

        const uebersetzt = {};
        // ... Gemini Flash API Call für jede Zielsprache ...
        // Siehe Etappe-4.1-Protokoll Abschnitt 9.1 für Details

        return snap.ref.child('text_uebersetzt').set(uebersetzt);
    });
```

**Function B: FCM-Push für Dringend** — Skeleton im Baustein-6-LIESMICH Abschnitt "3. Cloud Function deployen"

**Ohne Function A:** Chat funktioniert, Übersetzungen fehlen, "Übersetze..."-Platzhalter bleibt dauerhaft stehen.
**Ohne Function B:** Dringend-Nachrichten werden gesendet, aber bei geschlossener App kommt kein Push — nur Live-Listener beim nächsten App-Öffnen.

### 5.5 ma_id-Mapping pro Gerät

Wenn Mitarbeiter-Slugs wie `ivan-petrov` verwendet werden sollen, muss pro freigeschaltetem Gerät gesetzt werden:

```
/users/{uid}/ma_id: "ivan-petrov"
```

Ohne Mapping: App nutzt die Firebase-UID als ma_id. Funktioniert einwandfrei, aber die IDs in Firebase sind lange UUIDs statt lesbare Slugs.

### 5.6 Deployment-Reihenfolge

1. `js/tw-ma-firebase.js` hochladen (hat Etappe-5-APIs)
2. `firebase-messaging-sw.js` in Root hochladen (NICHT in js/)
3. `index.html` hochladen (hat alle UI-Komponenten)
4. VAPID-Key setzen
5. Security Rules veröffentlichen
6. Cloud Functions deployen
7. Ein Testgerät durchspielen

---

## 6. End-to-End-Test-Szenario (15 Minuten)

Ein einziger zusammenhängender Test, der alle Etappe-5-Features abdeckt. Ausführen als Paar-Test: einer am Büro-PC (Master-App), einer am Handy (MA-App).

### Vorbereitung (2 Min)

- Testgerät: freigegebener Mitarbeiter "Ivan" mit PIN
- Test-Baustelle: "Meyer Bad" aktiv, freigegeben für Ivan
- Firebase Console offen zum Monitoring
- Master-App offen in Büro-PC

### Schritt 1: Kalender-Eintrag (3 Min)

1. **Handy:** PIN-Login → Tab Kalender
2. Monat stimmt? Heute-Button? Navigation prüfen
3. Auf heutigen Tag tippen → Modal öffnet
4. Status `anwesend`, Stunden 8 → + drei mal → 8,75
5. Baustelle "Meyer Bad" wählen
6. Sonderheiten: 🎤 tippen, sagen "Estrich noch feucht"
7. Speichern → grüner Toast
8. **Büro:** Master-App → Hauptkalender → Ivans Zeile → heute: grüner ✓ ?
9. **Büro:** Hover/Tap → Tages-Modal zeigt 8,75h, "Meyer Bad", Sonderheiten

### Schritt 2: Chat-Nachricht in beide Richtungen (3 Min)

1. **Handy:** Tab Nachrichten öffnen
2. Empty-State ("Noch keine Nachrichten") → typisch beim ersten Mal
3. **Büro:** NACHRICHTEN → Chat → Ivan → "Guten Morgen! Kannst du heute Mittag kurz anrufen?"
4. **Handy:** Bubble erscheint links grau, Absender "Thomas", Timestamp
5. Tab-Badge oben zeigt "1"... verschwindet nach 1,2s
6. **Büro:** Nachricht zeigt grünen Doppel-Check
7. **Handy:** In Input-Zeile tippen "Klar, rufe gleich an" → Senden
8. **Büro:** Bubble erscheint rechts, Text (oder Übersetzung wenn Ivan z.B. Russisch spricht und Cloud Function läuft)

### Schritt 3: Dringend-Flow (3 Min)

1. **Büro:** "Achtung: Baustelle heute gesperrt wegen Gas-Notabschaltung!" → 🔔 Dringend-Button
2. **Handy:** Bubble mit rotem 2px-Rahmen + 🔔 DRINGEND-Badge
3. **Handy:** Handy-Screen sperren, 10 Sek warten
4. **Büro:** weitere Dringend-Nachricht "Bitte morgen nicht kommen"
5. **Handy:** System-Notification erscheint mit Vibration
6. Tap auf Notification → App öffnet direkt im Nachrichten-Tab

### Schritt 4: Badges & Indikator (2 Min)

1. **Handy:** Zu Tab Start wechseln
2. 3 neue Büro-Nachrichten vom Büro senden (ohne Tab-Öffnen)
3. **Handy:** Tab "Nachrichten" zeigt Badge "3"
4. Startseite: roter pulsierender Indikator "3 neue Nachrichten vom Büro"
5. Auf Indikator tippen → springt zu Nachrichten
6. Alle 3 lesen → Indikator verschwindet, Badge leer

### Schritt 5: Übersetzung (2 Min, wenn Cloud Function Function A läuft)

1. **Handy:** Sprache auf Polnisch wechseln
2. **Büro:** "Guten Morgen!" senden
3. **Handy:** Kurz "Tłumaczenie..." sichtbar, dann "Dzień dobry!" mit kleinem "Pokaż oryginal"-Link
4. Tap auf Link → deutsches Original erscheint darunter

### Schritt 6: Offline + Retry (2 Min)

1. **Handy:** Flugmodus an
2. In Chat-Input "Teste Offline" tippen → Senden
3. Nach Timeout: roter Fehler-Banner "Senden fehlgeschlagen"
4. Flugmodus aus
5. `↻`-Button tippen → Nachricht geht durch

---

## 7. Code-Landkarte

Für Folge-Chats: wo liegt was in welcher Datei?

### 7.1 `index.html` — nach Gewerken

Zeilen sind Näherungen (variieren je nach Editor/Linebreak-Einstellungen).

| Gewerk | Komponenten / Bereich | Ungefähre Zeilen |
|---|---|---|
| HTML-Head (Scripts, Meta) | — | 1–60 |
| Globaler Error-Handler | — | 60–80 |
| Auth-Modul-Loading | `tw-ma-auth.js` Integration | 80–100 |
| CSS-Block (Design-System) | `<style>...</style>` | 100–940 |
| Babel-Block Start | `const {useState, useEffect, useRef} = React` | 970 |
| Firebase-Init + Config | `FIREBASE_CONFIG`, `init()` | 970–1030 |
| UI_LABELS (alle 7 Sprachen) | 100+ Labels | 1400–1890 |
| Icon-Komponenten | `Icon.Home`, `Icon.Helm` etc. | 1890–1905 |
| Firmen-Logo, Bauteam-Animation | Übernommen aus Master-App | 1905–2200 |
| Platzhalter-Modul | `ModulPlatzhalter` (für Fotos+Stunden) | 2300–2340 |
| Header-Navigation | `NavHeader` | 2340–2420 |
| Startseite | `MAStartseite` | 2420–2540 |
| **Baustellen-Modul (Etappe 4b)** | `MABaustellenModul` + 10 Sub-Komponenten | 2550–3770 |
| Helper-Styles | `maContainerStyle` etc. | 3770–3820 |
| Shared: SubHeader, Spinner | `MASubHeader` | 5450–5550 |
| **Kalender-Modul (Etappe 5 · B2)** | `MAKalenderModul` + 5 Sub | 3870–4540 |
| **Kalender-Tages-Modal (B3)** | `MAKalenderTagesModal` | 4540–4850 |
| **Nachrichten-Modul (B4+B5)** | `MANachrichtenModul`, `MAChatBubble` etc. | 4850–5450 |
| **Badge + Push-Banner (B6)** | `MAUngelesenBadge`, `MAStartIndikator`, `MAPushPermissionBanner` | 5920–6020 |
| `MainApp` Container | Top-Level-Routing, globale Subscriptions | 6020–6170 |
| `MAApp` Boot | Error-Boundary, Render-Root | 6170–6192 |

### 7.2 `js/tw-ma-firebase.js` — API-Gruppen

| Gruppe | Funktionen | Zeilen |
|---|---|---|
| Init + Status | `init`, `ensureInit`, `isReady`, `saveConfig`, `subscribeConnectionStatus` | 30–200 |
| Auth | `signInAnonymous`, `getMeineUid`, `signOut` | 140–200 |
| Einladungen | `validiereEinladung`, `loeseEinladungEin`, `redeemInvitation` | 200–380 |
| User-Status | `subscribeUserStatus`, `checkUserStatus`, `sendeHeartbeat` | 280–400 |
| Baustellen (Etappe 4b) | `ladeAktiveBaustellen`, `subscribeAktiveBaustellen`, `ladeBaustelle` | 390–480 |
| **Etappe 5 · Identität** | `getMeineMaId`, `ladeMeinenMitarbeiter`, `subscribeMeinMitarbeiter` | 480–575 |
| **Etappe 5 · Kalender** | `subscribeKalenderJahr`, `schreibeKalenderEintrag`, `loescheKalenderEintrag` | 575–625 |
| **Etappe 5 · Planung** | `subscribeBaustellenPlanungen`, `filterePlanungenFuerMa` | 625–680 |
| **Etappe 5 · Chat** | `subscribeChat`, `sendeChatNachricht`, `markiereNachrichtGelesen`, `zaehleUngeleseneBueroNachrichten` | 680–745 |
| **Etappe 5 · FCM (B6)** | `speichereFcmToken`, `initFcm`, `subscribeFcmForeground` | 745–875 |
| Export-Block | `global.TWMaFirebase = {...}` | 880–930 |

---

## 8. Komponenten-Landkarte (React)

```
MAApp (Boot-Komponente)
└── MainApp                              ← hält aktiverTab, ungelesen-State, PushStatus
    ├── NavHeader                        ← oben: Zurück/Vor, Font, Sprache
    ├── Modul-Tabs-Bar                   ← 6 Buttons, jeweils mit optionalem Badge
    ├── [conditional] MAPushPermissionBanner   ← NEU B6 · nur auf Tab Start
    ├── [conditional] MAStartIndikator          ← NEU B6 · nur auf Tab Start
    └── [Tab-abhängig eines von:]
        ├── MAStartseite                  (Logo, Uhr, Sprache, Animation, Info-Status)
        ├── MABaustellenModul              (4b · Liste → Detail → 5 Kacheln → Drive-Browser)
        │   ├── MABaustellenListe
        │   ├── MABaustelleDetail
        │   ├── MAKachelRouter
        │   ├── MABaustelleBrowser
        │   └── ...
        ├── MAKalenderModul              ← NEU B2 + B3
        │   ├── MAKalenderHeader         (Navigation)
        │   ├── MAKalenderWochentage
        │   ├── MAKalenderGrid
        │   │   └── MAKalenderTag (×42)
        │   ├── MAKalenderLegende
        │   └── MAKalenderTagesModal     ← B3 Overlay
        ├── ModulPlatzhalter              (für Fotos & Stunden, kommen in Et. 6/7)
        └── MANachrichtenModul           ← NEU B4 + B5
            ├── MANachrichtenHeader       (Titel, Ungelesen-Badge)
            ├── [conditional] MANachrichtenEmpty
            ├── MAChatThread
            │   └── MAChatBubble (×N)    (mit Datum-Trennern)
            └── MANachrichtenInput        (Textarea, Dringend-Toggle, 🎤, Senden)
```

---

## 9. Troubleshooting-Konsolidiert

| Problem | Ursache | Lösung |
|---|---|---|
| Badge zeigt nicht | Live-Listener feuert nicht | Security Rules prüfen: `/chats/{ma-id}/` read-erlaubnis |
| Kalender bleibt leer | ma_id-Auflösung falsch | Konsole: `await TWMaFirebase.getMeineMaId()` — liefert UID/Slug? |
| Baustellen-Balken fehlen | Planung-Mitarbeiter falsch | `/baustellen_planung/{id}/mitarbeiter/{ma-id}` muss `true` sein (boolean, nicht String) |
| Speichern hängt | PERMISSION_DENIED | Security Rules für `/kalender/` oder `/chats/` |
| "Übersetze..." bleibt | Cloud Function A fehlt | Function deployen oder UI-Sprache = Absender-Sprache |
| Dringend-Push kommt nicht | Cloud Function B fehlt | Function deployen oder Testen mit offener App |
| `SW-Register fehlgeschlagen` | `firebase-messaging-sw.js` nicht im Root | Datei direkt neben index.html im GitHub-Repo |
| Push sagt "unsupported" | VAPID-Key fehlt | In `tw-ma-config.js` oder via `window.TW_FCM_VAPID_KEY` setzen |
| iOS Safari: Push geht nicht | iOS-Limit | Ab iOS 16.4 + muss als PWA installiert sein ("Zum Home-Bildschirm") |
| Firefox: Diktat geht nicht | Web Speech API fehlt | Firefox unterstützt nicht, kein Workaround |
| Tages-Modal öffnet 2× | Unklar | Screenshot + Browser an mich; shouldn't happen |
| Startseite-Indikator zeigt ewig | Auto-Mark-as-Read feuert nicht | Tab "Nachrichten" einmal explizit öffnen, nicht nur Indikator-Tap |

---

## 10. Continuity-Protokoll für Folge-Chats

Für Folge-Chats (z.B. wenn Etappe 6 Fotos-Modul gebaut werden soll) hilft dieser Einstieg:

> Hier ist die Gesamt-Doku von TW Baustellen-App Etappe 5 (siehe angehängte Datei `LIESMICH-ETAPPE-5-GESAMT.md`). Alle 7 Bausteine sind abgenommen und produktiv. Jetzt möchte ich [...neues Anliegen, z.B. Etappe 6 starten...].

**Wichtige Architektur-Entscheidungen zum Beibehalten:**

1. **Monolithische `index.html`** — alle React-Komponenten inline, kein Build-Step per Babel-CLI
2. **Externe JS-Module** nur für Services (`tw-ma-firebase.js`, `tw-ma-drive-service.js`, etc.), nicht für Komponenten
3. **`MA`-Prefix** für alle React-Komponenten, `ma-`-Prefix für alle CSS-Klassen, `kal-`/`nach-` für Modul-spezifisch
4. **Mitarbeiter-Identity** über `getMeineMaId()` auflösen, das kapselt Slug-vs-UID-Logik
5. **Firebase-Realtime-Listeners** statt einmal-Reads wann immer möglich (Live-Updates Standard)
6. **Lokalisierung 7-sprachig** — jeder neue UI-String muss in `UI_LABELS` mit allen 7 Sprachen, Fallback auf `de`
7. **Design-System beibehalten** — schwarzer Hintergrund (`--bg-primary`), rote Akzente (`--accent-red`), Oswald für Headlines, Source Sans 3 für Body
8. **Keine localStorage für Daten** — nur für Einstellungen (Sprache, Font-Size)
9. **Input-Felder:** `type="text"` mit `inputMode="numeric"` statt `type="number"` (keine Spinner)
10. **Audio-Diktat via Web Speech API** — nicht auf Server-APIs angewiesen

**Code-Konventionen:**

- Funktions-Deklarationen statt Arrow-Functions für Top-Level-Komponenten (für bessere Stack-Traces)
- `var` nie, `const` bevorzugt, `let` nur bei notwendiger Re-Assignment
- Async-Logik via Promises + `.then()` statt async/await (wegen Babel-Transform-Kompatibilität)
- React-Fragments (`<>...</>` oder `React.Fragment`) statt unnötige `<div>`-Wrapper
- Touch-Targets mindestens 40px × 40px (besser 44px+)
- ESC-Key schließt Modals
- Overlay-Klick schließt Modals
- Alle Fehler mit `console.error` loggen (kein silent fail)
- Cleanup in `useEffect`-Return für alle Listener/Timer

---

## 11. Was als Nächstes kommt

### Option A: Etappe 6 — Fotos-Modul

**Aufwand:** groß (komplexer Workflow: Baustelle → Raum → Phase → Wand → Foto → Sprachnotiz → Sync)
**Datenfluss:** IndexedDB für Offline-Storage + Drive-Push als Batch
**Neue Datei:** wahrscheinlich `js/tw-ma-fotos-sync.js` für Sync-Queue
**Feldnutzen:** hoch — Fotodokumentation ist Kernaufgabe auf der Baustelle

### Option B: Etappe 7 — Stunden-Modul

**Aufwand:** mittel (PDF-Formular, Material-Popup, Spracheingabe)
**Datenfluss:** PDF-Generierung client-seitig mit jsPDF, Upload in Drive `/Stunden/`
**Abhängigkeit:** Material-Katalog in Firebase nötig (noch nicht definiert)
**Feldnutzen:** hoch — revisions-sicherer Stundennachweis ist Lohn-relevant

### Option C: Konsolidierung + Polishing

- Offline-IndexedDB-Cache für Drive-Listings (derzeit nur Memory-Cache)
- Sprach-Wechsler-Dialog für Mitarbeiter (aktuell nur über Pill)
- Audio-Diktat im Kalender-Tages-Modal (Feld `audio_pfad` existiert, UI fehlt)
- Read-Receipts mit Avatar-Stack im Chat
- Wochen-/Heatmap-Toggle im Kalender

**Empfehlung:** Option A oder B, je nach Business-Priorität. Option C sollte warten bis Fotos + Stunden produktiv sind.

---

## 12. Anhang: Ausgelieferte ZIPs (Reihenfolge)

```
tw-ma-etappe-5-baustein-1.zip    ← Firebase-Fundament
tw-ma-etappe-5-baustein-2.zip    ← Kalender-UI
tw-ma-etappe-5-baustein-3.zip    ← Tages-Modal
tw-ma-etappe-5-baustein-4.zip    ← Nachrichten-Empfangen
tw-ma-etappe-5-baustein-5.zip    ← Chat-Senden
tw-ma-etappe-5-baustein-6.zip    ← FCM + Badges
tw-ma-etappe-5-GESAMT.zip        ← Dieses Paket (alle Dateien + Gesamt-Doku) ← FINAL
```

Jedes ZIP enthält den vollständigen Stand bis zu diesem Baustein. Wer nur das letzte ZIP installiert, hat alles. Die Bausteine bauen aufeinander auf.

---

## 13. Rollback-Notfall

Wenn nach Deploy etwas kaputt ist:

**Code-Rollback:** ZIP des vorherigen Bausteins hochladen — alle Änderungen sind rückwärts-überlagernd.

**Achtung Firebase-Daten:** Die neuen Knoten `/kalender/` und `/chats/` bleiben bei einem Code-Rollback in Firebase. Wenn kompletter Rollback gewünscht: in Firebase Console manuell löschen.

**Achtung FCM-Tokens:** Nach Rollback auf Baustein 5 oder früher bleibt `fcm_token` in `/geraete/{uid}/` stehen. Kein Problem — nur Daten-Ballast.

---

**ENDE DER GESAMTDOKUMENTATION · Etappe 5 vollständig ausgeliefert · 22.04.2026**
