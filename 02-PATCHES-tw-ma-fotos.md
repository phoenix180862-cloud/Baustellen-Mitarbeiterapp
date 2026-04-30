# 🩹 Patches für `jsx/tw-ma-fotos.jsx`

**4 Block-Replacements** — chirurgisch genau, kein Workflow-Bruch.

> 💡 **Vorgehen:** Suche jeden VORHER-Block in deiner Datei (am einfachsten mit Strg+F im Editor), markiere ihn und ersetze mit dem NACHHER-Block. Reihenfolge: 1 → 2 → 3 → 4.

---

## Patch 1 von 4 — Konstante `MA_FOTO_PHASEN`

**Was:** CSS-Variablen statt Hex, plus Hex-Fallback für rgba-Berechnungen, plus master-konforme Labels.

### 🔴 VORHER (in deiner Datei suchen)

```javascript
// 3-Phasen-Definition (1:1 wie Master-App tw-aufmass.jsx Z. 5322)
const MA_FOTO_PHASEN = [
    { key: 'rohzustand',     nr: 1, color: '#E67E22' },
    { key: 'vorarbeiten',    nr: 2, color: '#1E88E5' },
    { key: 'fertigstellung', nr: 3, color: '#43A047' }
];
```

### 🟢 NACHHER (komplett ersetzen)

```javascript
// 3-Phasen-Definition (1:1 wie Master-App tw-aufmass.jsx Z. 5322)
// colorVar = CSS-Variable fuer den eigentlichen Akzent
// colorHex = Fallback-Hex fuer rgba-Mischfarben (z.B. Phase-Pille-Hintergrund)
const MA_FOTO_PHASEN = [
    { key: 'rohzustand',     nr: 1, colorVar: 'var(--accent-orange)', colorHex: '#FB8C00' },
    { key: 'vorarbeiten',    nr: 2, colorVar: 'var(--accent-blue)',   colorHex: '#1E88E5' },
    { key: 'fertigstellung', nr: 3, colorVar: 'var(--accent-green)',  colorHex: '#43A047' }
];

// Alias fuer alte Aufrufe (phase.color funktioniert weiterhin)
MA_FOTO_PHASEN.forEach(function(p){ p.color = p.colorHex; });

// Hex -> "r,g,b" fuer rgba-Strings (z.B. rgba(251,140,0,0.15))
function maHexToRgb(hex) {
    var h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(function(c){ return c+c; }).join('');
    var n = parseInt(h, 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
}
```

---

## Patch 2 von 4 — Komponente `MAPhaseAuswahl` und `MAPhaseKachel`

**Was:** Komplett neu im Akkordeon-Look. Phase-Pille (26×26 farbig) + Title (Oswald uppercase) + Untertitel + Status-Pille rechts. Klick klappt das eingebettete Wand-Grid auf, statt zu einer Sub-Seite zu navigieren.

### ⚠️ Wichtig

Diese neue `MAPhaseAuswahl` rendert das **Wand-Grid direkt eingebettet**, statt zu einer Sub-Seite zu navigieren. Das bedeutet: Die Stufe `'waende'` im Routing wird nicht mehr erreicht — `MAFotosView` muss leicht angepasst werden (siehe Patch-Anhang am Ende).

### 🔴 VORHER (kompletten Block suchen + ersetzen)

Suche im Code: `// MAPhaseAuswahl - Stufe 3` — ersetze von dieser Kommentar-Zeile bis einschließlich des **Schluss-`}`** der Funktion `MAPhaseKachel`. Das ist der Block mit `function MAPhaseAuswahl(...)` und `function MAPhaseKachel(...)`.

### 🟢 NACHHER (kompletter neuer Block)

```javascript
// ============================================================
// MAPhaseAuswahl - Stufe 3: Akkordeon-Header pro Phase + Wand-Grid
// ============================================================
// Master-konformer Look (tw-aufmass.jsx Z. 12290+):
//   - Aufklappbare Phasen-Header (Phase-Pille + Titel + Untertitel + Status)
//   - Beim Aufklappen: Wand-Grid direkt eingebettet (kein Seiten-Wechsel)
//   - Erste Phase ist standardmaessig offen, andere zugeklappt

function MAPhaseAuswahl({ baustelle, raum, aenderungsKey, onZurueck, onPhaseGewaehlt }) {
    const lang = useSprache();
    const [fortschritt, setFortschritt] = useState({ rohzustand: 0, vorarbeiten: 0, fertigstellung: 0 });
    const [expandedPhases, setExpandedPhases] = useState({ rohzustand: true, vorarbeiten: false, fertigstellung: false });

    // Anzahl moeglicher Foto-Slots (Waende + ggf. Boden + ggf. Decke)
    const slotsTotal = (raum.wandzahl || 4) + (raum.hatBoden ? 1 : 0) + (raum.hatDecke ? 1 : 0);

    // Foto-Anzahl pro Phase laden
    useEffect(function(){
        if (!window.TWMaStorage || !window.TWMaStorage.zaehleFotos) return;
        window.TWMaStorage.zaehleFotos(raum.id).then(function(map){
            setFortschritt(map || { rohzustand: 0, vorarbeiten: 0, fertigstellung: 0 });
        }).catch(function(){});
    }, [raum.id, aenderungsKey]);

    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader
                titel={raum.bezeichnung + (raum.nummer ? ' \u00B7 ' + raum.nummer : '')}
                untertitel={(raum.geschoss || '') + ' \u00B7 ' + tConfig('fotos.raum.waende', { n: raum.wandzahl || 4 })}
                onZurueck={onZurueck}/>

            <div style={{padding:'12px', maxWidth:720, margin:'0 auto', width:'100%'}}>
                <div style={{
                    fontSize:'0.82rem',
                    color:'var(--text-muted)',
                    marginBottom:14,
                    textAlign:'center'
                }}>
                    {tConfig('fotos.phase.intro')}
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {MA_FOTO_PHASEN.map(function(phase){
                        const anzahl = fortschritt[phase.key] || 0;
                        const isExpanded = expandedPhases[phase.key];
                        return (
                            <MAPhaseAkkordeon
                                key={phase.key}
                                phase={phase}
                                anzahlFotos={anzahl}
                                slotsTotal={slotsTotal}
                                isExpanded={isExpanded}
                                onToggle={function(){
                                    setExpandedPhases(function(prev){
                                        var next = Object.assign({}, prev);
                                        next[phase.key] = !prev[phase.key];
                                        return next;
                                    });
                                }}
                                baustelle={baustelle}
                                raum={raum}
                                onAenderung={function(){
                                    // Reload Fortschritts-Counter
                                    if (window.TWMaStorage && window.TWMaStorage.zaehleFotos) {
                                        window.TWMaStorage.zaehleFotos(raum.id).then(function(map){
                                            setFortschritt(map || { rohzustand: 0, vorarbeiten: 0, fertigstellung: 0 });
                                        }).catch(function(){});
                                    }
                                }}/>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Sub-Komponente: einzelner Akkordeon-Header + (wenn aufgeklappt) eingebettetes Wand-Grid
function MAPhaseAkkordeon({ phase, anzahlFotos, slotsTotal, isExpanded, onToggle, baustelle, raum, onAenderung }) {
    const lang = useSprache();
    const fertig = anzahlFotos >= slotsTotal && slotsTotal > 0;
    const rgb = maHexToRgb(phase.colorHex || phase.color || '#888888');

    return (
        <div style={{
            background:'var(--bg-card, var(--bg-secondary))',
            border:'1px solid var(--border-color, var(--border-light))',
            borderRadius:12,
            overflow:'hidden',
            boxShadow:'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))'
        }}>
            {/* Header (immer sichtbar, klickbar) */}
            <div
                onClick={onToggle}
                style={{
                    display:'flex',
                    alignItems:'center',
                    gap:10,
                    padding:'12px 14px',
                    cursor:'pointer',
                    minHeight:56
                }}>
                {/* Phase-Pille (Nummer in Kreis) */}
                <span style={{
                    width:30, height:30, borderRadius:'50%',
                    background:'rgba(' + rgb + ',0.15)',
                    color: phase.colorHex || phase.color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-headline, Oswald)', fontWeight:700, fontSize:'14px',
                    flexShrink:0
                }}>{phase.nr}</span>

                {/* Titel + Untertitel */}
                <div style={{flex:1, minWidth:0}}>
                    <div style={{
                        fontFamily:'var(--font-headline, Oswald)',
                        fontWeight:600,
                        fontSize:'14px',
                        textTransform:'uppercase',
                        letterSpacing:'0.5px',
                        color:'var(--text-primary)',
                        lineHeight:1.2
                    }}>
                        {tConfig('fotos.phase.' + phase.key + '.label')}
                    </div>
                    <div style={{
                        fontSize:'11px',
                        color:'var(--text-muted)',
                        marginTop:2,
                        whiteSpace:'nowrap',
                        overflow:'hidden',
                        textOverflow:'ellipsis'
                    }}>
                        {tConfig('fotos.phase.' + phase.key + '.subtitle')}
                    </div>
                </div>

                {/* Status-Pille */}
                <span style={{
                    fontSize:'11px',
                    padding:'3px 10px',
                    borderRadius:999,
                    background: fertig ? 'rgba(67,160,71,0.15)' : (anzahlFotos > 0 ? 'rgba(' + rgb + ',0.12)' : 'rgba(0,0,0,0.06)'),
                    color: fertig ? 'var(--accent-green, #43A047)' : (anzahlFotos > 0 ? (phase.colorHex || phase.color) : 'var(--text-muted)'),
                    fontWeight:700,
                    flexShrink:0,
                    fontFamily:'var(--font-headline, Oswald)',
                    letterSpacing:'0.5px'
                }}>
                    {fertig ? '\u2713 ' : ''}{anzahlFotos}/{slotsTotal}
                </span>

                {/* Aufklapp-Pfeil */}
                <span style={{
                    fontSize:'14px',
                    color:'var(--text-muted)',
                    transition:'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    flexShrink:0
                }}>{'\u25BC'}</span>
            </div>

            {/* Eingebettetes Wand-Grid (nur sichtbar wenn aufgeklappt) */}
            {isExpanded ? (
                <div style={{
                    padding:'10px 12px 14px 12px',
                    background:'rgba(0,0,0,0.02)',
                    borderTop:'1px solid var(--border-color, var(--border-light))'
                }}>
                    <MAWandRaster
                        baustelle={baustelle}
                        raum={raum}
                        phase={phase}
                        onAenderung={onAenderung}/>
                </div>
            ) : null}
        </div>
    );
}
```

---

## Patch 3 von 4 — Komponente `MAWandRaster` (nur Render-Body)

**Was:** Festes Grid raus, Auto-Fill-Grid rein. Der `MASubHeader` und das Phase-Banner werden entfernt, weil das Wand-Grid jetzt eingebettet im Akkordeon angezeigt wird (kein eigener Sub-Screen mehr).

### ⚠️ Wichtig

Die Funktions-Signatur ändert sich leicht: `onZurueck` wird nicht mehr gebraucht (kein Sub-Screen). Behalte den Parameter aber drin, damit alte Aufrufe nicht crashen.

### 🔴 VORHER (suchen)

Suche im Code:
```javascript
function MAWandRaster({ baustelle, raum, phase, onZurueck, onAenderung }) {
```

Ersetze von dort an **alles bis zum `}` der Funktion** (also den ganzen Body und alle Sub-Renderings) — aber LASSE die Zeile mit `// Sub-Komponente: einzelne Wand-Kachel` und alles was dahinter kommt, INTAKT (das ist die `MAWandKachel`-Komponente, die in Patch 4 separat ersetzt wird).

### 🟢 NACHHER (kompletter neuer Body)

```javascript
function MAWandRaster({ baustelle, raum, phase, onZurueck, onAenderung }) {
    const lang = useSprache();
    const [fotosByWand, setFotosByWand] = useState({});
    const [laden, setLaden] = useState(true);

    const [aktiveWand, setAktiveWand] = useState(null);
    const [vorschauFoto, setVorschauFoto] = useState(null);
    const [komprimiere, setKomprimiere] = useState(false);
    const [fehler, setFehler] = useState(null);
    const [editorFoto, setEditorFoto] = useState(null);
    const [notizFoto, setNotizFoto] = useState(null);

    const fileInputRef = React.useRef(null);

    function reloadFotos() {
        if (!window.TWMaStorage || !window.TWMaStorage.listFotos) {
            setLaden(false);
            return;
        }
        setLaden(true);
        window.TWMaStorage.listFotos(raum.id, phase.key).then(function(liste){
            const map = {};
            (liste || []).forEach(function(f){ map[f.wand_id] = f; });
            setFotosByWand(map);
            setLaden(false);
        }).catch(function(){
            setFotosByWand({});
            setLaden(false);
        });
    }

    useEffect(function(){
        reloadFotos();
    }, [raum.id, phase.key]);

    // Wand-Liste (Master-Dokument 8.6 + Master-Code Z. 12365)
    const waende = [];
    for (let i = 1; i <= (raum.wandzahl || 4); i++) {
        waende.push({ id: 'wand-'+i, kind: 'wand', nr: i });
    }
    if (raum.hatBoden) waende.push({ id: 'boden', kind: 'boden' });
    if (raum.hatDecke) waende.push({ id: 'decke', kind: 'decke' });

    // ------------------------------------------------------------
    // Workflow: Kachel-Klick (unveraendert)
    // ------------------------------------------------------------
    function handleWandClick(wand) {
        const vorhanden = fotosByWand[wand.id];
        setAktiveWand(wand);
        setFehler(null);
        if (vorhanden) {
            setVorschauFoto(null);
        } else {
            setVorschauFoto(null);
            triggerKamera();
        }
    }

    function triggerKamera() {
        if (!fileInputRef.current) return;
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }

    function handleFileChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!window.TWMaStorage || !window.TWMaStorage.compressFileToDataUrl) {
            setFehler(tConfig('fotos.aufnahme.fehler.storage'));
            return;
        }
        setKomprimiere(true);
        setFehler(null);
        window.TWMaStorage.compressFileToDataUrl(file, 1920, 0.85)
            .then(function(res){
                setVorschauFoto({
                    dataUrl: res.dataUrl,
                    breite: res.breite,
                    hoehe:  res.hoehe,
                    originalGroesse: res.originalGroesse,
                    neueGroesse:     res.neueGroesse
                });
                setKomprimiere(false);
            })
            .catch(function(err){
                setKomprimiere(false);
                setFehler(tConfig('fotos.aufnahme.fehler.komprimierung') + ' ' + (err.message || ''));
            });
    }

    function handleVerwenden() {
        if (!vorschauFoto || !aktiveWand) return;
        if (!window.TWMaStorage || !window.TWMaStorage.saveFoto) {
            setFehler(tConfig('fotos.aufnahme.fehler.storage'));
            return;
        }
        const baustelleId = baustelle.id || baustelle.staging_folder_id || baustelle.name;
        const onb = (window.TWMaCore && window.TWMaCore.getDeviceId) ? window.TWMaCore.getDeviceId() : '';
        const fotoId = 'foto-' + Date.now() + '-' + Math.random().toString(36).substr(2,5);
        const eintrag = {
            id: fotoId,
            baustelle_id: baustelleId,
            raum_id: raum.id,
            phase: phase.key,
            wand_id: aktiveWand.id,
            foto_dataurl: vorschauFoto.dataUrl,
            thumbnail_dataurl: vorschauFoto.dataUrl, // TODO: spaeter echtes Thumbnail
            notiz_original: null,
            notiz_deutsch: null,
            drawings: [],
            crop_rect: null,
            aufgenommen_am: Date.now(),
            aufgenommen_von: onb,
            sync_status: 'pending'
        };
        // Falls schon ein Foto an dieser Wand: id des alten uebernehmen (Ueberschreiben)
        const altesFoto = fotosByWand[aktiveWand.id];
        if (altesFoto && altesFoto.id) eintrag.id = altesFoto.id;

        window.TWMaStorage.saveFoto(eintrag).then(function(){
            setVorschauFoto(null);
            setAktiveWand(null);
            reloadFotos();
            if (typeof onAenderung === 'function') onAenderung();
        }).catch(function(err){
            setFehler(tConfig('fotos.aufnahme.fehler.speichern') + ' ' + (err.message || ''));
        });
    }

    function handleWiederholen() {
        setVorschauFoto(null);
        triggerKamera();
    }

    function handleAbbrechen() {
        setVorschauFoto(null);
        setAktiveWand(null);
    }

    function handleFotoNeu() {
        triggerKamera();
    }

    function handleFotoLoeschen() {
        if (!aktiveWand) return;
        const vorhanden = fotosByWand[aktiveWand.id];
        if (!vorhanden) return;
        if (!confirm(tConfig('fotos.aufnahme.loeschen.bestaetigen'))) return;
        if (!window.TWMaStorage || !window.TWMaStorage.deleteFoto) return;
        window.TWMaStorage.deleteFoto(vorhanden.id).then(function(){
            setAktiveWand(null);
            reloadFotos();
            if (typeof onAenderung === 'function') onAenderung();
        }).catch(function(err){
            setFehler(tConfig('fotos.aufnahme.fehler.loeschen') + ' ' + (err.message || ''));
        });
    }

    return (
        <div>
            {laden ? (
                <div style={{textAlign:'center', padding:24, color:'var(--text-muted)', fontSize:'0.85rem'}}>
                    {tConfig('fotos.aufnahme.lade')}
                </div>
            ) : (
                <React.Fragment>
                    {/* Master-konformes Auto-Fill-Grid (tw-aufmass.jsx Z. 12362) */}
                    <div style={{
                        display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(82px, 1fr))',
                        gap:8
                    }}>
                        {waende.map(function(w){
                            const foto = fotosByWand[w.id];
                            return (
                                <MAWandKachel
                                    key={w.id}
                                    wand={w}
                                    phase={phase}
                                    foto={foto}
                                    onClick={function(){ handleWandClick(w); }}/>
                            );
                        })}
                    </div>
                </React.Fragment>
            )}

            {/* Hidden file input fuer Kamera */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{display:'none'}}/>

            {/* Komprimieren-Indikator */}
            {komprimiere ? (
                <MAOverlay>
                    <MAOverlayBox>
                        <div style={{fontSize:'2.2rem', marginBottom:10}}>{'\u{23F3}'}</div>
                        <div style={{fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)'}}>
                            {tConfig('fotos.aufnahme.komprimiere')}
                        </div>
                    </MAOverlayBox>
                </MAOverlay>
            ) : null}

            {/* Fehler-Snackbar */}
            {fehler ? (
                <div onClick={function(){ setFehler(null); }}
                    style={{
                        position:'fixed', bottom:16, left:16, right:16,
                        background:'var(--accent-red-dark, #C62828)',
                        color:'#fff', padding:'12px 16px', borderRadius:10,
                        boxShadow:'0 6px 20px rgba(0,0,0,0.3)', zIndex:1100,
                        fontSize:'0.9rem', cursor:'pointer'
                    }}>{fehler}</div>
            ) : null}

            {/* Vorschau-Dialog (frisch aufgenommen) */}
            {vorschauFoto && aktiveWand ? (
                <MAFotoVorschau
                    foto={vorschauFoto}
                    wand={aktiveWand}
                    phase={phase}
                    onWiederholen={handleWiederholen}
                    onVerwenden={handleVerwenden}
                    onAbbrechen={handleAbbrechen}/>
            ) : null}

            {/* Detail-Dialog (vorhandenes Foto) */}
            {!vorschauFoto && aktiveWand && fotosByWand[aktiveWand.id] && !komprimiere && !editorFoto && !notizFoto ? (
                <MAFotoDetail
                    foto={fotosByWand[aktiveWand.id]}
                    wand={aktiveWand}
                    phase={phase}
                    onSchliessen={handleAbbrechen}
                    onNeuFotografieren={handleFotoNeu}
                    onLoeschen={handleFotoLoeschen}
                    onBearbeiten={function(){ setEditorFoto(fotosByWand[aktiveWand.id]); }}
                    onSprachNotiz={function(){ setNotizFoto(fotosByWand[aktiveWand.id]); }}/>
            ) : null}

            {/* Editor (B6.3) */}
            {editorFoto ? (
                <MAFotoEditor
                    foto={editorFoto}
                    raum={raum}
                    wand={aktiveWand}
                    phase={phase}
                    onAbbrechen={function(){ setEditorFoto(null); }}
                    onGespeichert={function(){
                        setEditorFoto(null);
                        setAktiveWand(null);
                        reloadFotos();
                        if (typeof onAenderung === 'function') onAenderung();
                    }}/>
            ) : null}

            {/* Sprach-Notiz-Dialog (B6.4) */}
            {notizFoto ? (
                <MASprachNotizDialog
                    foto={notizFoto}
                    wand={aktiveWand}
                    phase={phase}
                    onAbbrechen={function(){ setNotizFoto(null); }}
                    onGespeichert={function(){
                        setNotizFoto(null);
                        reloadFotos();
                        if (typeof onAenderung === 'function') onAenderung();
                    }}/>
            ) : null}
        </div>
    );
}
```

---

## Patch 4 von 4 — Komponente `MAWandKachel`

**Was:** 3:4 Hochformat statt 1:1 quadratisch. Dunkler Hintergrund (`var(--bg-dark)`). Kleines orange Rund-Badge oben links statt großes Wand-Label. Master-konformes Camera-Icon mit „Foto"-Text mittig bei leerer Kachel.

### 🔴 VORHER (kompletten Block suchen + ersetzen)

Suche: `// Sub-Komponente: einzelne Wand-Kachel` und ersetze vom Kommentar bis zum schließenden `}` der `MAWandKachel`-Funktion.

### 🟢 NACHHER

```javascript
// Sub-Komponente: einzelne Wand-Kachel (master-konform: 3:4 Hochformat, Auto-Fill)
// Inspiriert von tw-aufmass.jsx Z. 12368-12450
function MAWandKachel({ wand, phase, foto, onClick }) {
    const [pressed, setPressed] = useState(false);
    const hatFoto = !!foto;

    let label;
    let icon;
    let badgeColor;
    if (wand.kind === 'wand') {
        label = tConfig('fotos.wand.label', { n: wand.nr });
        icon = wand.nr; // Zahl im Badge
        badgeColor = 'rgba(251,140,0,0.92)'; // Orange wie Master
    } else if (wand.kind === 'boden') {
        label = tConfig('fotos.boden');
        icon = '\u25A0'; // Quadrat
        badgeColor = 'rgba(96,125,139,0.92)'; // Slate fuer Boden
    } else {
        label = tConfig('fotos.decke');
        icon = '\u25B2'; // Dreieck
        badgeColor = 'rgba(120,144,156,0.92)'; // Heller-Slate fuer Decke
    }

    const thumbUrl = foto && (foto.thumbnail_dataurl || foto.foto_dataurl);
    const istMarkiert = foto && foto.marked;

    return (
        <button
            onClick={onClick}
            onPointerDown={function(){ setPressed(true); }}
            onPointerUp={function(){ setPressed(false); }}
            onPointerLeave={function(){ setPressed(false); }}
            aria-label={label + ' \u2014 ' + (hatFoto ? tConfig('fotos.kachel.belegt') : tConfig('fotos.kachel.leer'))}
            style={{
                position:'relative',
                aspectRatio:'3 / 4', // Master-Hochformat
                padding:0,
                background: hatFoto ? '#0d1117' : 'var(--bg-dark, #1A1F24)',
                border: istMarkiert
                    ? '2px solid var(--accent-blue, #1E88E5)'
                    : (hatFoto ? '2px solid var(--border-medium, #C8CED3)' : '2px dashed var(--border-medium, #C8CED3)'),
                borderRadius:10,
                cursor:'pointer',
                boxShadow: istMarkiert
                    ? '0 0 0 2px rgba(30,136,229,0.25)'
                    : (pressed ? '0 1px 3px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.08)'),
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                overflow:'hidden',
                transform: pressed ? 'translateY(1px)' : 'translateY(0)',
                transition:'transform 0.12s ease-out, box-shadow 0.12s ease-out'
            }}>

            {/* Wand-Badge (kleines Rund-Badge oben links, master-konform) */}
            <span style={{
                position:'absolute', top:5, left:5,
                width:22, height:22, borderRadius:'50%',
                background: badgeColor,
                color:'#fff',
                fontFamily:'var(--font-headline, Oswald)',
                fontSize:'11px', fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
                zIndex:2,
                boxShadow:'0 1px 3px rgba(0,0,0,0.3)'
            }}>{icon}</span>

            {/* Hintergrund-Thumbnail wenn Foto vorhanden */}
            {thumbUrl ? (
                <img
                    src={thumbUrl}
                    alt={label}
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'cover'
                    }}/>
            ) : null}

            {/* Leerer Zustand: Camera-Icon + "Foto"-Text (master-konform Z. 12444) */}
            {!hatFoto ? (
                <div style={{
                    textAlign:'center',
                    color:'var(--text-muted, #888)',
                    pointerEvents:'none'
                }}>
                    <div style={{fontSize:'24px', marginBottom:4}}>{'\uD83D\uDCF7'}</div>
                    <div style={{
                        fontSize:'10px',
                        fontFamily:'var(--font-headline, Oswald)',
                        textTransform:'uppercase',
                        letterSpacing:'0.5px'
                    }}>{tConfig('fotos.kachel.leer.label')}</div>
                </div>
            ) : null}

            {/* CROP-Badge (wenn beschnitten) */}
            {hatFoto && foto.crop_rect ? (
                <span style={{
                    position:'absolute', bottom:5, right:5,
                    fontSize:'9px', padding:'2px 5px', borderRadius:4,
                    background:'rgba(30,136,229,0.92)', color:'#fff',
                    fontWeight:700, letterSpacing:'0.3px',
                    fontFamily:'var(--font-headline, Oswald)',
                    zIndex:2
                }}>CROP</span>
            ) : null}

            {/* Notiz-Badge (wenn Sprach-Notiz vorhanden) */}
            {hatFoto && foto.notiz_original && foto.notiz_original.text ? (
                <span style={{
                    position:'absolute',
                    bottom: foto.crop_rect ? 22 : 5,
                    right:5,
                    fontSize:'10px', padding:'2px 5px', borderRadius:4,
                    background:'rgba(67,160,71,0.92)', color:'#fff',
                    fontWeight:700, letterSpacing:'0.3px',
                    fontFamily:'var(--font-headline, Oswald)',
                    zIndex:2
                }}>{'\uD83C\uDFA4'}</span>
            ) : null}
        </button>
    );
}
```

---

## Patch-Anhang — Routing-Anpassung in `MAFotosView`

Da `MAPhaseAuswahl` jetzt das Wand-Grid eingebettet rendert, wird die Stufe `'waende'` nicht mehr separat erreicht. Das `MAFotosView`-Routing kann diese Stufe optional behalten (wird einfach nie aktiv) oder aufgeräumt werden.

### Empfohlen: lass die `'waende'`-Stufe drin

Sie ist nicht erreichbar, aber stört nichts. So bleibt das Routing rückwärtskompatibel zu eventuellen Tests, die `setStufe('waende')` direkt aufrufen.

### Falls du sauber aufräumen willst (optional)

In der `MAFotosView`-Funktion suchst du den Block:

```javascript
if (stufe === 'waende' && aktiverRaum && aktivePhase) {
    return (
        <MAWandRaster ... />
    );
}
```

Und löschst ihn. Dann den `setStufe('waende')`-Aufruf in `onPhaseGewaehlt` entfernen — `onPhaseGewaehlt` wird nicht mehr gebraucht, weil das Akkordeon das selbst regelt.

---

## Build

Nach allen Patches:

```bash
# Linux / WSL / Mac
./build-linux.sh

# Windows
build.bat
```

Dann auf GitHub pushen, GitHub-Pages-Deploy abwarten (Tab "Actions"), App auf dem Handy neu laden (Cache leeren!).

---

*Patch-Set abgeschlossen — 4 Block-Replacements, 1 optionaler Routing-Cleanup.*
