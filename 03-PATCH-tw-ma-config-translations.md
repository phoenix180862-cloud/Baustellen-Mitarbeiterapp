# 🌍 Translation-Patches für `js/tw-ma-config.js`

**Was:** Neue Translation-Strings für die Phasen-Untertitel und neue UI-Texte des master-konformen Layouts. **7 Sprachen** wie üblich.

> 💡 **Vorgehen:** Suche das `TWMA_TRANSLATIONS`-Objekt (oder wie auch immer dein Übersetzungs-Objekt heißt — meist im Stil `TWMA_TRANSLATIONS = { de: {...}, cs: {...}, ... }`). Füge in jedem Sprach-Block die neuen Schlüssel ein. Wenn ein Schlüssel bereits existiert, überspringe ihn (und prüfe, ob der Text matcht).

---

## Neue Schlüssel pro Sprache

### 🇩🇪 Deutsch (`de`)

```javascript
'fotos.phase.rohzustand.label': 'Rohzustand',
'fotos.phase.rohzustand.subtitle': 'Vor Arbeitsbeginn',
'fotos.phase.vorarbeiten.label': 'Nach Vorarbeiten',
'fotos.phase.vorarbeiten.subtitle': 'Abdichtung / Grundierung',
'fotos.phase.fertigstellung.label': 'Fertigstellung',
'fotos.phase.fertigstellung.subtitle': 'Nach Fliesenarbeiten',
'fotos.kachel.leer': 'Leer',
'fotos.kachel.belegt': 'Foto vorhanden',
'fotos.kachel.leer.label': 'Foto'
```

### 🇨🇿 Tschechisch (`cs`)

```javascript
'fotos.phase.rohzustand.label': 'Hrubá stavba',
'fotos.phase.rohzustand.subtitle': 'Před zahájením prací',
'fotos.phase.vorarbeiten.label': 'Po přípravných pracích',
'fotos.phase.vorarbeiten.subtitle': 'Hydroizolace / penetrace',
'fotos.phase.fertigstellung.label': 'Dokončení',
'fotos.phase.fertigstellung.subtitle': 'Po obkladačských pracích',
'fotos.kachel.leer': 'Prázdné',
'fotos.kachel.belegt': 'Foto pořízeno',
'fotos.kachel.leer.label': 'Foto'
```

### 🇸🇰 Slowakisch (`sk`)

```javascript
'fotos.phase.rohzustand.label': 'Hrubá stavba',
'fotos.phase.rohzustand.subtitle': 'Pred začatím prác',
'fotos.phase.vorarbeiten.label': 'Po prípravných prácach',
'fotos.phase.vorarbeiten.subtitle': 'Hydroizolácia / penetrácia',
'fotos.phase.fertigstellung.label': 'Dokončenie',
'fotos.phase.fertigstellung.subtitle': 'Po obkladačských prácach',
'fotos.kachel.leer': 'Prázdne',
'fotos.kachel.belegt': 'Foto urobené',
'fotos.kachel.leer.label': 'Foto'
```

### 🇵🇱 Polnisch (`pl`)

```javascript
'fotos.phase.rohzustand.label': 'Stan surowy',
'fotos.phase.rohzustand.subtitle': 'Przed rozpoczęciem prac',
'fotos.phase.vorarbeiten.label': 'Po pracach przygotowawczych',
'fotos.phase.vorarbeiten.subtitle': 'Hydroizolacja / gruntowanie',
'fotos.phase.fertigstellung.label': 'Wykończenie',
'fotos.phase.fertigstellung.subtitle': 'Po pracach glazurniczych',
'fotos.kachel.leer': 'Puste',
'fotos.kachel.belegt': 'Zdjęcie istnieje',
'fotos.kachel.leer.label': 'Foto'
```

### 🇬🇧 Englisch (`en`)

```javascript
'fotos.phase.rohzustand.label': 'Raw State',
'fotos.phase.rohzustand.subtitle': 'Before work starts',
'fotos.phase.vorarbeiten.label': 'After Prep Work',
'fotos.phase.vorarbeiten.subtitle': 'Sealing / priming',
'fotos.phase.fertigstellung.label': 'Completion',
'fotos.phase.fertigstellung.subtitle': 'After tiling work',
'fotos.kachel.leer': 'Empty',
'fotos.kachel.belegt': 'Photo present',
'fotos.kachel.leer.label': 'Photo'
```

### 🇷🇴 Rumänisch (`ro`)

```javascript
'fotos.phase.rohzustand.label': 'Stare brută',
'fotos.phase.rohzustand.subtitle': 'Înainte de începerea lucrărilor',
'fotos.phase.vorarbeiten.label': 'După lucrări preliminare',
'fotos.phase.vorarbeiten.subtitle': 'Hidroizolație / amorsare',
'fotos.phase.fertigstellung.label': 'Finalizare',
'fotos.phase.fertigstellung.subtitle': 'După lucrările de faianță',
'fotos.kachel.leer': 'Gol',
'fotos.kachel.belegt': 'Fotografie existentă',
'fotos.kachel.leer.label': 'Foto'
```

### 🇺🇦 Ukrainisch (`uk`)

```javascript
'fotos.phase.rohzustand.label': 'Чорнова стадія',
'fotos.phase.rohzustand.subtitle': 'Перед початком робіт',
'fotos.phase.vorarbeiten.label': 'Після підготовчих робіт',
'fotos.phase.vorarbeiten.subtitle': 'Гідроізоляція / ґрунтування',
'fotos.phase.fertigstellung.label': 'Завершення',
'fotos.phase.fertigstellung.subtitle': 'Після плиткових робіт',
'fotos.kachel.leer': 'Порожньо',
'fotos.kachel.belegt': 'Фото зроблено',
'fotos.kachel.leer.label': 'Фото'
```

---

## Hinweise

### Bereits vorhandene Schlüssel

Vermutlich sind in deiner `tw-ma-config.js` schon ein paar dieser Schlüssel drin (z.B. `fotos.phase.rohzustand.label`, weil das alte Layout den auch schon nutzte). **Vergleiche** beim Einfügen — wenn der Schlüssel da ist und der deutsche Text schon „Rohzustand" lautet, überspringe ihn.

### Neu garantiert

- `fotos.phase.*.subtitle` (alle 3 Phasen) — diese fehlten in der alten Optik komplett
- `fotos.kachel.leer.label` — der „Foto"-Text in leeren Kacheln (master-konform)
- `fotos.kachel.leer` und `fotos.kachel.belegt` — Aria-Labels für Screenreader (Touch-Accessibility)

### Test

Nach Anwenden + Build: Sprach-Pille auf Startseite tippen → Tschechisch wählen → Foto-Modul öffnen. Die Akkordeon-Header müssen tschechisch sein („Hrubá stavba" / „Před zahájením prací" etc.). Wenn du `fotos.phase.rohzustand.subtitle` (oder ähnliches) im Klartext siehst, fehlt der Schlüssel in der jeweiligen Sprache.

---

*Translations bereit für 7 Sprachen — DE als Anker, andere als Übersetzung.*
