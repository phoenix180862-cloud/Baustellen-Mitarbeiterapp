// ============================================================
// TW Baustellen-App - MAApp (Top-Level)
// ============================================================
// Enthaelt:
// - Header-Leiste (Zurueck/Vor, Titel, A-Gross/A-Klein)
// - Navigationsleiste mit 6 Modul-Buttons (Start, Baustellen, Kalender,
//   Fotos, Stunden, Nachrichten)
// - Routing zum aktiven Modul
// - History-Stack fuer Zurueck/Vor-Funktionalitaet
// ============================================================
// MA-Header: Zurueck | Titel | Schrift-Toggle
// ============================================================

function MAHeader({ onZurueck, onVor, historyHatZurueck, historyHatVor }) {
    const lang = useSprache();
    const [scale, setScale] = useState(window.TWMaConfig.getFontScale());

    useEffect(function(){
        function handler(e){ setScale(e.detail.scale); }
        window.addEventListener('tw-ma-font-scale-changed', handler);
        return function(){ window.removeEventListener('tw-ma-font-scale-changed', handler); };
    }, []);

    function groesser(){ window.TWMaConfig.increaseFontScale(); }
    function kleiner(){ window.TWMaConfig.decreaseFontScale(); }

    const navBtnStyle = function(aktiv) {
        return {
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            gap:4,
            padding:'8px 10px',
            minHeight:'var(--touch-target-min)',
            minWidth: 44,
            borderRadius:'var(--radius-md)',
            background: aktiv ? 'linear-gradient(135deg, #E53935, #C62828)' : 'var(--bg-tertiary)',
            color: aktiv ? '#fff' : 'var(--text-muted)',
            boxShadow: aktiv ? 'var(--shadow-red)' : 'none',
            cursor: aktiv ? 'pointer' : 'not-allowed',
            opacity: aktiv ? 1 : 0.5,
            transition:'transform 0.15s'
        };
    };

    const schriftBtnStyle = {
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        padding:'8px 12px',
        minHeight:'var(--touch-target-min)',
        borderRadius:'var(--radius-md)',
        background:'var(--bg-tertiary)',
        color:'var(--text-primary)',
        fontFamily:'var(--font-headline)',
        fontWeight:600,
        cursor:'pointer',
        fontSize:'0.9rem'
    };

    return (
        <header style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            gap:8,
            padding:'10px 12px',
            background:'#fff',
            borderBottom:'1px solid var(--border-light)',
            boxShadow:'var(--shadow-sm)',
            position:'sticky',
            top:0,
            zIndex:50
        }}>
            {/* Links: Zurueck / Vor */}
            <div style={{display:'flex', gap:6}}>
                <button
                    disabled={!historyHatZurueck}
                    onClick={onZurueck}
                    style={navBtnStyle(historyHatZurueck)}
                    aria-label={t('header.zurueck')}
                    title={t('header.zurueck')}>
                    <MAIcon name="arrow-left" size={20}/>
                </button>
                <button
                    disabled={!historyHatVor}
                    onClick={onVor}
                    style={navBtnStyle(historyHatVor)}
                    aria-label={t('header.vor')}
                    title={t('header.vor')}>
                    <MAIcon name="arrow-right" size={20}/>
                </button>
            </div>

            {/* Mitte: Titel */}
            <div style={{
                flex:1,
                textAlign:'center',
                fontFamily:'var(--font-headline)',
                fontSize:'1.15rem',
                fontWeight:600,
                letterSpacing:'1.5px',
                color:'var(--anthrazit)',
                textTransform:'uppercase'
            }}>
                {t('header.titel')}
            </div>

            {/* Rechts: A-Gross / A-Klein */}
            <div style={{display:'flex', gap:6}}>
                <button
                    onClick={kleiner}
                    style={schriftBtnStyle}
                    aria-label={t('header.klein')}
                    title={t('header.klein')}>
                    <span style={{fontSize:'0.8rem'}}>A</span>\u2193
                </button>
                <button
                    onClick={groesser}
                    style={schriftBtnStyle}
                    aria-label={t('header.gross')}
                    title={t('header.gross')}>
                    <span style={{fontSize:'1rem'}}>A</span>\u2191
                </button>
            </div>
        </header>
    );
}

// ============================================================
// MAUpdateToast - zeigt einen Toast, wenn ein neuer SW verfuegbar ist
// ============================================================

function MAUpdateToast() {
    const [sichtbar, setSichtbar] = useState(false);

    useEffect(function(){
        function handler(){ setSichtbar(true); }
        window.addEventListener('tw-ma-sw-update-ready', handler);
        return function(){ window.removeEventListener('tw-ma-sw-update-ready', handler); };
    }, []);

    function jetztAktualisieren() {
        // SW zum skipWaiting auffordern, dann Seite reloaden
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.getRegistration().then(function(reg){
                if (reg && reg.waiting) {
                    reg.waiting.postMessage({ action: 'skipWaiting' });
                }
                setTimeout(function(){ location.reload(); }, 300);
            });
        } else {
            location.reload();
        }
    }

    if (!sichtbar) return null;

    return (
        <div style={{
            position:'fixed',
            bottom:20,
            left:'50%',
            transform:'translateX(-50%)',
            background:'linear-gradient(135deg, #1E88E5, #0D47A1)',
            color:'#fff',
            padding:'12px 16px 12px 20px',
            borderRadius:'var(--radius-pill)',
            boxShadow:'var(--shadow-lg)',
            display:'flex',
            alignItems:'center',
            gap:12,
            zIndex:2000,
            maxWidth:'92vw',
            animation:'ma-fadeIn 0.35s ease-out'
        }}>
            <span style={{fontSize:'1.3rem'}}>\u2728</span>
            <span style={{fontSize:'0.92rem', fontWeight:500}}>
                Neue Version verfuegbar
            </span>
            <button
                onClick={jetztAktualisieren}
                style={{
                    background:'#fff',
                    color:'var(--accent-blue-dark)',
                    border:'none',
                    borderRadius:'var(--radius-pill)',
                    padding:'8px 16px',
                    fontFamily:'var(--font-headline)',
                    fontWeight:700,
                    fontSize:'0.85rem',
                    letterSpacing:'0.5px',
                    textTransform:'uppercase',
                    cursor:'pointer',
                    minHeight:36
                }}>Aktualisieren</button>
            <button
                onClick={function(){ setSichtbar(false); }}
                style={{
                    background:'transparent',
                    color:'#fff',
                    border:'none',
                    fontSize:'1.3rem',
                    padding:'4px 8px',
                    cursor:'pointer',
                    opacity:0.8
                }}
                aria-label="Schliessen">\u00D7</button>
        </div>
    );
}

// ============================================================
// MAApp - Root-Komponente mit Auth-Gate (Etappe 3)
// ============================================================
// Vor der normalen App wird der Auth-Status geprueft:
//   - Neues Geraet             -> Onboarding-Flow
//   - Eingeloest, wartet       -> Warte-auf-Freigabe-Screen
//   - Freigeschaltet           -> PIN-Login-Screen
//   - PIN korrekt              -> Volle App (Navigation + Tabs)
//   - Gesperrt/entfernt/wipe   -> Wipe-Screen
// ============================================================

function MAApp() {
    // ============================================================
    // Auth-Status
    // ============================================================
    // 'lade'              IndexedDB wird abgefragt
    // 'kein_firebase'     FIREBASE_CONFIG unvollstaendig
    // 'onboarding'        Erst-Einrichtung (Code + PIN eingeben)
    // 'wartend_freigabe'  Eingeloest, aber Buero hat noch nicht freigeschaltet
    // 'pin_login'         Onboarding abgeschlossen, PIN abfragen
    // 'authenticated'     App voll nutzbar
    // 'locked'            Buero hat Zugang gesperrt
    // 'geloescht'         Buero hat Zugang entfernt (Wipe-Screen)
    // 'pin_wipe'          Zu viele PIN-Fehlversuche (Wipe-Screen)
    const [authStatus, setAuthStatus] = useState('lade');
    const [onboarding, setOnboarding] = useState(null);
    const [wipeGrund, setWipeGrund]   = useState('');

    // Initial-Tab aus URL-Query (Manifest-Shortcuts) oder Standard "start"
    const initialTab = (window.__TW_MA_INITIAL_TAB__ || 'start');
    const [historyStack, setHistoryStack] = useState([initialTab]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const aktiverTab = historyStack[historyIndex];

    // Bei Sprachwechsel Re-Render triggern
    const lang = useSprache();

    // ============================================================
    // Beim Mount: Onboarding-Status aus IndexedDB laden
    // ============================================================

    useEffect(function(){
        // 1. Firebase-Config pruefen: apiKey vorhanden?
        const cfg = window.TWMaConfig && window.TWMaConfig.FIREBASE_CONFIG;
        if (!cfg || !cfg.apiKey) {
            setAuthStatus('kein_firebase');
            return;
        }

        // 2. IndexedDB lesen
        if (!window.TWMaStorage || !window.TWMaStorage.ladeOnboarding) {
            setAuthStatus('onboarding');
            return;
        }

        window.TWMaStorage.ladeOnboarding().then(function(daten){
            if (!daten || !daten.uid) {
                setAuthStatus('onboarding');
                return;
            }

            setOnboarding(daten);

            if (!daten.onboardingAbgeschlossen) {
                setAuthStatus('wartend_freigabe');
            } else {
                setAuthStatus('pin_login');
            }

            // Parallel: Firebase init + Server-Status-Check
            if (window.TWMaFirebase && window.TWMaFirebase.signInAnonymous) {
                window.TWMaFirebase.signInAnonymous().then(function(){
                    return window.TWMaFirebase.checkUserStatus(daten.uid);
                }).then(function(status){
                    if (status.status === 'locked') {
                        setWipeGrund('locked');
                        setAuthStatus('locked');
                    } else if (status.status === 'geloescht') {
                        setWipeGrund('geloescht');
                        setAuthStatus('geloescht');
                    } else if (status.status === 'approved' && !daten.onboardingAbgeschlossen) {
                        window.TWMaStorage.speicherOnboarding(Object.assign({}, daten, {
                            onboardingAbgeschlossen: true
                        })).then(function(){
                            setOnboarding(Object.assign({}, daten, { onboardingAbgeschlossen:true }));
                            setAuthStatus('pin_login');
                        });
                    }
                }).catch(function(err){
                    console.warn('[MAApp] Server-Status-Check Fehler (Offline-Modus?):', err);
                });
            }
        }).catch(function(err){
            console.error('[MAApp] ladeOnboarding-Fehler:', err);
            setAuthStatus('onboarding');
        });
    }, []);

    // ============================================================
    // Live-Listener auf User-Status (wenn authenticated)
    // ============================================================

    useEffect(function(){
        if (authStatus !== 'authenticated' || !onboarding || !onboarding.uid) return;
        if (!window.TWMaFirebase || !window.TWMaFirebase.subscribeUserStatus) return;

        const unsub = window.TWMaFirebase.subscribeUserStatus(onboarding.uid, function(status){
            if (status.status === 'locked') {
                setWipeGrund('locked');
                setAuthStatus('locked');
            } else if (status.status === 'geloescht') {
                setWipeGrund('geloescht');
                setAuthStatus('geloescht');
            }
        });
        return function(){ if (typeof unsub === 'function') unsub(); };
    }, [authStatus, onboarding]);

    // ============================================================
    // Heartbeat alle 60s (wenn authenticated)
    // ============================================================

    useEffect(function(){
        if (authStatus !== 'authenticated') return;
        if (!window.TWMaFirebase || !window.TWMaFirebase.sendeHeartbeat) return;
        window.TWMaFirebase.sendeHeartbeat();
        const iv = setInterval(function(){ window.TWMaFirebase.sendeHeartbeat(); }, 60000);
        return function(){ clearInterval(iv); };
    }, [authStatus]);

    // ============================================================
    // Handler fuer Auth-Uebergaenge
    // ============================================================

    function handleOnboardingFertig(daten) {
        setOnboarding({
            uid:                    daten.uid,
            pinHash:                daten.pinHash,
            mitarbeiterName:        daten.mitarbeiterName,
            geraetName:             daten.geraetName,
            onboardingAbgeschlossen:true
        });
        setAuthStatus('authenticated');
    }

    function handleOnboardingGewipt(grund) {
        window.TWMaStorage.loescheOnboarding().then(function(){
            if (window.TWMaFirebase && window.TWMaFirebase.signOut) {
                window.TWMaFirebase.signOut();
            }
            setOnboarding(null);
            const g = (grund === 'locked') ? 'locked' : 'geloescht';
            setWipeGrund(g);
            setAuthStatus(g);
        });
    }

    function handlePinErfolg() {
        setAuthStatus('authenticated');
    }

    function handlePinWipe(grund) {
        setOnboarding(null);
        setWipeGrund(grund || 'zu_viele_versuche');
        setAuthStatus('pin_wipe');
    }

    function handleWipeNeu() {
        if (window.TWMaStorage && window.TWMaStorage.clearAllSettings) {
            window.TWMaStorage.clearAllSettings();
        }
        if (window.TWMaFirebase && window.TWMaFirebase.signOut) {
            window.TWMaFirebase.signOut();
        }
        setOnboarding(null);
        setWipeGrund('');
        setAuthStatus('onboarding');
    }

    // ============================================================
    // Navigation (nur relevant innerhalb 'authenticated')
    // ============================================================

    function wechseleZuTab(tabId) {
        if (tabId === aktiverTab) return;
        const neueStack = historyStack.slice(0, historyIndex + 1);
        neueStack.push(tabId);
        if (neueStack.length > 30) {
            neueStack.shift();
            setHistoryStack(neueStack);
            setHistoryIndex(neueStack.length - 1);
        } else {
            setHistoryStack(neueStack);
            setHistoryIndex(neueStack.length - 1);
        }
    }

    function zurueck() {
        if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
    }

    function vor() {
        if (historyIndex < historyStack.length - 1) setHistoryIndex(historyIndex + 1);
    }

    const historyHatZurueck = historyIndex > 0;
    const historyHatVor     = historyIndex < historyStack.length - 1;

    // ============================================================
    // Auth-Gate: je nach authStatus anderer Screen
    // ============================================================

    if (authStatus === 'lade') {
        return <MALadeScreen/>;
    }

    if (authStatus === 'kein_firebase') {
        return (
            <div style={{
                minHeight:'100vh',
                background:'linear-gradient(180deg, #FFF3E0 0%, #F4F6F8 100%)',
                padding:'20px 16px',
                display:'flex', flexDirection:'column', justifyContent:'center',
                animation:'ma-fadeIn 0.4s ease-out'
            }}>
                <div style={{
                    maxWidth:460, margin:'0 auto', padding:'28px 22px',
                    background:'#fff', borderRadius:16,
                    boxShadow:'0 10px 40px rgba(0,0,0,0.08)',
                    textAlign:'center'
                }}>
                    <div style={{fontSize:'3rem', marginBottom:8}}>\u26A0\uFE0F</div>
                    <h1 style={{
                        fontFamily:'var(--font-headline, Oswald)',
                        color:'#E65100', margin:'0 0 12px',
                        fontSize:'1.4rem'
                    }}>
                        App noch nicht fertig eingerichtet
                    </h1>
                    <p style={{color:'#444', lineHeight:1.5, margin:0}}>
                        Die Firebase-Zugangsdaten fehlen in <code>js/tw-ma-config.js</code>.
                        Bitte beim Chef melden &mdash; er muss die Werte aus der Firebase Console
                        eintragen und die App neu deployen.
                    </p>
                </div>
            </div>
        );
    }

    if (authStatus === 'onboarding') {
        return (
            <MAOnboardingFlow
                onFertig={handleOnboardingFertig}
                onGewipt={handleOnboardingGewipt}/>
        );
    }

    if (authStatus === 'wartend_freigabe' && onboarding) {
        return (
            <MAOnboardingWartend
                uid={onboarding.uid}
                mitarbeiterName={onboarding.mitarbeiterName}
                onFreigegeben={function(){
                    window.TWMaStorage.speicherOnboarding(Object.assign({}, onboarding, {
                        onboardingAbgeschlossen: true
                    })).then(function(){
                        setOnboarding(Object.assign({}, onboarding, { onboardingAbgeschlossen:true }));
                        setAuthStatus('authenticated');
                    });
                }}
                onGewipt={handleOnboardingGewipt}/>
        );
    }

    if (authStatus === 'pin_login' && onboarding) {
        return (
            <MAPinLoginScreen
                onboarding={onboarding}
                onErfolg={handlePinErfolg}
                onWipe={handlePinWipe}/>
        );
    }

    if (authStatus === 'locked' || authStatus === 'geloescht' || authStatus === 'pin_wipe') {
        const g = (authStatus === 'pin_wipe') ? 'zu_viele_versuche' : wipeGrund;
        return (
            <MAWipeScreen
                grund={g}
                onNeu={handleWipeNeu}/>
        );
    }

    // ============================================================
    // Authenticated: 2-Ordner-Modell (Etappe 4a)
    // ============================================================

    function aktivesModul() {
        const props = { wechseleZuTab: wechseleZuTab };
        switch (aktiverTab) {
            case 'start':       return <MAStartseite {...props}/>;
            case 'baustellen':  return <MABaustellenModul {...props}/>;
            case 'nachrichten': return <MANachrichtenModul {...props}/>;
            default:            return <MAStartseite {...props}/>;
        }
    }

    return (
        <div className="ma-app">
            <MAHeader
                onZurueck={zurueck}
                onVor={vor}
                historyHatZurueck={historyHatZurueck}
                historyHatVor={historyHatVor}
            />
            <main style={{
                flex:1,
                width:'100%',
                overflowY:'auto',
                background:'var(--bg-secondary)'
            }}>
                {aktivesModul()}
            </main>
            <MAUpdateToast/>
        </div>
    );
}
