# Etappe 3 — Onboarding + PIN-Login

**Datum:** 20.04.2026
**Status:** Komplett, Babel-validiert, deploy-bereit

---

## Was diese Etappe bringt

Die TW Baustellen-App hat jetzt einen echten Zugangsschutz — kompatibel zum Einladungssystem der Master-App (TW Business Suite).

**Endlich zieht der Faden zwischen Büro und Baustelle:**
- Du erstellst im Büro eine Einladung → 6-stelliger Code + PIN
- Der Mitarbeiter gibt Code + PIN auf seinem Handy ein
- Das Handy erscheint in deinem Admin-Modul als „wartend"
- Du klickst „Freigeben" → das Handy der MA springt automatisch in die App
- Beim nächsten App-Start nur noch PIN → drin

---

## Was geändert wurde

### Neue Dateien

| Datei | Zweck |
|---|---|
| `jsx/tw-ma-auth.jsx`       | `MAPinLoginScreen` (PIN-Abfrage), `MAWipeScreen` (gesperrt/gewipt), `MALadeScreen` |
| `jsx/tw-ma-onboarding.jsx` | `MAOnboardingFlow` (Code + PIN + Gerät), `MAOnboardingWartend` (Warte auf Freigabe) |

### Stark erweitert

| Datei | Zuwachs | Inhalt |
|---|---|---|
| `js/tw-ma-firebase.js`     | Stub → 424 Zeilen | Anonymous Auth, `redeemInvitation`, `subscribeUserStatus`, `isConfigReady`, `saveConfig`, Heartbeat |
| `js/tw-ma-storage.js`      | 170 → 257 Zeilen  | PIN-Hashing (`sha256Hex`, `pinZuHash`), Onboarding-Persistenz, PIN-Versuche-Zähler |
| `js/tw-ma-config.js`       | 517 → 864 Zeilen  | `AUTH_LABELS` mit 44 Keys × 7 Sprachen, Firebase-Config mit Hinweis-Kommentaren |
| `jsx/tw-ma-app.jsx`        | 448 → 689 Zeilen  | `authStatus`-State, Onboarding-Integration, Heartbeat-Intervall, Auth-Routing |
| `index-template.html`      | + 1 Script-Tag    | `firebase-auth-compat.js` eingebunden |
| `build.bat` / `build-linux.sh` | neue Reihenfolge | `auth.jsx` + `onboarding.jsx` in Build |

### Auth-States in der App

| Status | Was der User sieht |
|---|---|
| `lade` | Kurzer Spinner beim App-Start |
| `kein_firebase` | „App noch nicht fertig eingerichtet" (wenn API-Key fehlt) |
| `onboarding` | Code + PIN + Gerätename eingeben |
| `wartend_freigabe` | Spinner + „Warte auf Freigabe" + Name |
| `pin_login` | PIN-Abfrage bei jedem App-Start |
| `authenticated` | Normale App-Nutzung |
| `locked` | „Gerät gesperrt"-Screen (Büro hat locked=true gesetzt) |
| `geloescht` | „Zugang entzogen"-Screen (Büro hat User entfernt) |
| `pin_wipe` | Nach 5 falschen PIN-Versuchen: „Zu viele Fehlversuche" + Wipe |

---

## ⚠️ Bevor du deployen kannst: Firebase-API-Key eintragen

Die App braucht einen Firebase-API-Key, damit sie mit dem Büro sprechen kann.
**Ohne Eintrag landet der Mitarbeiter auf dem „App noch nicht fertig eingerichtet"-Screen.**

### Schritt 1: API-Key aus der Firebase Console holen

1. Browser → https://console.firebase.google.com
2. Projekt **einkaufsliste-98199** auswählen
3. Zahnrad oben links → **Projekteinstellungen**
4. Reiter **Allgemein**, runter scrollen bis **„Deine Apps"**
5. Wenn dort noch keine Web-App eingetragen ist: „App hinzufügen" → Web-App →
   Spitzname z.B. „TW Baustellen-App" → Registrieren
6. Das Config-Snippet erscheint:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "einkaufsliste-98199.firebaseapp.com",
  ...
};
```

### Schritt 2: In `js/tw-ma-config.js` eintragen

Öffne die Datei und finde diesen Block (ca. Zeile 50):

```js
const FIREBASE_CONFIG = {
    apiKey:            '',   // TODO: aus Firebase Console eintragen
    authDomain:        '',   // TODO: aus Firebase Console eintragen
    databaseURL:       'https://einkaufsliste-98199-default-rtdb...',
    projectId:         'einkaufsliste-98199',
    storageBucket:     '',
    messagingSenderId: '',
    appId:             ''
};
```

Trag die Werte aus Schritt 1 ein. **`databaseURL` und `projectId` stimmen bereits** — nicht anfassen.

### Schritt 3: Anonymous Auth in Firebase freischalten

Damit die MA-App sich anmelden kann:

1. Firebase Console → **Authentication** (linke Sidebar)
2. Tab **Sign-in method**
3. Bei **Anonym** → Bleistift-Icon → **Aktivieren** → Speichern

### Schritt 4: Firebase Security Rules prüfen

Die MA-App schreibt in `/users/{uid}` und liest `/invitations/{code}`. Prüfe, dass deine Rules das erlauben. Für Tests reicht diese Regel (produktiv strenger machen!):

```json
{
  "rules": {
    "invitations": {
      "$code": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### Schritt 5: Build und Deploy

```bash
# Linux/Mac
./build-linux.sh

# Windows
build.bat
```

Anschließend: `index.html` + `icons/` + `manifest.json` + `service-worker.js` + `css/` + `js/` auf GitHub-Pages pushen.

**Ein Mal Config eintragen, einmal deployen → auf allen 10 Handys gleichzeitig aktiv.**

---

## Testen

### Test 1: Erst-Onboarding auf neuem Handy

**Master-App:**
1. **Admin-Modul** → Einladung erstellen
2. Mitarbeiter wählen (z.B. „Ivan"), PIN setzen (z.B. `1234`)
3. Code wird angezeigt, z.B. `AB3X7K`

**Baustellen-App (neues Handy oder Inkognito-Browser):**
1. URL öffnen → Onboarding-Screen erscheint
2. Code eingeben: `AB3X7K`
3. PIN eingeben: `1234`
4. Gerätename (optional): z.B. „Ivan Privathandy"
5. „Anmelden" → kurzer Spinner → **„Warte auf Freigabe"-Screen**

**Master-App:**
6. In Team/Admin-Liste erscheint „Ivan (wartend)" mit grünem Haken
7. Klick auf Haken → approved=true

**Baustellen-App (automatisch):**
8. Wartend-Screen verschwindet → Startseite der App erscheint

### Test 2: App-Start mit PIN

Handy-App vollständig schließen und wieder öffnen:
- PIN-Login-Screen erscheint
- PIN `1234` eingeben → Startseite

### Test 3: PIN-Fehlversuche

5× falsche PIN eingeben → Wipe-Screen „Zu viele Fehlversuche" → zurück zum Code-Eingabe-Screen.

### Test 4: Büro sperrt Gerät

Master-App: Bei Ivan „Sperren" klicken → `locked=true`.
MA-App: Innerhalb von ~2 Sekunden erscheint „Gerät gesperrt".

### Test 5: Büro entzieht Zugang

Master-App: Ivan komplett entfernen.
MA-App: Erscheint „Zugang entzogen" → Button „Neu einrichten" führt zurück zum Onboarding.

---

## Was noch fehlt (spätere Etappen)

- **Etappe 4a:** Top-Level-Navigation von 6 Tabs auf 3 Tabs reduzieren (Start / Baustellen / Nachrichten) — gemäß neuem 2-Ordner-Modell aus Master-App Etappe 4.1
- **Etappe 4b:** Baustellen-Modul mit 5 Sub-Ordnern + Drive-Browser
- **Etappe 5:** Nachrichten-Tab mit Kalender + Chat
- **Etappe 6:** Fotos-Workflow
- **Etappe 7:** Stunden-Workflow
- **Etappe 8:** FCM-Push

---

## Troubleshooting

**„App noch nicht fertig eingerichtet" erscheint, obwohl ich den API-Key eingetragen habe**
→ Browser-Cache hart leeren (Strg+Shift+R) und Service Worker neu registrieren.
→ Datei `js/tw-ma-config.js` öffnen und checken, dass `apiKey` nicht mehr leer ist.

**„Der Code ist unbekannt" trotz frischer Einladung**
→ In Firebase Console unter **Realtime Database** prüfen, dass unter `/invitations/` ein Knoten mit dem Code existiert.
→ Groß-/Kleinschreibung prüfen — Codes sind immer GROSS.

**„Keine Verbindung zum Büro"**
→ `databaseURL` in `tw-ma-config.js` prüfen (muss genau `https://einkaufsliste-98199-default-rtdb.europe-west1.firebasedatabase.app` sein).
→ Security Rules prüfen (siehe Schritt 4 oben).

**Handy springt nach Freigabe nicht automatisch weiter**
→ Ist Anonymous Auth in Firebase Console aktiviert? (Schritt 3)
→ Browser-Konsole (F12 → Konsole) nach Fehlern absuchen.

---

*TW Baustellen-App · Etappe 3 · v1.0.0-etappe3 · 20.04.2026*
