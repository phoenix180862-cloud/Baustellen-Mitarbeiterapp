# 🏗️ TW Baustellen-App

**Thomas Willwacher Fliesenlegermeister e.K.**  
Echtzeit-App für Baustellenmitarbeiter und Büro-Verwaltung.

---

## 📋 Übersicht

Die TW Baustellen-App ist eine Progressive Web App (PWA) mit zwei Ansichten:

| Ansicht | Zugang | Beschreibung |
|---------|--------|-------------|
| **Dashboard** (Admin) | `index.html?admin=true` | Zentrale Schaltstelle — alle Mitarbeiter-Apps kontrollieren |
| **Mobile App** (Mitarbeiter) | `index.html` | Baustellenordner, Fotos, Stundenzettel, Monatskalender u.v.m. |

### 🔒 Architektur: Hub-and-Spoke

```
         ┌──────────────────────────────┐
         │     ADMIN DASHBOARD          │
         │   (Absolute Schaltzentrale)  │
         └──────────┬───────────────────┘
                    │
              Firebase Realtime DB
              (zentraler Hub)
                    │
    ┌───────────────┼───────────────┐
    │               │               │
  App A           App B           App C
 (MA 1)          (MA 2)          (MA 3)
    ✗               ✗               ✗
    └───── KEINE VERBINDUNG ────────┘
```

- **Apps können NICHT miteinander kommunizieren**
- **Jeder Mitarbeiter sieht NUR seine eigenen Daten**
- **Admin (Dashboard) sieht und steuert ALLES**

---

## 🚀 Deployment auf GitHub Pages

### Schritt 1: Repository erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository-Name: `tw-baustellen-app`
3. Public oder Private wählen
4. "Create repository" klicken

### Schritt 2: Dateien hochladen

1. "Add file" → "Upload files"
2. `index.html` und `README.md` hochladen
3. "Commit changes" klicken

### Schritt 3: GitHub Pages aktivieren

1. Repository → "Settings"
2. Seitenleiste → "Pages"
3. Source: "Deploy from a branch"
4. Branch: `main` / `/ (root)`
5. "Save" klicken

Die App ist dann erreichbar unter:  
`https://phoenix180862-cloud.github.io/tw-baustellen-app/`

- **Dashboard:** `...?admin=true`
- **Mobile App:** `...` (direkt)

---

## 🔥 Firebase einrichten

### Schritt 1: Firebase-Projekt konfigurieren

1. Öffne [console.firebase.google.com](https://console.firebase.google.com)
2. Wähle Projekt **"einkaufsliste-98199"**
3. Gehe zu **Projekteinstellungen** → **Allgemein**
4. Scrolle zu "Ihre Apps" → **Web-App hinzufügen** (falls nicht vorhanden)
5. Kopiere die Firebase-Konfigurationswerte

### Schritt 2: Firebase-Services aktivieren

In der Firebase Console:

- **Authentication** → "Email/Password" aktivieren
- **Realtime Database** → Erstellen (Region: europe-west1)
- **Storage** → Aktivieren

### Schritt 3: Security Rules eintragen

In **Realtime Database → Regeln** folgende Rules eintragen:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "projects": {
      ".read": "root.child('users').child(auth.uid).child('approved').val() === true",
      "$projectId": {
        "documents": { ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'" },
        "templates": { ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'" },
        ".write": "root.child('users').child(auth.uid).child('approved').val() === true"
      }
    },
    "monthlyRecords": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "private": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "calendar": {
      ".read": "root.child('users').child(auth.uid).child('approved').val() === true",
      "employees": {
        "$uid": {
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      },
      "projects": {
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "chat": {
      ".read": "root.child('users').child(auth.uid).child('approved').val() === true",
      ".write": "root.child('users').child(auth.uid).child('approved').val() === true"
    },
    "dashboard": {
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "activeApps": {
        "$uid": {
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    }
  }
}
```

### Schritt 4: Credentials in der App eintragen

1. Öffne die App im Browser
2. Gehe zum Dashboard (`?admin=true`)
3. Klicke auf ⚙️ (Einstellungen)
4. Trage die Firebase-Credentials ein
5. Klicke "Speichern & Neuladen"

---

## 📱 Module

| # | Modul | Beschreibung |
|---|-------|-------------|
| 0 | **Dashboard** | Zentrale Schaltstelle — Spiegelansicht aller Mitarbeiter-Apps |
| 1 | Baustellenordner | Zugriff auf Projektordner |
| 2 | Mehrsprachigkeit | 7 Sprachen (DE/CS/SK/EN/ES/FR/PL) |
| 3 | Kalender | Mitarbeiter- & Baustellen-Planung (Gantt) |
| 4 | Zugangs-Freigabe | Registrierung → Admin-Freigabe |
| 5 | Fotodokumentation | Fotos mit Raum-Zuordnung |
| 6 | Stundenzettel | DIN A4 mit Material-Katalog + Spracheingabe |
| 7 | Privater Bereich | Vertrauliche Mitarbeiterdaten (nur lesen) |
| 8 | Monatsabrechnung | Tageskalender mit Arbeitszeit/Leistung |

---

## 🛠️ Technologie-Stack

- **Frontend:** React 18 (JSX via Babel, Single-File)
- **Backend/Sync:** Firebase Realtime Database + Storage
- **Auth:** Firebase Authentication
- **Spracheingabe:** Web Speech API
- **PWA:** Service Worker für Offline-Support
- **Hosting:** GitHub Pages

---

## 📞 Kontakt

Thomas Willwacher Fliesenlegermeister e.K.  
Flurweg 14a, 56472 Nisterau  
