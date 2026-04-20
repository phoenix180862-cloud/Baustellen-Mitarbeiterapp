// ============================================================
// TW Baustellen-App - Modul: Baustellen (Etappe 4b - Vollausbau)
// ============================================================
// Container-Komponente fuer den Baustellen-Bereich.
//
// Interne Navigation (eigener State, unabhaengig vom Top-Level-Tab):
//   liste     - Kunden-Liste (was das Buero freigegeben hat)
//   detail    - Eine Baustelle gewaehlt, zeigt 5 Sub-Kacheln
//   browser   - Eine Sub-Kachel offen - je nach Kachel-Typ:
//                 Zeichnungen / Anweisungen -> Drive-Browser
//                 Baustellendaten           -> strukturierte Felder-Ansicht
//                 Fotos / Stunden           -> Stub-Ansicht bis Etappe 6/7
//
// Etappe 4b: Drive-Browser + Baustellendaten implementiert,
//            Fotos + Stunden bleiben explizite Stubs.
// ============================================================

function MABaustellenModul({ wechseleZuTab }) {
    const lang = useSprache();

    // View-State (innerhalb dieses Moduls)
    const [view, setView]                   = useState('liste');
    const [aktiveBaustelle, setAktive]      = useState(null);
    const [aktiveKachel, setAktiveKachel]   = useState(null);

    function zurueckZuStart() { wechseleZuTab('start'); }
    function zurueckZuListe() { setView('liste');  setAktive(null); setAktiveKachel(null); }
    function zurueckZuDetail(){ setView('detail'); setAktiveKachel(null); }

    function wechseleZuDetail(baustelle) {
        setAktive(baustelle);
        setView('detail');
    }

    function wechseleZuBrowser(kachel) {
        setAktiveKachel(kachel);
        setView('browser');
    }

    if (view === 'detail' && aktiveBaustelle) {
        return (
            <MABaustelleDetail
                baustelle={aktiveBaustelle}
                onZurueck={zurueckZuListe}
                onKachelClick={wechseleZuBrowser}/>
        );
    }

    if (view === 'browser' && aktiveBaustelle && aktiveKachel) {
        return (
            <MAKachelRouter
                baustelle={aktiveBaustelle}
                kachel={aktiveKachel}
                onZurueck={zurueckZuDetail}/>
        );
    }

    return (
        <MABaustellenListe
            onZurueck={zurueckZuStart}
            onSelect={wechseleZuDetail}/>
    );
}

// ============================================================
// Sub-View: Baustellen-Liste
// ============================================================

function MABaustellenListe({ onZurueck, onSelect }) {
    const lang = useSprache();
    const [baustellen, setBaustellen] = useState(null); // null = laedt, [] = leer
    const [fehler, setFehler]         = useState('');

    useEffect(function(){
        if (!window.TWMaFirebase || !window.TWMaFirebase.subscribeAktiveBaustellen) {
            setBaustellen([]);
            return;
        }
        // Live-Subscription: Liste aktualisiert sich, wenn das Buero eine neue
        // Baustelle freigibt oder eine Baustelle den Status wechselt.
        const unsub = window.TWMaFirebase.subscribeAktiveBaustellen(function(liste){
            setBaustellen(liste || []);
            setFehler('');
        });
        return unsub;
    }, []);

    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader
                titel={t('baustellen.titel')}
                onZurueck={onZurueck}/>

            <div style={{padding:'16px', maxWidth:620, margin:'0 auto', width:'100%'}}>
                {baustellen === null ? (
                    <div style={maSpinnerContainerStyle}>
                        <div style={maSpinnerStyle}></div>
                        <div style={{marginTop:12, color:'#666', fontSize:'0.9rem'}}>
                            {t('baustellen.warte')}
                        </div>
                    </div>
                ) : baustellen.length === 0 ? (
                    <div style={maEmptyStateStyle}>
                        <div style={{fontSize:'3rem', marginBottom:8, opacity:0.4}}>{'\u{1F3D7}\uFE0F'}</div>
                        <div style={{color:'#666', fontSize:'0.95rem', lineHeight:1.5, maxWidth:320}}>
                            {t('baustellen.keine')}
                        </div>
                        {fehler ? (
                            <div style={{
                                marginTop:12, fontSize:'0.75rem', color:'#999',
                                fontFamily:'monospace', textAlign:'center'
                            }}>
                                {fehler}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        {baustellen.map(function(b){
                            return <MABaustelleRow key={b.id} baustelle={b} onClick={function(){ onSelect(b); }}/>;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function MABaustelleRow({ baustelle, onClick }) {
    // Farbiger Status-Punkt: aktiv=gruen, pausiert=gelb, beendet=grau
    const statusFarbe = baustelle.status === 'beendet'  ? '#9E9E9E'
                      : baustelle.status === 'pausiert' ? '#F9A825'
                      : '#2E7D32';
    return (
        <button
            onClick={onClick}
            style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 16px',
                background:'#fff',
                border:'1px solid #E0E0E0',
                borderRadius:12,
                cursor:'pointer',
                textAlign:'left',
                boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
                width:'100%',
                minHeight:64
            }}>
            <div style={{
                width:44, height:44, borderRadius:'50%',
                background:'linear-gradient(135deg, #1E88E518, #1565C032)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, color:'#1565C0',
                position:'relative'
            }}>
                <MAIcon name="helm" size={22}/>
                <div style={{
                    position:'absolute', right:-2, bottom:-2,
                    width:12, height:12, borderRadius:'50%',
                    background:statusFarbe,
                    border:'2px solid #fff'
                }}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
                <div style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'1.05rem', fontWeight:600,
                    color:'#212121',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>
                    {baustelle.name || baustelle.id}
                </div>
                {baustelle.adresse ? (
                    <div style={{
                        fontSize:'0.8rem', color:'#666', marginTop:2,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>
                        {baustelle.adresse}
                    </div>
                ) : null}
            </div>
            <div style={{color:'#999', fontSize:'1.2rem', flexShrink:0}}>{'\u203A'}</div>
        </button>
    );
}

// ============================================================
// Sub-View: Baustellen-Detail (5 Sub-Kacheln)
// ============================================================

function MABaustelleDetail({ baustelle, onZurueck, onKachelClick }) {
    const lang = useSprache();

    // Skill 4.1: 5 Sub-Ordner in fester Reihenfolge
    const kacheln = [
        { id:'zeichnungen',     icon:'kalender',    farbe:'#1976D2' },
        { id:'anweisungen',     icon:'sprechblase', farbe:'#7B1FA2' },
        { id:'baustellendaten', icon:'helm',        farbe:'#455A64' },
        { id:'fotos',           icon:'kamera',      farbe:'#D84315' },
        { id:'stunden',         icon:'uhr',         farbe:'#2E7D32' }
    ];

    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader
                titel={baustelle.name || baustelle.id}
                onZurueck={onZurueck}/>

            <div style={{padding:'16px', maxWidth:620, margin:'0 auto', width:'100%'}}>
                {baustelle.adresse ? (
                    <div style={{
                        marginBottom:16,
                        fontSize:'0.9rem', color:'#666',
                        textAlign:'center', padding:'8px 16px',
                        background:'#F5F7FA', borderRadius:8
                    }}>
                        {baustelle.adresse}
                    </div>
                ) : null}

                <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10}}>
                    {kacheln.map(function(k){
                        const label = t('subkachel.' + k.id);
                        return (
                            <button
                                key={k.id}
                                onClick={function(){ onKachelClick(Object.assign({ label: label }, k)); }}
                                style={{
                                    display:'flex', flexDirection:'column',
                                    alignItems:'center', justifyContent:'center',
                                    gap:8,
                                    padding:'18px 12px',
                                    background:'#fff',
                                    border:'1px solid #E0E0E0',
                                    borderTop:'4px solid '+k.farbe,
                                    borderRadius:12,
                                    cursor:'pointer',
                                    boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
                                    minHeight:110,
                                    color:k.farbe
                                }}>
                                <MAIcon name={k.icon} size={32}/>
                                <div style={{
                                    color:'#212121',
                                    fontFamily:'var(--font-headline, Oswald)',
                                    fontSize:'0.95rem', fontWeight:600
                                }}>
                                    {label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Router: Welche Ansicht fuer welche Sub-Kachel?
// ============================================================

function MAKachelRouter({ baustelle, kachel, onZurueck }) {
    if (kachel.id === 'baustellendaten') {
        return <MABaustellendatenView baustelle={baustelle} kachel={kachel} onZurueck={onZurueck}/>;
    }
    if (kachel.id === 'fotos') {
        return (
            <MAStubView
                baustelle={baustelle} kachel={kachel} onZurueck={onZurueck}
                emoji={'\u{1F4F8}'}
                titel={t('stub.fotos.titel')}
                text={t('stub.fotos.text')}/>
        );
    }
    if (kachel.id === 'stunden') {
        return (
            <MAStubView
                baustelle={baustelle} kachel={kachel} onZurueck={onZurueck}
                emoji={'\u{23F1}\uFE0F'}
                titel={t('stub.stunden.titel')}
                text={t('stub.stunden.text')}/>
        );
    }
    // Default: Zeichnungen + Anweisungen -> echter Drive-Browser
    return <MABaustelleBrowser baustelle={baustelle} kachel={kachel} onZurueck={onZurueck}/>;
}

// ============================================================
// Sub-View: Drive-Browser (Zeichnungen + Anweisungen)
// ============================================================
//
// Status-Maschine:
//   lade              - Initial-Listing laeuft
//   ok                - Eintraege geladen (auch [] = leerer Ordner)
//   keinApiKey        - DRIVE_CONFIG.apiKey nicht gesetzt
//   nichtKonfig       - baustelle.staging_folder_id fehlt
//   unterordnerFehlt  - Root existiert, aber Unterordner (z.B. "Zeichnungen") fehlt
//   fehler            - HTTP-Fehler
//
// pfadStack: Array<{folderId, name}>
//   - Index 0 = Wurzel (die Sub-Kachel, z.B. "Zeichnungen")
//   - jeder weitere Eintrag = Ordner tiefer geklickt
// ============================================================

function MABaustelleBrowser({ baustelle, kachel, onZurueck }) {
    const lang = useSprache();
    const [status, setStatus]         = useState('lade');
    const [eintraege, setEintraege]   = useState([]);
    const [fehler, setFehler]         = useState('');
    const [pfadStack, setPfadStack]   = useState([]);
    const [vorschau, setVorschau]     = useState(null); // {type:'bild'|'pdf', file}

    function ladeWurzel() {
        setStatus('lade');
        setFehler('');
        const ds = window.TWMaDriveService;
        if (!ds || !ds.listKachelFolder) {
            setStatus('fehler');
            setFehler('DriveService nicht geladen');
            return;
        }
        ds.listKachelFolder(baustelle, kachel.id).then(function(res){
            if (res.kind === 'ok') {
                setEintraege(res.eintraege || []);
                setPfadStack([{ folderId: res.folderId, name: kachel.label }]);
                setStatus('ok');
            } else if (res.kind === 'keinApiKey') {
                setStatus('keinApiKey');
            } else if (res.kind === 'nichtKonfig') {
                setStatus('nichtKonfig');
            } else if (res.kind === 'unterordnerFehlt') {
                setStatus('unterordnerFehlt');
                setFehler(res.missingName || kachel.label);
            } else {
                setStatus('fehler');
                setFehler((res.fehler && res.fehler.message) || 'Unbekannter Fehler');
            }
        }).catch(function(err){
            setStatus('fehler');
            setFehler((err && err.message) || String(err));
        });
    }

    useEffect(ladeWurzel, [baustelle && baustelle.id, kachel && kachel.id]);

    function oeffneUnterordner(folder) {
        setStatus('lade');
        setFehler('');
        window.TWMaDriveService.listFolder(folder.id).then(function(entries){
            setEintraege(entries);
            setPfadStack(function(prev){
                return prev.concat([{ folderId: folder.id, name: folder.name }]);
            });
            setStatus('ok');
        }).catch(function(err){
            setStatus('fehler');
            setFehler((err && err.message) || String(err));
        });
    }

    function springeZuBreadcrumb(index) {
        // Alles ab index+1 verwerfen, dann das Listing des Ziels neu laden
        const ziel = pfadStack[index];
        if (!ziel) return;
        setStatus('lade');
        setFehler('');
        window.TWMaDriveService.listFolder(ziel.folderId).then(function(entries){
            setEintraege(entries);
            setPfadStack(pfadStack.slice(0, index + 1));
            setStatus('ok');
        }).catch(function(err){
            setStatus('fehler');
            setFehler((err && err.message) || String(err));
        });
    }

    function eineEbeneHoch() {
        if (pfadStack.length <= 1) {
            // Schon auf Wurzel-Ebene -> zurueck zum Baustellen-Detail
            onZurueck();
            return;
        }
        springeZuBreadcrumb(pfadStack.length - 2);
    }

    function aktualisieren() {
        // Cache leeren und aktuellen Ordner neu laden
        if (window.TWMaDriveService && window.TWMaDriveService.clearCache) {
            window.TWMaDriveService.clearCache();
        }
        if (pfadStack.length === 0) {
            ladeWurzel();
        } else {
            springeZuBreadcrumb(pfadStack.length - 1);
        }
    }

    function klickAufEintrag(eintrag) {
        if (eintrag.isFolder) {
            oeffneUnterordner(eintrag);
            return;
        }
        if (eintrag.isImage) {
            setVorschau({ type: 'bild', file: eintrag });
            return;
        }
        if (eintrag.isPdf) {
            setVorschau({ type: 'pdf', file: eintrag });
            return;
        }
        // Office / sonstiges: in neuem Tab auf Drive oeffnen
        const url = window.TWMaDriveService.getViewUrl(eintrag.id);
        window.open(url, '_blank', 'noopener');
    }

    // Header-Titel = Kachel-Label + aktueller Ordnername (falls tiefer)
    const headerTitel = pfadStack.length > 1
        ? (pfadStack[pfadStack.length-1].name + ' \u00B7 ' + (baustelle.name || baustelle.id))
        : (kachel.label + ' \u00B7 ' + (baustelle.name || baustelle.id));

    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader titel={headerTitel} onZurueck={eineEbeneHoch}/>

            {/* Breadcrumb + Refresh-Leiste (nur wenn Daten geladen) */}
            {status === 'ok' && pfadStack.length > 0 ? (
                <MABrowserToolbar
                    pfadStack={pfadStack}
                    onBreadcrumbClick={springeZuBreadcrumb}
                    onAktualisieren={aktualisieren}
                    anzahl={eintraege.length}/>
            ) : null}

            <div style={{
                padding:'12px 16px 32px',
                maxWidth:720, margin:'0 auto', width:'100%',
                flex:1
            }}>
                {status === 'lade' ? (
                    <div style={maSpinnerContainerStyle}>
                        <div style={maSpinnerStyle}></div>
                        <div style={{marginTop:12, color:'#666', fontSize:'0.9rem'}}>
                            {t('browser.laden')}
                        </div>
                    </div>
                ) : status === 'keinApiKey' ? (
                    <MABrowserHinweis
                        emoji={'\u{1F511}'}
                        titel={t('browser.keinApiKey')}
                        farbe="#F9A825"/>
                ) : status === 'nichtKonfig' ? (
                    <MABrowserHinweis
                        emoji={'\u{1F527}'}
                        titel={t('browser.nichtKonfig')}
                        farbe="#455A64"/>
                ) : status === 'unterordnerFehlt' ? (
                    <MABrowserHinweis
                        emoji={'\u{1F4C2}'}
                        titel={t('browser.unterordnerFehlt', { name: fehler || kachel.label })}
                        farbe="#455A64"/>
                ) : status === 'fehler' ? (
                    <MABrowserHinweis
                        emoji={'\u{26A0}\uFE0F'}
                        titel={t('browser.fehler')}
                        farbe="#C62828"
                        detail={fehler}/>
                ) : eintraege.length === 0 ? (
                    <MABrowserHinweis
                        emoji={'\u{1F4ED}'}
                        titel={t('browser.leer')}
                        farbe="#9E9E9E"/>
                ) : (
                    <MADateiListe
                        eintraege={eintraege}
                        onClick={klickAufEintrag}/>
                )}
            </div>

            {/* Vorschau-Overlays */}
            {vorschau && vorschau.type === 'bild' ? (
                <MABildLightbox
                    datei={vorschau.file}
                    onClose={function(){ setVorschau(null); }}/>
            ) : null}
            {vorschau && vorschau.type === 'pdf' ? (
                <MAPdfViewer
                    datei={vorschau.file}
                    onClose={function(){ setVorschau(null); }}/>
            ) : null}
        </div>
    );
}

// ============================================================
// Browser-Toolbar: Breadcrumb + Refresh-Button
// ============================================================

function MABrowserToolbar({ pfadStack, onBreadcrumbClick, onAktualisieren, anzahl }) {
    return (
        <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'8px 16px',
            background:'#FAFAFA',
            borderBottom:'1px solid #EEE',
            fontSize:'0.8rem'
        }}>
            {/* Breadcrumb */}
            <div style={{
                flex:1, minWidth:0,
                display:'flex', alignItems:'center', gap:4,
                overflow:'hidden', color:'#666'
            }}>
                {pfadStack.map(function(p, idx){
                    const isLast = idx === pfadStack.length - 1;
                    return (
                        <React.Fragment key={p.folderId + ':' + idx}>
                            {idx > 0 ? <span style={{color:'#BBB', flexShrink:0}}>/</span> : null}
                            <button
                                onClick={function(){ if (!isLast) onBreadcrumbClick(idx); }}
                                disabled={isLast}
                                style={{
                                    background:'transparent',
                                    border:'none',
                                    padding:'2px 4px',
                                    cursor: isLast ? 'default' : 'pointer',
                                    color: isLast ? '#212121' : '#1976D2',
                                    fontSize:'0.8rem',
                                    fontWeight: isLast ? 600 : 400,
                                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                    maxWidth:160
                                }}>
                                {p.name}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Datei-Zaehler */}
            <div style={{color:'#999', flexShrink:0, fontSize:'0.75rem'}}>
                {t('browser.dateien', { n: anzahl })}
            </div>

            {/* Refresh */}
            <button
                onClick={onAktualisieren}
                title={t('browser.aktualisieren')}
                style={{
                    background:'transparent',
                    border:'1px solid #DDD',
                    borderRadius:6,
                    padding:'4px 8px',
                    cursor:'pointer',
                    color:'#666',
                    display:'flex', alignItems:'center',
                    flexShrink:0
                }}>
                <MAIcon name="aktualisieren" size={14}/>
            </button>
        </div>
    );
}

// ============================================================
// Datei-Liste (nur Layout - Klicks oben im Browser verdrahtet)
// ============================================================

function MADateiListe({ eintraege, onClick }) {
    return (
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {eintraege.map(function(e){
                return <MADateiRow key={e.id} eintrag={e} onClick={function(){ onClick(e); }}/>;
            })}
        </div>
    );
}

function MADateiRow({ eintrag, onClick }) {
    const farbe = eintrag.isFolder ? '#F9A825'
                : eintrag.isImage  ? '#7B1FA2'
                : eintrag.isPdf    ? '#C62828'
                : '#455A64';

    const meta = [];
    if (eintrag.sizeHuman)     meta.push(eintrag.sizeHuman);
    if (eintrag.modifiedHuman) meta.push(eintrag.modifiedHuman);
    const metaText = meta.join(' \u00B7 ');

    return (
        <button
            onClick={onClick}
            style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px',
                background:'#fff',
                border:'1px solid #EEE',
                borderRadius:10,
                cursor:'pointer',
                textAlign:'left',
                width:'100%',
                minHeight:56
            }}>
            <div style={{
                width:36, height:36, borderRadius:8,
                background: farbe + '18',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, color: farbe
            }}>
                <MAIcon name={eintrag.iconName || 'datei'} size={18}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
                <div style={{
                    fontSize:'0.95rem',
                    color:'#212121',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>
                    {eintrag.name}
                </div>
                {metaText ? (
                    <div style={{fontSize:'0.72rem', color:'#999', marginTop:2}}>
                        {metaText}
                    </div>
                ) : null}
            </div>
            <div style={{color:'#BBB', flexShrink:0}}>{'\u203A'}</div>
        </button>
    );
}

// ============================================================
// Browser-Hinweis (leer, fehlt, Fehler, nicht konfiguriert)
// ============================================================

function MABrowserHinweis({ emoji, titel, detail, farbe }) {
    return (
        <div style={{
            textAlign:'center',
            padding:'40px 16px',
            maxWidth:420, margin:'20px auto 0 auto'
        }}>
            <div style={{fontSize:'2.5rem', marginBottom:12, opacity:0.7}}>{emoji}</div>
            <div style={{
                color: farbe || '#666',
                fontSize:'0.95rem',
                lineHeight:1.5,
                fontWeight:500
            }}>
                {titel}
            </div>
            {detail ? (
                <div style={{
                    marginTop:12,
                    fontSize:'0.72rem',
                    color:'#999',
                    fontFamily:'monospace',
                    wordBreak:'break-word'
                }}>
                    {detail}
                </div>
            ) : null}
        </div>
    );
}

// ============================================================
// Bild-Lightbox (Fullscreen-Vorschau fuer Images)
// ============================================================

function MABildLightbox({ datei, onClose }) {
    const bildUrl = window.TWMaDriveService.getFileContentUrl(datei.id);
    const downloadUrl = window.TWMaDriveService.getDownloadUrl(datei.id);

    // ESC-Handler
    useEffect(function(){
        const onKey = function(ev){ if (ev.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return function(){ window.removeEventListener('keydown', onKey); };
    }, []);

    return (
        <div
            onClick={onClose}
            style={{
                position:'fixed', inset:0,
                background:'rgba(0,0,0,0.92)',
                zIndex:9999,
                display:'flex', flexDirection:'column',
                animation:'ma-fadeIn 0.2s ease-out'
            }}>
            {/* Header mit Dateiname + Schliessen */}
            <div style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'12px 16px',
                color:'#fff', fontSize:'0.85rem',
                background:'rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    flex:1, minWidth:0,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    opacity:0.9
                }}>
                    {datei.name}
                </div>
                <a
                    href={downloadUrl}
                    onClick={function(ev){ ev.stopPropagation(); }}
                    target="_blank" rel="noopener"
                    style={{
                        display:'flex', alignItems:'center', gap:4,
                        padding:'6px 10px',
                        background:'rgba(255,255,255,0.1)',
                        border:'1px solid rgba(255,255,255,0.25)',
                        borderRadius:6,
                        color:'#fff',
                        textDecoration:'none',
                        fontSize:'0.8rem'
                    }}>
                    <MAIcon name="download" size={14}/>
                    <span>{t('browser.herunterladen')}</span>
                </a>
                <button
                    onClick={function(ev){ ev.stopPropagation(); onClose(); }}
                    style={{
                        display:'flex', alignItems:'center', justifyContent:'center',
                        width:36, height:36,
                        background:'rgba(255,255,255,0.1)',
                        border:'1px solid rgba(255,255,255,0.25)',
                        borderRadius:'50%',
                        color:'#fff', cursor:'pointer'
                    }}
                    aria-label={t('browser.schliessen')}>
                    <MAIcon name="x-close" size={18}/>
                </button>
            </div>

            {/* Bild-Bereich */}
            <div
                onClick={function(ev){ ev.stopPropagation(); }}
                style={{
                    flex:1,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'8px', overflow:'auto',
                    touchAction:'pinch-zoom'
                }}>
                <img
                    src={bildUrl}
                    alt={datei.name}
                    style={{
                        maxWidth:'100%', maxHeight:'100%',
                        objectFit:'contain',
                        userSelect:'none'
                    }}/>
            </div>
        </div>
    );
}

// ============================================================
// PDF-Viewer (Fullscreen-Vorschau fuer PDFs)
// ============================================================

function MAPdfViewer({ datei, onClose }) {
    const embedUrl    = window.TWMaDriveService.getPdfEmbedUrl(datei.id);
    const downloadUrl = window.TWMaDriveService.getDownloadUrl(datei.id);

    useEffect(function(){
        const onKey = function(ev){ if (ev.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return function(){ window.removeEventListener('keydown', onKey); };
    }, []);

    return (
        <div style={{
            position:'fixed', inset:0,
            background:'#2C2C2C',
            zIndex:9999,
            display:'flex', flexDirection:'column',
            animation:'ma-fadeIn 0.2s ease-out'
        }}>
            <div style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'12px 16px',
                color:'#fff', fontSize:'0.85rem',
                background:'rgba(0,0,0,0.6)'
            }}>
                <div style={{
                    flex:1, minWidth:0,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>
                    {datei.name}
                </div>
                <a
                    href={downloadUrl}
                    target="_blank" rel="noopener"
                    style={{
                        display:'flex', alignItems:'center', gap:4,
                        padding:'6px 10px',
                        background:'rgba(255,255,255,0.1)',
                        border:'1px solid rgba(255,255,255,0.25)',
                        borderRadius:6,
                        color:'#fff',
                        textDecoration:'none',
                        fontSize:'0.8rem'
                    }}>
                    <MAIcon name="download" size={14}/>
                    <span>{t('browser.herunterladen')}</span>
                </a>
                <button
                    onClick={onClose}
                    style={{
                        display:'flex', alignItems:'center', justifyContent:'center',
                        width:36, height:36,
                        background:'rgba(255,255,255,0.1)',
                        border:'1px solid rgba(255,255,255,0.25)',
                        borderRadius:'50%',
                        color:'#fff', cursor:'pointer'
                    }}
                    aria-label={t('browser.schliessen')}>
                    <MAIcon name="x-close" size={18}/>
                </button>
            </div>
            <iframe
                src={embedUrl}
                title={datei.name}
                style={{
                    flex:1,
                    width:'100%',
                    border:'none',
                    background:'#fff'
                }}/>
        </div>
    );
}

// ============================================================
// Baustellendaten-Ansicht (strukturierte Firebase-Felder)
// ============================================================
//
// Datenquelle: baustelle.baustellendaten (Objekt aus /aktive_baustellen/{id}/)
// Erwartete Felder (alle optional):
//   bauherr, bauherr_tel, bauherr_mail, architekt, architekt_tel,
//   bauleitung, bauleitung_tel, ansprechpartner, ansprechpartner_tel,
//   hausmeister, hausmeister_tel, zugangsinfo,
//   strom_verfuegbar (bool), wasser_verfuegbar (bool),
//   start_datum, end_datum, besonderheiten
//
// Neben baustellendaten lesen wir auch direkt von baustelle:
//   name, adresse (Top-Level-Felder des aktive_baustellen-Eintrags)
// ============================================================

function MABaustellendatenView({ baustelle, kachel, onZurueck }) {
    const lang = useSprache();
    const bd = baustelle.baustellendaten || {};

    // Pruefen, ob ueberhaupt etwas inhaltliches da ist
    function hatWert(v) {
        if (v === undefined || v === null) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        if (typeof v === 'boolean') return true;
        if (typeof v === 'number') return true;
        return false;
    }
    const bdFelder = ['bauherr','bauherr_tel','bauherr_mail','architekt','architekt_tel',
                      'bauleitung','bauleitung_tel','ansprechpartner','ansprechpartner_tel',
                      'hausmeister','hausmeister_tel','zugangsinfo',
                      'strom_verfuegbar','wasser_verfuegbar',
                      'start_datum','end_datum','besonderheiten'];
    const hatBdDaten = bdFelder.some(function(k){ return hatWert(bd[k]); });
    const hatObjektDaten = hatWert(baustelle.name) || hatWert(baustelle.adresse);

    const titel = kachel.label + ' \u00B7 ' + (baustelle.name || baustelle.id);

    if (!hatBdDaten && !hatObjektDaten) {
        return (
            <div className="ma-bau-container" style={maContainerStyle}>
                <MASubHeader titel={titel} onZurueck={onZurueck}/>
                <MABrowserHinweis
                    emoji={'\u{1F4CB}'}
                    titel={t('bdaten.leer')}
                    farbe="#455A64"/>
            </div>
        );
    }

    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader titel={titel} onZurueck={onZurueck}/>

            <div style={{padding:'16px', maxWidth:620, margin:'0 auto', width:'100%'}}>
                {/* Gruppe: Objekt */}
                <MABdGruppe titel={t('bdaten.gruppe.objekt')}>
                    <MABdFeld label={t('bdaten.name')}    wert={baustelle.name}/>
                    <MABdFeld label={t('bdaten.adresse')} wert={baustelle.adresse}/>
                </MABdGruppe>

                {/* Gruppe: Bauherr */}
                <MABdGruppe titel={t('bdaten.gruppe.bauherr')}>
                    <MABdFeld label={t('bdaten.bauherr')}      wert={bd.bauherr}/>
                    <MABdFeld label={t('bdaten.bauherr_tel')}  wert={bd.bauherr_tel}  tel={bd.bauherr_tel}/>
                    <MABdFeld label={t('bdaten.bauherr_mail')} wert={bd.bauherr_mail} mail={bd.bauherr_mail}/>
                </MABdGruppe>

                {/* Gruppe: Beteiligte */}
                <MABdGruppe titel={t('bdaten.gruppe.beteiligte')}>
                    <MABdFeld label={t('bdaten.architekt')}          wert={bd.architekt}/>
                    <MABdFeld label={t('bdaten.architekt_tel')}      wert={bd.architekt_tel}      tel={bd.architekt_tel}/>
                    <MABdFeld label={t('bdaten.bauleitung')}         wert={bd.bauleitung}/>
                    <MABdFeld label={t('bdaten.bauleitung_tel')}     wert={bd.bauleitung_tel}     tel={bd.bauleitung_tel}/>
                    <MABdFeld label={t('bdaten.ansprechpartner')}    wert={bd.ansprechpartner}/>
                    <MABdFeld label={t('bdaten.ansprechpartner_tel')} wert={bd.ansprechpartner_tel} tel={bd.ansprechpartner_tel}/>
                </MABdGruppe>

                {/* Gruppe: Zugang */}
                <MABdGruppe titel={t('bdaten.gruppe.zugang')}>
                    <MABdFeld label={t('bdaten.hausmeister')}     wert={bd.hausmeister}/>
                    <MABdFeld label={t('bdaten.hausmeister_tel')} wert={bd.hausmeister_tel} tel={bd.hausmeister_tel}/>
                    <MABdFeld label={t('bdaten.zugangsinfo')}     wert={bd.zugangsinfo}/>
                </MABdGruppe>

                {/* Gruppe: Technik */}
                <MABdGruppe titel={t('bdaten.gruppe.technik')}>
                    <MABdFeld label={t('bdaten.strom')}  wert={formatBool(bd.strom_verfuegbar)}/>
                    <MABdFeld label={t('bdaten.wasser')} wert={formatBool(bd.wasser_verfuegbar)}/>
                </MABdGruppe>

                {/* Gruppe: Zeitraum */}
                <MABdGruppe titel={t('bdaten.gruppe.zeitraum')}>
                    <MABdFeld label={t('bdaten.start')} wert={formatDatum(bd.start_datum)}/>
                    <MABdFeld label={t('bdaten.ende')}  wert={formatDatum(bd.end_datum)}/>
                </MABdGruppe>

                {/* Gruppe: Besonderheiten */}
                <MABdGruppe titel={t('bdaten.gruppe.besonderheiten')}>
                    <MABdFeld label={''} wert={bd.besonderheiten} mehrzeilig={true}/>
                </MABdGruppe>
            </div>
        </div>
    );
}

function formatBool(v) {
    if (v === true)  return t('bdaten.ja');
    if (v === false) return t('bdaten.nein');
    return '';
}

function formatDatum(v) {
    if (!v) return '';
    // Erlaubt: ISO "2026-05-01", Unix-ms, oder schon fertig formatiert
    try {
        if (typeof v === 'number') {
            const d = new Date(v);
            if (!isNaN(d.getTime())) {
                const pad = function(x){ return x < 10 ? '0'+x : ''+x; };
                return pad(d.getDate()) + '.' + pad(d.getMonth()+1) + '.' + d.getFullYear();
            }
        }
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
            const parts = v.substring(0, 10).split('-');
            return parts[2] + '.' + parts[1] + '.' + parts[0];
        }
    } catch(e) { /* fallthrough */ }
    return String(v);
}

function MABdGruppe({ titel, children }) {
    // Wenn alle Kinder leer sind, blende die ganze Gruppe aus.
    // Trick: wir rendern die Kinder in einem Container und pruefen per Filter.
    const kinder = React.Children.toArray(children);
    const sichtbare = kinder.filter(function(c){
        // Feld ist nicht-leer, wenn es einen wert-Wert hat (props.wert truthy)
        return c && c.props && (c.props.wert || c.props.wert === 0 || c.props.wert === t('bdaten.nein'));
    });
    if (sichtbare.length === 0) return null;

    return (
        <div style={{
            marginBottom:16,
            background:'#fff',
            border:'1px solid #E0E0E0',
            borderRadius:12,
            overflow:'hidden'
        }}>
            {titel ? (
                <div style={{
                    padding:'10px 14px',
                    background:'#F5F7FA',
                    borderBottom:'1px solid #EEE',
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'0.85rem',
                    fontWeight:600,
                    color:'#455A64',
                    textTransform:'uppercase',
                    letterSpacing:'0.03em'
                }}>
                    {titel}
                </div>
            ) : null}
            <div style={{padding:'4px 0'}}>
                {sichtbare}
            </div>
        </div>
    );
}

function MABdFeld({ label, wert, tel, mail, mehrzeilig }) {
    if (!wert && wert !== 0) return null;
    const wertStr = String(wert);
    return (
        <div style={{
            display: mehrzeilig ? 'block' : 'flex',
            padding:'8px 14px',
            gap:12,
            borderTop:'1px solid #F5F5F5',
            alignItems: mehrzeilig ? 'flex-start' : 'center'
        }}>
            {label ? (
                <div style={{
                    minWidth: mehrzeilig ? 'auto' : 130,
                    fontSize:'0.78rem',
                    color:'#999',
                    flexShrink:0,
                    marginBottom: mehrzeilig ? 4 : 0
                }}>
                    {label}
                </div>
            ) : null}
            <div style={{
                flex:1,
                fontSize:'0.95rem',
                color:'#212121',
                wordBreak:'break-word',
                lineHeight: mehrzeilig ? 1.5 : 1.3,
                whiteSpace: mehrzeilig ? 'pre-wrap' : 'normal'
            }}>
                {tel ? (
                    <a href={'tel:' + String(tel).replace(/[^0-9+]/g,'')}
                       style={{color:'#1976D2', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6}}>
                        <MAIcon name="telefon" size={14}/>
                        <span style={{color:'#212121'}}>{wertStr}</span>
                    </a>
                ) : mail ? (
                    <a href={'mailto:' + mail}
                       style={{color:'#1976D2', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6}}>
                        <MAIcon name="mail" size={14}/>
                        <span style={{color:'#212121'}}>{wertStr}</span>
                    </a>
                ) : wertStr}
            </div>
        </div>
    );
}

// ============================================================
// Stub-View (Fotos / Stunden - Platzhalter fuer Etappen 6/7)
// ============================================================

function MAStubView({ baustelle, kachel, onZurueck, emoji, titel, text }) {
    return (
        <div className="ma-bau-container" style={maContainerStyle}>
            <MASubHeader
                titel={kachel.label + ' \u00B7 ' + (baustelle.name || baustelle.id)}
                onZurueck={onZurueck}/>

            <div style={{
                padding:'48px 16px',
                maxWidth:420, margin:'20px auto 0 auto',
                textAlign:'center'
            }}>
                <div style={{fontSize:'3.5rem', marginBottom:16, opacity:0.8}}>{emoji}</div>
                <h3 style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    color:'#455A64',
                    margin:'0 0 12px',
                    fontSize:'1.1rem'
                }}>
                    {titel}
                </h3>
                <div style={{
                    color:'#666',
                    fontSize:'0.92rem',
                    lineHeight:1.5
                }}>
                    {text}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Shared: Sub-Header mit Zurueck-Button
// ============================================================

function MASubHeader({ titel, onZurueck }) {
    return (
        <div style={{
            position:'sticky', top:0, zIndex:10,
            display:'flex', alignItems:'center', gap:8,
            padding:'10px 12px',
            background:'linear-gradient(180deg, #fff 0%, #fff 94%, rgba(0,0,0,0) 100%)',
            borderBottom:'1px solid #EEE'
        }}>
            <button
                onClick={onZurueck}
                style={{
                    display:'flex', alignItems:'center', gap:4,
                    padding:'8px 12px',
                    background:'transparent',
                    border:'1px solid #DDD',
                    borderRadius:8,
                    cursor:'pointer',
                    color:'#555',
                    fontFamily:'var(--font-body)',
                    fontSize:'0.9rem',
                    minHeight:40
                }}>
                <MAIcon name="arrow-left" size={18}/>
                <span>{t('common.zurueck')}</span>
            </button>
            <div style={{
                flex:1,
                textAlign:'center',
                fontFamily:'var(--font-headline, Oswald)',
                fontSize:'1.05rem', fontWeight:600,
                color:'#212121',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                padding:'0 8px'
            }}>
                {titel}
            </div>
            <div style={{width:68}}/>{/* Platzhalter fuer Symmetrie */}
        </div>
    );
}

// ============================================================
// Shared Styles
// ============================================================

const maContainerStyle = {
    minHeight:      'calc(100vh - var(--header-h, 64px))',
    background:     'var(--bg-secondary, #F4F6F8)',
    display:        'flex',
    flexDirection:  'column',
    animation:      'ma-fadeIn 0.3s ease-out'
};

const maSpinnerContainerStyle = {
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'40px 20px'
};

const maSpinnerStyle = {
    width:40, height:40,
    border:'4px solid #E3F2FD', borderTopColor:'#1E88E5',
    borderRadius:'50%',
    animation:'ma-spin 0.85s linear infinite'
};

const maEmptyStateStyle = {
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'48px 20px', textAlign:'center'
};
