// ============================================================
// TW Baustellen-App - Shared Components
// ============================================================
// Enthaelt wiederverwendbare Komponenten:
// - MAFirmenLogo (Schablone analog Master-App)
// - MABauteamAnimation (3 Fliesenleger-Silhouetten, laufend)
// - MAUhrBlock (Premium-Uhr mit Tag/Datum/Zeit)
// - MASprachPill (kompakter Sprach-Waehler)
// - MASprachModal (Modal zum Sprach-Wechsel)
// - MAStatusIndikator (online/offline, letzter Sync, neue Nachrichten)
// - MAMicButton (Stub fuer Etappe 7)
// - MAPlatzhalterView (fuer leere Module in Etappe 1)
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// Helper-Hook: auf Sprach-Aenderungen lauschen
// ============================================================

function useSprache() {
    const [lang, setLang] = useState(window.TWMaConfig.getCurrentLanguage());
    useEffect(function(){
        function handler(e){ setLang(e.detail.code); }
        window.addEventListener('tw-ma-lang-changed', handler);
        return function(){ window.removeEventListener('tw-ma-lang-changed', handler); };
    }, []);
    return lang;
}

// Kurzform fuer Uebersetzungs-Funktion
const t = function(key, repl){ return window.TWMaConfig.t(key, repl); };

// ============================================================
// MAFirmenLogo - Schablone
// ============================================================
// Inspiriert vom Master-App FirmenLogo, eigenstaendige Implementation.
// size: 'small' | 'medium' | 'large'
// ============================================================

function MAFirmenLogo({ size }) {
    const sizeMap = {
        small:  { w: 60,  h: 60,  font: 14 },
        medium: { w: 90,  h: 90,  font: 20 },
        large:  { w: 140, h: 140, font: 30 }
    };
    const s = sizeMap[size] || sizeMap.medium;

    return (
        <div style={{
            width: s.w, height: s.h,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E88E5, #1565C0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(30,136,229,0.35), inset 0 2px 4px rgba(255,255,255,0.25)',
            border: '3px solid rgba(255,255,255,0.6)',
            flexShrink: 0
        }}>
            <div style={{
                color: '#fff',
                fontFamily: 'var(--font-headline)',
                fontSize: s.font,
                fontWeight: 500,
                letterSpacing: '2px',
                textShadow: '0 2px 4px rgba(0,0,0,0.25)'
            }}>TW</div>
        </div>
    );
}

// ============================================================
// MABauteamAnimation - drei Fliesenleger laufen ueber die Baustelle
// ============================================================
// Nutzt SVG und CSS-Animationen. Responsiv.
// ============================================================

function MABauteamAnimation() {
    return (
        <div style={{
            width: '100%',
            maxWidth: 520,
            margin: '0 auto',
            position: 'relative',
            aspectRatio: '5 / 2',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(to bottom, #87CEEB 0%, #B3D9E8 60%, #D4B896 60%, #C19A6B 100%)',
            boxShadow: 'var(--shadow-md)'
        }}>
            {/* Sonne */}
            <div style={{
                position: 'absolute', top: '15%', right: '12%',
                width: 40, height: 40, borderRadius: '50%',
                background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 0 30px rgba(255,200,0,0.6)'
            }}/>

            {/* Gerueste und Baustellen-Silhouette im Hintergrund */}
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{
                position:'absolute', inset:0, width:'100%', height:'100%'
            }}>
                {/* Haus links */}
                <rect x="20"  y="80"  width="90" height="80" fill="#D9C9A8"/>
                <polygon points="10,80 65,40 120,80" fill="#8B5A2B"/>
                <rect x="55" y="110" width="20" height="50" fill="#6B4226"/>

                {/* Haus rechts */}
                <rect x="380" y="60"  width="100" height="100" fill="#E5D4B1"/>
                <polygon points="370,60 430,20 490,60" fill="#8B5A2B"/>
                <rect x="405" y="100" width="24" height="60" fill="#6B4226"/>

                {/* Gerueste */}
                <g stroke="#444" strokeWidth="2" fill="none" opacity="0.7">
                    <line x1="20"  y1="160" x2="20"  y2="60"/>
                    <line x1="110" y1="160" x2="110" y2="60"/>
                    <line x1="20"  y1="90"  x2="110" y2="90"/>
                    <line x1="20"  y1="130" x2="110" y2="130"/>
                </g>
            </svg>

            {/* 3 Bauarbeiter - mit Laufanimation (unterschiedliche Geschwindigkeiten) */}
            {[0, 1, 2].map(function(i){
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: '5%',
                        left: (15 + i * 30) + '%',
                        animation: 'ma-walk '+(1.8 + i*0.3)+'s ease-in-out infinite alternate'
                    }}>
                        <MAFliesenleger farbe={['#1E88E5','#E53935','#43A047'][i]}/>
                    </div>
                );
            })}
        </div>
    );
}

// Sub-Komponente: einzelner Fliesenleger (SVG)
function MAFliesenleger({ farbe }) {
    return (
        <svg width="42" height="60" viewBox="0 0 42 60" style={{animation:'ma-bounce 0.6s ease-in-out infinite'}}>
            {/* Bauhelm */}
            <ellipse cx="21" cy="14" rx="11" ry="7" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
            <rect x="10" y="13" width="22" height="2" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5"/>
            {/* Kopf */}
            <circle cx="21" cy="18" r="5" fill="#F4C78A"/>
            {/* Koerper / Weste */}
            <rect x="14" y="23" width="14" height="20" fill={farbe} stroke="#000" strokeOpacity="0.3"/>
            {/* Reflektor-Streifen */}
            <rect x="14" y="28" width="14" height="2" fill="#FFEB3B" opacity="0.8"/>
            <rect x="14" y="36" width="14" height="2" fill="#FFEB3B" opacity="0.8"/>
            {/* Arme */}
            <rect x="11" y="24" width="3" height="14" fill={farbe}/>
            <rect x="28" y="24" width="3" height="14" fill={farbe}/>
            {/* Beine */}
            <rect x="15" y="43" width="5" height="14" fill="#2C3E50"/>
            <rect x="22" y="43" width="5" height="14" fill="#2C3E50"/>
            {/* Stiefel */}
            <rect x="14" y="56" width="7" height="3" fill="#000"/>
            <rect x="21" y="56" width="7" height="3" fill="#000"/>
        </svg>
    );
}

// ============================================================
// MAUhrBlock - Premium-Uhr-Block
// ============================================================

function MAUhrBlock() {
    const [now, setNow] = useState(new Date());
    const lang = useSprache();

    useEffect(function(){
        const iv = setInterval(function(){ setNow(new Date()); }, 1000);
        return function(){ clearInterval(iv); };
    }, []);

    const wochentagKeys = ['tag.sonntag','tag.montag','tag.dienstag','tag.mittwoch','tag.donnerstag','tag.freitag','tag.samstag'];
    const wochentag = t(wochentagKeys[now.getDay()]).toUpperCase();
    const monat     = t('monat.'+(now.getMonth()+1));
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const colonOn = now.getSeconds() % 2 === 0;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(13, 71, 161, 0.35)',
            margin: '0 auto',
            maxWidth: 520
        }}>
            {/* Glanz-Lichter */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0%, transparent 60%)',
                pointerEvents: 'none'
            }}/>
            <div style={{
                position: 'absolute', right: -40, top: -40,
                width: 150, height: 150, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}/>

            <div style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.1rem',
                letterSpacing: '4px',
                opacity: 0.9,
                position: 'relative'
            }}>{wochentag}</div>

            <div style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(3rem, 12vw, 4.5rem)',
                fontWeight: 300,
                lineHeight: 1,
                margin: '8px 0',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                {hh}
                <span style={{opacity: colonOn ? 1 : 0.3, transition:'opacity 0.25s'}}>:</span>
                {mm}
                <span style={{opacity: colonOn ? 1 : 0.3, fontSize:'0.55em', marginLeft:8, verticalAlign:'top'}}>{ss}</span>
            </div>

            <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                letterSpacing: '1.5px',
                opacity: 0.92,
                position: 'relative'
            }}>{now.getDate()}. {monat} {now.getFullYear()}</div>
        </div>
    );
}

// ============================================================
// MASprachPill - kompakter Sprach-Waehler
// ============================================================

function MASprachPill({ onClick }) {
    const lang = useSprache();
    const info = window.TWMaConfig.getLanguageInfo(lang);
    if (!info) return null;
    return (
        <button
            onClick={onClick}
            style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'#fff',
                border:'1.5px solid var(--border-medium)',
                padding:'10px 20px',
                borderRadius:'var(--radius-pill)',
                boxShadow:'var(--shadow-sm)',
                fontFamily:'var(--font-body)',
                fontSize:'1rem',
                color:'var(--text-primary)',
                minHeight:'var(--touch-target-min)',
                transition:'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseDown={function(e){ e.currentTarget.style.transform='scale(0.97)'; }}
            onMouseUp={function(e){ e.currentTarget.style.transform='scale(1)'; }}
            onMouseLeave={function(e){ e.currentTarget.style.transform='scale(1)'; }}
            aria-label={t('start.sprache')+': '+info.nativeName}
        >
            <span style={{fontSize:'1.3rem'}}>{info.flag}</span>
            <span style={{fontWeight:600}}>{info.nativeName}</span>
            <span style={{marginLeft:4, color:'var(--text-muted)'}}>\u25BE</span>
        </button>
    );
}

// ============================================================
// MASprachModal - Sprach-Auswahl als Modal
// ============================================================

function MASprachModal({ offen, onClose }) {
    const currentLang = useSprache();
    if (!offen) return null;
    const langs = window.TWMaConfig.SUPPORTED_LANGUAGES;

    function waehle(code) {
        window.TWMaConfig.setCurrentLanguage(code);
        onClose();
    }

    return (
        <div
            onClick={onClose}
            style={{
                position:'fixed', inset:0,
                background:'var(--bg-overlay)',
                zIndex:1000,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:16,
                animation:'ma-fadeIn 0.2s ease-out'
            }}>
            <div
                onClick={function(e){ e.stopPropagation(); }}
                style={{
                    background:'#fff',
                    borderRadius:'var(--radius-lg)',
                    padding:'24px 20px',
                    maxWidth:420, width:'100%',
                    boxShadow:'var(--shadow-lg)',
                    animation:'ma-fadeIn 0.25s ease-out'
                }}>
                <h2 style={{
                    fontFamily:'var(--font-headline)',
                    fontSize:'1.5rem',
                    textAlign:'center',
                    margin:'0 0 20px 0'
                }}>{t('lang.titel')}</h2>

                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {langs.map(function(l){
                        const aktiv = (l.code === currentLang);
                        return (
                            <button
                                key={l.code}
                                onClick={function(){ waehle(l.code); }}
                                style={{
                                    display:'flex', alignItems:'center', gap:14,
                                    padding:'14px 18px',
                                    border: aktiv ? '2px solid var(--accent-blue)' : '2px solid var(--border-light)',
                                    borderRadius:'var(--radius-md)',
                                    background: aktiv ? 'rgba(30,136,229,0.08)' : '#fff',
                                    fontSize:'1.05rem',
                                    fontWeight: aktiv ? 700 : 500,
                                    color:'var(--text-primary)',
                                    textAlign:'left',
                                    minHeight:'var(--touch-target-min)',
                                    cursor:'pointer'
                                }}>
                                <span style={{fontSize:'1.8rem'}}>{l.flag}</span>
                                <span style={{flex:1}}>{l.nativeName}</span>
                                {aktiv && <span style={{color:'var(--accent-blue)', fontSize:'1.4rem'}}>\u2713</span>}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop:20, width:'100%',
                        padding:'12px',
                        background:'var(--bg-tertiary)',
                        color:'var(--text-primary)',
                        borderRadius:'var(--radius-md)',
                        fontSize:'1rem',
                        fontWeight:600,
                        minHeight:'var(--touch-target-min)',
                        cursor:'pointer'
                    }}>
                    {t('lang.abbrechen')}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// MAStatusIndikator - kleine Leiste mit Online/Sync/Nachrichten
// ============================================================

function MAStatusIndikator({ onNachrichtenClick }) {
    const lang = useSprache();
    const [online, setOnline] = useState(navigator.onLine);
    const [letzterSync, setLetzterSync] = useState(null); /* spaeter: Date-Objekt */
    const [neueNachrichten] = useState(0); /* spaeter: aus Firebase */

    useEffect(function(){
        const unsub = window.TWMaCore.registriereOnlineOfflineHandler(
            function(){ setOnline(true); },
            function(){ setOnline(false); }
        );
        return unsub;
    }, []);

    function formatLetzterSync() {
        if (!letzterSync) return '--';
        const diffMin = Math.round((Date.now() - letzterSync) / 60000);
        return t('start.status.sync')+': '+t('start.status.vorMin', {n: diffMin});
    }

    return (
        <div style={{
            display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', alignItems:'center',
            padding:'10px 16px',
            background:'rgba(255,255,255,0.7)',
            borderRadius:'var(--radius-pill)',
            fontSize:'0.88rem',
            color:'var(--text-secondary)',
            maxWidth:520, margin:'0 auto',
            boxShadow:'var(--shadow-sm)',
            border:'1px solid var(--border-light)'
        }}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5, color: online ? 'var(--accent-green)' : 'var(--accent-red)'}}>
                <span style={{
                    width:8, height:8, borderRadius:'50%',
                    background: online ? 'var(--accent-green)' : 'var(--accent-red)',
                    animation: online ? 'ma-pulse 2s infinite' : 'none'
                }}/>
                {online ? t('start.status.online') : t('start.status.offline')}
            </span>
            <span style={{color:'var(--border-medium)'}}>\u00B7</span>
            <span>{formatLetzterSync()}</span>
            {neueNachrichten > 0 && (
                <React.Fragment>
                    <span style={{color:'var(--border-medium)'}}>\u00B7</span>
                    <button
                        onClick={onNachrichtenClick}
                        style={{
                            display:'inline-flex', alignItems:'center', gap:5,
                            color:'var(--accent-orange)',
                            fontWeight:700,
                            cursor:'pointer',
                            background:'none', border:'none', padding:0
                        }}>
                        \uD83D\uDD14 {t('start.status.neueNachrichten', {n: neueNachrichten})}
                    </button>
                </React.Fragment>
            )}
        </div>
    );
}

// ============================================================
// MAMicButton - Stub fuer Spracheingabe (Etappe 7)
// ============================================================

function MAMicButton({ onText, disabled }) {
    return (
        <button
            disabled={disabled}
            onClick={function(){ alert('Spracheingabe: wird in Etappe 7 aktiviert.'); }}
            style={{
                width: 44, height: 44,
                borderRadius:'50%',
                background: disabled ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
                color:'#fff',
                fontSize:'1.2rem',
                boxShadow:'var(--shadow-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1
            }}
            aria-label="Spracheingabe">
            \uD83C\uDFA4
        </button>
    );
}

// ============================================================
// MAPlatzhalterView - generischer Platzhalter fuer leere Module
// ============================================================

function MAPlatzhalterView({ titelKey, zurueckCallback }) {
    const lang = useSprache();
    return (
        <div style={{
            padding:'40px 20px',
            textAlign:'center',
            maxWidth:520, margin:'0 auto'
        }}>
            <div style={{
                fontSize:'4rem',
                marginBottom:16,
                opacity:0.5
            }}>\uD83D\uDEA7</div>

            <h2 style={{
                fontFamily:'var(--font-headline)',
                fontSize:'1.6rem',
                marginBottom:12
            }}>{t(titelKey)}</h2>

            <p style={{
                color:'var(--text-secondary)',
                marginBottom:24,
                fontSize:'1rem',
                lineHeight:1.5
            }}>{t('platzhalter.hinweis')}</p>

            <button
                onClick={zurueckCallback}
                style={{
                    padding:'12px 28px',
                    background:'linear-gradient(135deg, #1E88E5, #1565C0)',
                    color:'#fff',
                    borderRadius:'var(--radius-md)',
                    fontSize:'1rem',
                    fontWeight:600,
                    boxShadow:'var(--shadow-blue)',
                    cursor:'pointer',
                    fontFamily:'var(--font-headline)',
                    letterSpacing:'0.5px',
                    textTransform:'uppercase',
                    minHeight:'var(--touch-target-min)'
                }}>
                {t('platzhalter.zurueck')}
            </button>
        </div>
    );
}


// ============================================================
// MA-Icons als kompakte SVGs (inline, damit keine Netz-Abhaengigkeit)
// ============================================================

function MAIcon({ name, size }) {
    const s = size || 24;
    const stroke = '#fff';
    const strokeWidth = 2;
    const props = {
        width: s, height: s, viewBox: '0 0 24 24',
        fill: 'none', stroke: stroke, strokeWidth: strokeWidth,
        strokeLinecap: 'round', strokeLinejoin: 'round'
    };

    switch (name) {
        case 'haus':
            return (
                <svg {...props}>
                    <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/>
                </svg>
            );
        case 'helm':
            return (
                <svg {...props}>
                    <path d="M3 16h18"/>
                    <path d="M5 16v-1a7 7 0 0 1 14 0v1"/>
                    <path d="M12 8V4"/>
                    <path d="M3 16h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
                </svg>
            );
        case 'kalender':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="8" y1="3" x2="8" y2="7"/>
                    <line x1="16" y1="3" x2="16" y2="7"/>
                </svg>
            );
        case 'kamera':
            return (
                <svg {...props}>
                    <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
            );
        case 'uhr':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
            );
        case 'sprechblase':
            return (
                <svg {...props}>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>
                </svg>
            );
        case 'arrow-left':
            return (
                <svg {...props}>
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
            );
        case 'arrow-right':
            return (
                <svg {...props}>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            );
        case 'ordner':
            return (
                <svg {...props}>
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
            );
        case 'datei':
            return (
                <svg {...props}>
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="14 3 14 9 20 9"/>
                </svg>
            );
        case 'pdf':
            return (
                <svg {...props}>
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="14 3 14 9 20 9"/>
                    <text x="12" y="17" fontSize="5" fill={stroke} stroke="none" textAnchor="middle" fontWeight="bold">PDF</text>
                </svg>
            );
        case 'bild':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <circle cx="9" cy="10" r="1.5"/>
                    <polyline points="3 17 9 12 14 16 21 10"/>
                </svg>
            );
        case 'download':
            return (
                <svg {...props}>
                    <path d="M12 3v12"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <path d="M5 21h14"/>
                </svg>
            );
        case 'x-close':
            return (
                <svg {...props}>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
            );
        case 'aktualisieren':
            return (
                <svg {...props}>
                    <polyline points="21 3 21 9 15 9"/>
                    <polyline points="3 21 3 15 9 15"/>
                    <path d="M3.5 9a9 9 0 0 1 15-3.5L21 9"/>
                    <path d="M20.5 15a9 9 0 0 1-15 3.5L3 15"/>
                </svg>
            );
        case 'telefon':
            return (
                <svg {...props}>
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>
                </svg>
            );
        case 'mail':
            return (
                <svg {...props}>
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <polyline points="3 7 12 13 21 7"/>
                </svg>
            );
        case 'info':
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="9"/>
                    <line x1="12" y1="8" x2="12" y2="8"/>
                    <line x1="12" y1="12" x2="12" y2="16"/>
                </svg>
            );
        default:
            return <svg {...props}><circle cx="12" cy="12" r="8"/></svg>;
    }
}
