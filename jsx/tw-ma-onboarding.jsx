// ============================================================
// TW Baustellen-App - Onboarding-Flow (Etappe 3)
// ============================================================
// Komponenten:
//   - MAOnboardingFlow     State-Machine: Willkommen -> Code -> PIN ->
//                          Geraet -> Pruefe -> Wartend
//   - MAOnboardingWartend  Standalone-View: Warte auf Buero-Freigabe
//                          (wird auch von MAApp wiederverwendet, wenn
//                          ein nicht-freigegebenes Onboarding in DB
//                          beim App-Start gefunden wird)
//
// Props:
//   MAOnboardingFlow({ onFertig, onGewipt })
//     onFertig({uid, pinHash, mitarbeiterName, geraetName}) - freigegeben + PIN gesetzt
//     onGewipt() - User komplett geloescht, zuruecksetzen
//
//   MAOnboardingWartend({ uid, mitarbeiterName, onFreigegeben, onGewipt })
//     onFreigegeben() - Buero hat approved=true gesetzt
//     onGewipt()      - User wurde geloescht oder gesperrt
// ============================================================

// ------------------------------------------------------------
// Shared Styles
// ------------------------------------------------------------

const ONB_CONTAINER_STYLE = {
    minHeight:     '100vh',
    background:    'linear-gradient(180deg, #E3F2FD 0%, #F4F6F8 100%)',
    padding:       '20px 16px 40px 16px',
    display:       'flex',
    flexDirection: 'column',
    animation:     'ma-fadeIn 0.45s ease-out'
};

const ONB_CARD_STYLE = {
    maxWidth:      480,
    width:         '100%',
    margin:        '0 auto',
    background:    '#fff',
    borderRadius:  'var(--radius-lg, 16px)',
    padding:       '28px 24px',
    boxShadow:     '0 8px 24px rgba(0,0,0,0.08)'
};

const ONB_INPUT_STYLE = {
    width:         '100%',
    padding:       '14px 16px',
    fontSize:      '1.1rem',
    border:        '2px solid #ccc',
    borderRadius:  'var(--radius-md, 8px)',
    outline:       'none',
    boxSizing:     'border-box',
    fontFamily:    'monospace'
};

const ONB_INPUT_CODE_STYLE = Object.assign({}, ONB_INPUT_STYLE, {
    textAlign:     'center',
    letterSpacing: '0.35em',
    fontSize:      '1.6rem',
    textTransform: 'uppercase'
});

const ONB_BUTTON_STYLE = {
    width:         '100%',
    padding:       '16px',
    fontSize:      '1.05rem',
    fontWeight:    600,
    color:         '#fff',
    background:    'linear-gradient(135deg, #1E88E5, #1565C0)',
    border:        'none',
    borderRadius:  'var(--radius-md, 8px)',
    cursor:        'pointer',
    fontFamily:    'var(--font-headline, Oswald)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    minHeight:     56,
    boxShadow:     '0 6px 20px rgba(30,136,229,0.30)'
};

const ONB_BUTTON_SEK_STYLE = {
    width:         '100%',
    padding:       '12px',
    marginTop:     12,
    fontSize:      '0.95rem',
    color:         '#666',
    background:    'transparent',
    border:        '1px solid #ddd',
    borderRadius:  'var(--radius-md, 8px)',
    cursor:        'pointer',
    minHeight:     44
};

const ONB_FEHLER_STYLE = {
    marginTop:     12,
    padding:       '12px 16px',
    background:    '#FFEBEE',
    border:        '1px solid #EF9A9A',
    borderRadius:  'var(--radius-md, 8px)',
    color:         '#C62828',
    fontSize:      '0.92rem',
    textAlign:     'center'
};

const ONB_SPINNER_STYLE = {
    width:        48,
    height:       48,
    border:       '4px solid #E3F2FD',
    borderTopColor:'#1E88E5',
    borderRadius: '50%',
    margin:       '0 auto',
    animation:    'ma-spin 0.85s linear infinite'
};

// ------------------------------------------------------------
// Fehler-Code-Mapping (Firebase-Exceptions -> UI-Label)
// ------------------------------------------------------------

function onbFehlerLabel(errorCode) {
    switch (errorCode) {
        case 'invitation-not-found':     return t('auth.error.not_found');
        case 'invitation-wrong-pin':     return t('auth.error.wrong_pin');
        case 'invitation-already-used':  return t('auth.error.already_used');
        case 'invitation-revoked':       return t('auth.error.revoked');
        case 'invitation-expired':       return t('auth.error.expired');
        case 'invitation-race-lost':     return t('auth.error.already_used');
        case 'network-error':            return t('auth.error.network');
        default:                         return t('auth.error.generic');
    }
}

// ------------------------------------------------------------
// MAOnboardingFlow (Top-Level State-Machine)
// ------------------------------------------------------------

function MAOnboardingFlow({ onFertig, onGewipt }) {
    const lang = useSprache();

    // 'eingabe' | 'pruefe' | 'wartend' | 'freigegeben'
    const [phase, setPhase] = useState('eingabe');

    const [code, setCode]         = useState('');
    const [pin, setPin]           = useState('');
    const [geraet, setGeraet]     = useState('');
    const [fehler, setFehler]     = useState('');

    // Daten aus Firebase nach Einloesung
    const [uid, setUid]                     = useState('');
    const [mitarbeiterName, setMitarbeiterName] = useState('');
    const [pinHash, setPinHash]             = useState('');

    // ========================================================
    // Schritt 1: Einloesen + Wartend-Screen
    // ========================================================

    function handleAnmelden() {
        setFehler('');

        const normCode = (code || '').toUpperCase().trim();
        if (normCode.length !== 6) {
            setFehler(t('auth.error.not_found'));
            return;
        }
        if (!pin || pin.length < 4) {
            setFehler(t('auth.error.wrong_pin'));
            return;
        }

        setPhase('pruefe');

        window.TWMaFirebase.redeemInvitation(normCode, pin.trim(), (geraet || '').trim())
            .then(function(result){
                // PIN-Hash lokal bilden
                return window.TWMaStorage.pinZuHash(pin, result.uid).then(function(hash){
                    setUid(result.uid);
                    setMitarbeiterName(result.mitarbeiterName);
                    setPinHash(hash);

                    // Onboarding schon jetzt in DB sichern
                    // (onboardingAbgeschlossen=false, weil Buero noch nicht freigegeben hat)
                    return window.TWMaStorage.speicherOnboarding({
                        uid:                     result.uid,
                        pinHash:                 hash,
                        mitarbeiterName:         result.mitarbeiterName,
                        geraetName:              (geraet || '').trim() || navigator.userAgent.substring(0, 80),
                        onboardingAbgeschlossen: false
                    }).then(function(){
                        setPhase('wartend');
                    });
                });
            })
            .catch(function(err){
                const msg = (err && err.message) || '';
                console.warn('[Onboarding] Einloesen fehlgeschlagen:', msg);
                setFehler(onbFehlerLabel(msg));
                setPhase('eingabe');
            });
    }

    // ========================================================
    // Schritt 2: Auf Buero-Freigabe warten
    // ========================================================

    function handleFreigegeben() {
        // Onboarding in DB als abgeschlossen markieren
        window.TWMaStorage.speicherOnboarding({
            uid:                     uid,
            pinHash:                 pinHash,
            mitarbeiterName:         mitarbeiterName,
            geraetName:              (geraet || '').trim() || navigator.userAgent.substring(0, 80),
            onboardingAbgeschlossen: true
        }).then(function(){
            if (typeof onFertig === 'function') {
                onFertig({
                    uid:             uid,
                    pinHash:         pinHash,
                    mitarbeiterName: mitarbeiterName,
                    geraetName:      (geraet || '').trim() || navigator.userAgent.substring(0, 80)
                });
            }
        });
    }

    // ========================================================
    // Render
    // ========================================================

    if (phase === 'wartend') {
        return (
            <MAOnboardingWartend
                uid={uid}
                mitarbeiterName={mitarbeiterName}
                onFreigegeben={handleFreigegeben}
                onGewipt={onGewipt}/>
        );
    }

    return (
        <div style={ONB_CONTAINER_STYLE}>
            <div style={{
                maxWidth:480, width:'100%', margin:'0 auto',
                display:'flex', flexDirection:'column', alignItems:'center'
            }}>
                <MAFirmenLogo size="large"/>
                <div style={{
                    marginTop:8,
                    fontSize:'0.8rem',
                    color:'var(--accent-blue, #1E88E5)',
                    letterSpacing:'3px',
                    textTransform:'uppercase',
                    fontFamily:'var(--font-headline, Oswald)',
                    fontWeight:700
                }}>
                    {t('header.titel')}
                </div>
            </div>

            <div style={{marginTop:24, display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div style={ONB_CARD_STYLE}>
                    {phase === 'pruefe' ? (
                        <React.Fragment>
                            <div style={ONB_SPINNER_STYLE}></div>
                            <h2 style={{
                                margin:'16px 0 8px', textAlign:'center',
                                fontFamily:'var(--font-headline, Oswald)',
                                color:'#0D47A1', fontSize:'1.3rem'
                            }}>
                                {t('auth.onboard.pruefe')}
                            </h2>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <h2 style={{
                                margin:'0 0 12px', textAlign:'center',
                                fontFamily:'var(--font-headline, Oswald)',
                                color:'#0D47A1', fontSize:'1.4rem'
                            }}>
                                {t('auth.onboard.titel')}
                            </h2>
                            <p style={{
                                margin:'0 0 20px', textAlign:'center',
                                color:'#666', lineHeight:1.5, fontSize:'0.95rem'
                            }}>
                                {t('auth.onboard.intro')}
                            </p>

                            <label style={onbLabelStyle}>{t('auth.onboard.code')}</label>
                            <input
                                type="text"
                                inputMode="text"
                                autoCapitalize="characters"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                value={code}
                                onChange={function(e){
                                    const clean = e.target.value.toUpperCase()
                                        .replace(/[^A-HJKMNPQRTUVWXYZ23456789]/g, '')
                                        .substring(0, 6);
                                    setCode(clean);
                                }}
                                placeholder="ABC123"
                                maxLength={6}
                                style={ONB_INPUT_CODE_STYLE}
                            />
                            <div style={onbHintStyle}>{t('auth.onboard.code_hint')}</div>

                            <label style={Object.assign({}, onbLabelStyle, {marginTop:18})}>
                                {t('auth.onboard.pin')}
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={pin}
                                onChange={function(e){
                                    setPin(e.target.value.replace(/\D/g,'').substring(0, 8));
                                }}
                                placeholder="****"
                                maxLength={8}
                                style={Object.assign({}, ONB_INPUT_STYLE, {
                                    letterSpacing:'0.4em', textAlign:'center', fontSize:'1.3rem'
                                })}
                            />
                            <div style={onbHintStyle}>{t('auth.onboard.pin_hint')}</div>

                            <label style={Object.assign({}, onbLabelStyle, {marginTop:18})}>
                                {t('auth.onboard.geraet')}
                            </label>
                            <input
                                type="text"
                                value={geraet}
                                onChange={function(e){ setGeraet(e.target.value); }}
                                placeholder=""
                                style={Object.assign({}, ONB_INPUT_STYLE, {fontFamily:'inherit'})}
                            />
                            <div style={onbHintStyle}>{t('auth.onboard.geraet_hint')}</div>

                            {fehler ? <div style={ONB_FEHLER_STYLE}>{fehler}</div> : null}

                            <button
                                onClick={handleAnmelden}
                                disabled={!code || !pin || code.length !== 6 || pin.length < 4}
                                style={Object.assign({}, ONB_BUTTON_STYLE, {
                                    marginTop: 22,
                                    opacity: (code.length === 6 && pin.length >= 4) ? 1 : 0.5,
                                    cursor: (code.length === 6 && pin.length >= 4) ? 'pointer' : 'not-allowed'
                                })}>
                                {t('auth.onboard.submit')}
                            </button>
                        </React.Fragment>
                    )}
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------
// MAOnboardingWartend (Warte auf Buero-Freigabe)
// ------------------------------------------------------------

function MAOnboardingWartend({ uid, mitarbeiterName, onFreigegeben, onGewipt }) {
    const lang = useSprache();

    useEffect(function(){
        if (!uid || !window.TWMaFirebase || !window.TWMaFirebase.subscribeUserStatus) {
            return undefined;
        }
        const unsub = window.TWMaFirebase.subscribeUserStatus(uid, function(statusObj){
            if (statusObj.status === 'approved') {
                if (typeof onFreigegeben === 'function') onFreigegeben();
            } else if (statusObj.status === 'locked' || statusObj.status === 'geloescht') {
                if (typeof onGewipt === 'function') onGewipt();
            }
        });
        return function(){ if (typeof unsub === 'function') unsub(); };
    }, [uid]);

    return (
        <div style={ONB_CONTAINER_STYLE}>
            <div style={{
                maxWidth:480, width:'100%', margin:'0 auto',
                display:'flex', flexDirection:'column', alignItems:'center'
            }}>
                <MAFirmenLogo size="large"/>
                <div style={{
                    marginTop:8, fontSize:'0.8rem',
                    color:'var(--accent-blue, #1E88E5)',
                    letterSpacing:'3px', textTransform:'uppercase',
                    fontFamily:'var(--font-headline, Oswald)', fontWeight:700
                }}>
                    {t('header.titel')}
                </div>
            </div>

            <div style={{marginTop:24, display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div style={ONB_CARD_STYLE}>
                    <div style={ONB_SPINNER_STYLE}></div>
                    <h2 style={{
                        margin:'20px 0 12px', textAlign:'center',
                        fontFamily:'var(--font-headline, Oswald)',
                        color:'#0D47A1', fontSize:'1.4rem'
                    }}>
                        {t('auth.warte.titel')}
                    </h2>
                    <p style={{
                        margin:'0 0 12px', textAlign:'center',
                        color:'#666', lineHeight:1.5, fontSize:'0.95rem'
                    }}>
                        {t('auth.warte.intro')}
                    </p>
                    <p style={{
                        margin:'0 0 16px', textAlign:'center',
                        color:'#888', lineHeight:1.5, fontSize:'0.85rem'
                    }}>
                        {t('auth.warte.hinweis')}
                    </p>
                    <div style={{
                        background:'#F5F7FA',
                        padding:'12px 16px',
                        borderRadius:8,
                        textAlign:'center',
                        marginTop:12
                    }}>
                        <div style={{fontSize:'0.8rem', color:'#888', marginBottom:4}}>
                            {t('auth.warte.name')}
                        </div>
                        <div style={{fontWeight:600, fontSize:'1.1rem', color:'#222'}}>
                            {mitarbeiterName || '—'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------
// Hilfs-Styles (nicht-exported, nur in diesem File genutzt)
// ------------------------------------------------------------

const onbLabelStyle = {
    display:      'block',
    fontSize:     '0.85rem',
    fontWeight:   600,
    color:        '#444',
    marginBottom: 6,
    fontFamily:   'var(--font-headline, Oswald)',
    textTransform:'uppercase',
    letterSpacing:'0.5px'
};

const onbHintStyle = {
    fontSize:  '0.78rem',
    color:     '#888',
    marginTop: 4
};
