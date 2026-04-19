# 🔐 Etappe 3 — Onboarding + PIN — NEU mit Verifikation

**Wichtig vorab:** Beim letzten Upload ging die Datei nicht durch. Die alte Etappe-1 ist drauf geblieben. Diesmal mit Verifikations-Schritten, damit du sicher weißt: hat's geklappt?

---

## 1️⃣ Firebase-Rules (1× einmalig, vorher!)

1. **console.firebase.google.com** → Projekt **einkaufsliste-98199**
2. Links: **Realtime Database** → oben Tab **Regeln**
3. Direkt nach `"rules": {` einfügen:
```
"geraete": {
  ".read": true,
  ".write": true
},
```
4. Oben rechts **Veröffentlichen**

---

## 2️⃣ index.html hochladen — DIESMAL RICHTIG

1. **github.com/phoenix180862-cloud/Baustellen-Mitarbeiterapp**
2. Auf **`index.html`** klicken (in der Datei-Liste)
3. **✏️ Stift-Symbol** oben rechts (NICHT der "..." Button!)
4. **Strg+A** → **Entf** (alles muss weg, Editor muss leer sein!)
5. **Neue index.html aus diesem ZIP öffnen** (mit Notepad/Editor)
6. **Strg+A → Strg+C**
7. Im GitHub-Editor: **Strg+V**
8. Ganz nach unten scrollen → grüner Button **"Commit changes…"**
9. Im Pop-up: **"Commit directly to the main branch"** → **"Commit changes"**

---

## 3️⃣ ✅ VERIFIKATION: Hat der Upload geklappt?

**Direkt nach dem Commit:**

1. Im Repo nochmal auf **`index.html`** klicken
2. Ganz oben siehst du Datei-Infos: **"2488 lines"** sollte da stehen (vorher: 1649)
3. Falls da steht "1649 lines" → Upload ging schief, nochmal Schritte 2-9

**Im Repo-Tab "Actions":**
- Letzter Eintrag sollte gerade laufen (gelber Punkt) oder fertig sein (grüner Haken)
- Falls roter X → Deployment fehlgeschlagen

---

## 4️⃣ Auf dem Handy testen

1. App **deinstallieren**
2. Browser-Cache **leeren**
3. Browser **alle Tabs schließen**
4. Neu öffnen → URL: `phoenix180862-cloud.github.io/Baustellen-Mitarbeiterapp/`

**Was du JETZT sehen solltest:**
- Kleines TW-Logo oben
- "ANMELDE-CODE" als Überschrift
- **6-stellige Zahl** in großer weißer Schrift (z.B. `847291`)
- Wartepunkt-Animation: "Warte auf Freigabe ..."
- Oben rechts: kleiner Punkt mit "Server ✓"

**Falls du immer noch die alte Startseite siehst** (Logo, Uhr, 6 rote Tabs):
→ Upload hat nicht geklappt, zurück zu Schritt 2

---

## 5️⃣ Freigeben (auf dem PC)

1. **Firebase-Console** → **Realtime Database** → Tab **Daten**
2. Du solltest neuen `geraete/`-Ordner sehen mit Untereintrag `dev-xxx...`
3. Auf das `status`-Feld (Wert: `wartend`) klicken
4. Ändern auf **`freigegeben`** → Enter

→ Handy schaltet automatisch auf PIN-Setup

---

## 6️⃣ Was tun wenn der 6-Code immer noch nicht kommt

Sag mir Bescheid und schick:
- Screenshot vom Handy-Bildschirm
- Screenshot von github.com/.../index.html (oben sieht man "X lines")

Dann finde ich raus, woran's hängt.

---

*v1.0.0-etappe3 · 19.04.2026*
