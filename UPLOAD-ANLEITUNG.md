# 🚀 Upload-Anleitung: Mitarbeiter-App neu deployen

**Worum geht's?** Die Version, die aktuell auf GitHub Pages liegt, hat noch den
alten 6-stelligen Code-Bildschirm. Die neue `index.html` mit dem korrekten
Auth-Flow (Sprache → Registrierung → Wartebildschirm) ist hier im ZIP.

---

## ⏱️ In 3 Minuten erledigt

### Schritt 1: Auf GitHub einloggen

1. Browser auf: **https://github.com/phoenix180862-cloud/Baustellen-Mitarbeiterapp**
2. Mit deinem GitHub-Account einloggen (falls nicht schon drin)

### Schritt 2: Alte index.html ersetzen

1. Im Repo auf die Datei **`index.html`** klicken
2. Oben rechts auf das **Stift-Symbol** (✏️ "Edit this file") klicken
3. Den **kompletten** Inhalt löschen (Strg+A, dann Entf)
4. Die neue `index.html` aus diesem ZIP öffnen, kompletten Inhalt kopieren (Strg+A, Strg+C)
5. Ins GitHub-Editor-Fenster einfügen (Strg+V)
6. Ganz unten auf **"Commit changes…"** klicken (grüner Button)
7. Im Pop-up: **"Commit directly to the main branch"** wählen → **"Commit changes"**

### Schritt 3: Auf Deployment warten (1–2 Minuten)

GitHub Pages baut die neue Version automatisch. Du kannst den Status checken:
- Im Repo oben auf den Tab **"Actions"** klicken
- Der oberste Eintrag sollte einen **gelben Punkt** (läuft) und dann einen **grünen Haken** (fertig) bekommen

### Schritt 4: Auf dem Handy testen

**WICHTIG — sonst zeigt das Handy weiterhin die alte Version aus dem Cache:**

1. Installierte App vom Handy **löschen** (lange auf Icon → Deinstallieren)
2. Browser öffnen → **Browser-Cache komplett leeren**
   - Chrome: Einstellungen → Datenschutz → Browserdaten löschen
   - "Bilder und Dateien im Cache" + "Cookies und Websitedaten" anhaken
   - "Daten löschen"
3. Browser **komplett schließen** (alle Tabs zumachen)
4. Browser **neu** öffnen → zur App-URL gehen:
   `https://phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/`
5. Wenn du jetzt **die 7 Flaggen** (🇩🇪 🇨🇿 🇸🇰 🇬🇧 🇪🇸 🇫🇷 🇵🇱) siehst → **alles richtig!**
6. App neu zum Homescreen hinzufügen (Browser-Menü → "Zum Startbildschirm hinzufügen")

---

## ✅ Erfolgs-Check

Nach dem Upload solltest du auf dem Handy folgenden Flow durchlaufen können:

1. **Sprachauswahl** (7 Flaggen-Buttons)
2. **Registrierungs-Formular** (Name, Adresse, Telefon, E-Mail, Passwort)
3. **"Freigabe anfordern"**-Button
4. **Wartebildschirm** ("Bitte warten — Anmeldung wird geprüft")

Du bleibst dann auf dem Wartebildschirm hängen — das ist **richtig so!**
Der nächste Schritt ist nämlich die **Freigabe vom PC aus**, und genau dafür
bauen wir jetzt das Admin-Modul in die Master-App ein.

---

## 🆘 Falls etwas nicht klappt

**Problem: Immer noch der 6-Code-Bildschirm**
→ Cache nochmal leeren, im Inkognito-Modus testen, sicherstellen dass das
GitHub-Action-Deployment durchgelaufen ist (grüner Haken in Actions-Tab).

**Problem: Weiße Seite / App startet nicht**
→ Bei mir melden mit Screenshot, ich schau in den Code.

**Problem: Beim Klick auf "Freigabe anfordern" passiert nichts**
→ Firebase-Verbindung prüfen — das kann an der Firebase-Konfiguration liegen,
das schauen wir uns dann gemeinsam an.

---

*TW Baustellen-App · Deployment-Hilfe · Stand 19.04.2026*
