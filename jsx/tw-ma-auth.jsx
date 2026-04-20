// ============================================================
// TW Baustellen-App - Auth-Komponenten (Etappe 3)
// ============================================================
// - MAPinLoginScreen: PIN-Abfrage bei jedem App-Start, falls
//   ein Onboarding-Eintrag existiert
// - MAWipeScreen:     Zeigt "Zugang gesperrt / entfernt", bietet
//   Neu-Einrichtung an
// - MALadeScreen:     Einfacher Spinner fuer Initial-Phase
// ============================================================

const AUTH_PIN_MAX_VERSUCHE = 5;

const AUTH_STYLE_CONTAINER = {
    minHeight:     '100vh',
    background:    'linear-gradient(180deg, #E3F2FD 0%, #F4F6F8 100%)',
    padding:       '20px 16px',
    display:       'flex',
    flexDirection: 'column',
    justifyContent:'center',
    animation:     'ma-fadeIn 0.45s ease-out'
};

const AUTH_STYLE_CARD = {
    maxWidth:   420,
    margin:     '0 auto',
    padding:    '28px 22px',
    background: '#fff',
    borderRadius: 'var(--radius-lg, 16px)',
    boxShadow:  '0 10px 40px rgba(0,0,0,0.08)',
    display:    'flex',
    flexDirection: 'column',
    gap:        16,
    textAlign:  'center'
};

const AUTH_STYLE_PIN_INPUT = {
    width:          '100%',
    padding:        '16px 18px',
    fontSize:       '1.6rem',
    textAlign:      'center',
    letterSpacing:  '10px',
    border:         '2px solid #d0d0d0',
    borderRadius:   'var(--radius-md, 10px)',
    background:     '#fafafa',
    outline:        'none',
    boxSizing:      'border-box',
    fontFamily:     'monospace'
};

const AUTH_STYLE_BTN_PRIMARY = {
    padding:        '14px 20px',
    fontSize:       '1rem',
    fontWeight:     700,
    fontFamily:     'var(--font-headline, Oswald)',
    letterSpacing:  '1px',
    textTransform:  'uppercase',
    background:     'linear-gradient(135deg, #1E88E5, #1565C0)',
    color:          '#fff',
    border:         'none',
    borderRadius:   'var(--radius-md, 10px)',
    cursor:         'pointer',
    boxShadow:      '0 6px 20px rgba(30,136,229,0.35)',
    minHeight:      48
};

const AUTH_STYLE_FEHLER = {
    padding:     '12px 14px',
    background:  '#FFEBEE',
    border:      '1px solid #EF9A9A',
    borderRadius:'var(--radius-md, 10px)',
    color:       '#B71C1C',
    fontSize:    '0.95rem'
};

// ============================================================
// MAPinLoginScreen
// ============================================================

function MAPinLoginScreen({ onboarding, onErfolg, onWipe }) {
    const lang = useSprache();
    const [pin, setPin] = useState('');
    const [fehler, setFehler] = useState('');
    const [versuche, setVersuche] = useState(0);
    const [laedt, setLaedt] = useState(false);

    useEffect(function(){
        if (window.TWMaStorage && window.TWMaStorage.getPinVersuche) {
            window.TWMaStorage.getPinVersuche().then(setVersuche);
        }
    }, []);

    function handlePinChange(e) {
        const filtered = e.target.value.replace(/\D/g, '').slice(0,8);
        setPin(filtered);
        if (fehler) setFehler('');
    }

    function handleSubmit() {
        if (laedt) return;
        if (pin.length < 4) return;
        setLaedt(true);

        window.TWMaStorage.pinZuHash(pin, onboarding.uid).then(function(hash){
            if (hash === onboarding.pinHash) {
                window.TWMaStorage.pinVersucheResetten();
                setLaedt(false);
                onErfolg();
            } else {
                window.TWMaStorage.pinVersucheErhoehen().then(function(neuerStand){
                    setVersuche(neuerStand);
                    setPin('');
                    setLaedt(false);

                    if (neuerStand >= AUTH_PIN_MAX_VERSUCHE) {
                        window.TWMaStorage.loescheOnboarding().then(function(){
                            window.TWMaStorage.pinVersucheResetten();
                            if (window.TWMaFirebase && window.TWMaFirebase.signOut) {
                                window.TWMaFirebase.signOut();
                            }
                            onWipe('zu_viele_versuche');
                        });
                    } else {
                        setFehler(t('pin.falsch'));
                    }
                });
            }
        }).catch(function(err){
            console.error('[PinLogin] Hash-Fehler:', err);
            setFehler(t('onboard.fehler.firebase_fehler'));
            setLaedt(false);
        });
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit();
    }

    const verbleibend = Math.max(0, AUTH_PIN_MAX_VERSUCHE - versuche);

    return (
        <div style={AUTH_STYLE_CONTAINER}>
            <div style={AUTH_STYLE_CARD}>
                <MAFirmenLogo size="medium"/>
                <h1 style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'1.5rem', fontWeight:600,
                    color:'var(--accent-blue-dark, #0D47A1)',
                    margin:0
                }}>{t('pin.titel')}</h1>
                <p style={{fontSize:'1rem', color:'#555', margin:0}}>
                    {t('pin.hallo', { name: onboarding.mitarbeiterName || '' })}
                </p>

                <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    value={pin}
                    onChange={handlePinChange}
                    onKeyDown={handleKeyDown}
                    style={AUTH_STYLE_PIN_INPUT}
                    placeholder="\u2022\u2022\u2022\u2022"
                    maxLength={8}
                    aria-label={t('pin.label')}/>

                {fehler && (
                    <div style={AUTH_STYLE_FEHLER} role="alert">
                        <div><strong>{fehler}</strong></div>
                        {verbleibend > 0 && (
                            <div style={{fontSize:'0.85rem', marginTop:4}}>
                                {t('pin.versuche', { n: verbleibend })}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={pin.length < 4 || laedt}
                    style={Object.assign({}, AUTH_STYLE_BTN_PRIMARY, (pin.length < 4 || laedt) ? {
                        opacity:0.5, cursor:'not-allowed', boxShadow:'none'
                    } : {})}>
                    {t('pin.ok')}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// MAWipeScreen
// ============================================================

function MAWipeScreen({ grund, onNeu }) {
    const lang = useSprache();

    let textKey  = 'wipe.locked.text';
    let titelKey = 'wipe.titel';
    if (grund === 'geloescht') {
        textKey = 'wipe.geloescht.text';
    } else if (grund === 'zu_viele_versuche') {
        textKey  = 'pin.wipe.text';
        titelKey = 'pin.wipe.titel';
    }

    return (
        <div style={AUTH_STYLE_CONTAINER}>
            <div style={AUTH_STYLE_CARD}>
                <div style={{fontSize:'3.5rem', lineHeight:1}}>\uD83D\uDD12</div>
                <h1 style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'1.5rem', fontWeight:600,
                    color:'#B71C1C', margin:0
                }}>{t(titelKey)}</h1>
                <p style={{fontSize:'1rem', color:'#444', margin:0, lineHeight:1.5}}>
                    {t(textKey)}
                </p>
                <button
                    type="button"
                    onClick={onNeu}
                    style={Object.assign({}, AUTH_STYLE_BTN_PRIMARY, {marginTop:8})}>
                    {t('wipe.neu')}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// MALadeScreen
// ============================================================

function MALadeScreen() {
    return (
        <div style={AUTH_STYLE_CONTAINER}>
            <div style={Object.assign({}, AUTH_STYLE_CARD, {padding:'40px 22px'})}>
                <div style={{
                    width:64, height:64, margin:'0 auto',
                    border:'4px solid #E3F2FD',
                    borderTopColor:'#1E88E5',
                    borderRadius:'50%',
                    animation:'ma-spin 1s linear infinite'
                }} aria-hidden="true"/>
                <p style={{fontSize:'0.95rem', color:'#666', margin:'8px 0 0'}}>
                    {window.TWMaConfig && window.TWMaConfig.t
                        ? window.TWMaConfig.t('onboard.pruefe')
                        : 'Laedt ...'}
                </p>
            </div>
            <style>{`@keyframes ma-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
