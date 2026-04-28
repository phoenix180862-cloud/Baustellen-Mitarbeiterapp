# Animation-Update — Bauteam-Animation 1:1 wie Master-App

**Datum:** 28.04.2026
**Auftrag:** Master-Dokument Kap. 4.7 endlich umgesetzt
**Status:** Geliefert

---

## Was geaendert wurde

Die `MABauteamAnimation` und die alte Sub-Komponente `MAFliesenleger` (3 generische
Silhouetten) wurden komplett ersetzt durch die **1:1-Uebernahme der Master-App-Animation**
aus `tw-shared-components.jsx` (TW Business Suite, Z. 429-1416).

### Neu in der Animation

- **8 individuelle Figuren** statt 3 Silhouetten:
  - `MAFigurIvan` (blau, mit Schaufel)
  - `MAFigurMichal` (gruen, mit Wasserwaage)
  - `MAFigurIurii` (signalrot, mit Spachtel)
  - `MAFigurPeter` (blau-orange, mit Eimer)
  - `MAFigurLucaAM` (AM s.r.o., schwarz, mit Bohrmaschine)
  - `MAFigurLuca2` (orange, mit Knieschuetzern)
  - `MAFigurSilke` (BIG BOSS, lila, mit Klemmbrett)
  - **`MAFigurThomas`** — der Boss im **roten Cabrio**, mit
    weissem Helm, Krawatte, Brille und der Sprechblase **"Yallah, Yallah!"**
    die rhythmisch ein/aus pulsiert (3,6s-Zyklus).
- **3 Gruppen** wechseln sich auf einem 45-Sekunden-Gesamtzyklus ab
  (je 15s pro Gruppe links->rechts).
- **Thomas faehrt mit jeder Gruppe** — und bringt sein Yallah-Yallah ueber den Bildschirm.
- Reifen drehen sich (`tw-pkw-wheel` Animation),
  Karosserie federt (`tw-pkw-bounce`),
  Sprechblase ploppt rhythmisch ein/aus (`tw-speech-bubble` Animation).

### Was war vorher drin (jetzt entfernt)

- `MAFliesenleger`-Komponente (eine generische Figur, in 3 Farben gerendert).
- Hintergrund mit Sonne, 2 Haeusern und Gerueststreben.

> Hinweis: Die neue Master-App-Animation hat **keinen** Hintergrund mit
> Sonne/Haeusern — nur einen Fliesenstreifen am Boden. Falls der
> Hintergrund gewuenscht ist, kann er in einem separaten Update wieder
> rein. Master-Dokument Kap. 4.7 spezifiziert "1:1 uebernommen", also
> ohne Hintergrund.

---

## Geaenderte Dateien

| Datei | Aktion |
|---|---|
| `jsx/tw-ma-shared-components.jsx` | **Block Z. 71-163 ersetzt** durch die 9 neuen Komponenten + CSS (jetzt 1572 Zeilen statt 668) |
| `index.html` | **Neu gebaut** mit `build-linux.sh` (200.940 Bytes) |

Alle anderen Dateien (`tw-ma-app.jsx`, `tw-ma-startseite.jsx`, etc.) wurden
**nicht angefasst** — sie referenzieren `MABauteamAnimation` ja schon
korrekt.

---

## Konventionen eingehalten

- **MA-Prefix:** Alle Komponenten heissen `MAFigurXxx` / `MABauteamAnimation`
- **Keine Umlaute in JS-Kommentaren:** Quelle war bereits ASCII, vorsichtshalber geprueft
- **Babel-Parse:** `index.html` gegen `@babel/preset-react` validiert -> sauber
- **Build:** mit `build-linux.sh` ausgefuehrt, kein Fehler

---

## Wie auf den Server bringen?

```bash
# Im Repo-Root:
cp jsx/tw-ma-shared-components.jsx <repo-root>/jsx/
bash build-linux.sh                    # erzeugt frische index.html
git add -A
git commit -m "Bauteam-Animation 1:1 wie Master-App (Master-Dok Kap. 4.7)"
git push
# 1-2 Minuten warten, dann ist es auf GitHub Pages live.
```

---

## Was noch offen ist

Laut MASTER-BAUSTELLEN-APP.md / LIESMICH-ETAPPE-5-GESAMT.md:

| Etappe | Inhalt | Status |
|---|---|---|
| 0-5 | Setup, Startseite, Auth, Baustellen, Kalender, Nachrichten | abgeschlossen |
| **6** | **Modul Fotos** (kompletter Workflow) | **offen** |
| **7** | **Modul Stunden** (PDF + Material-Popup + Spracheingabe) | **offen** |
| **8** | **Fein-Schliff + End-to-End-Tests** | **offen** |

Naechster Schritt: Etappe 6 (Fotos) — das war auch im urspruenglichen
Auftrag das "finale Fertigstellen". Sag Bescheid, wenn ich loslegen soll.
