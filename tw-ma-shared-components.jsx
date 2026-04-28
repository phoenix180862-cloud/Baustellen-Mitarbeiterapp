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

// =============================================================
// MABauteamAnimation - 1:1 uebernommen aus Master-App
// (tw-shared-components.jsx der TW Business Suite, Z. 429-1416)
// Master-Dokument Kap. 4.7: "1:1 uebernommen, vertikal hochgesetzt"
// Komponenten-Prefix: MA (Konvention der Baustellen-App)
// Erstellt: 28.04.2026
// =============================================================

function MAFigurIvan() {
    return (
        <div className="tw-figure" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackeIvan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#3498db"/>
                        <stop offset="1" stopColor="#1a5276"/>
                    </linearGradient>
                    <linearGradient id="hoseIvan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmIvan" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#f7dc6f"/>
                        <stop offset="1" stopColor="#b7950b"/>
                    </radialGradient>
                    <radialGradient id="hautIvan" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#dc7633"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hoseIvan)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hoseIvan)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackeIvan)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="78" width="10" height="8" fill="#1a5276" opacity="0.6"/>
                    <rect x="53" y="78" width="10" height="8" fill="#1a5276" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="36" y="61" width="28" height="9" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="68" textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="900" fontFamily="Arial Black, sans-serif">IVAN</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackeIvan)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautIvan)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackeIvan)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautIvan)"/>
                    <g transform="translate(71,100)">
                        <path d="M -8,0 L -6,14 L 6,14 L 8,0 Z" fill="#e67e22" stroke="#a04000" strokeWidth="0.8"/>
                        <ellipse cx="0" cy="0" rx="8" ry="2" fill="#d35400" stroke="#a04000" strokeWidth="0.5"/>
                        <path d="M -8,0 Q 0,-10 8,0" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautIvan)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautIvan)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#8b4513" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmIvan)" stroke="#8b6914" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#f4d03f"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#fef9e7" strokeWidth="1.5" fill="none" opacity="0.7"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 2: MICHAL (gruen) ---- */
function MAFigurMichal() {
    return (
        <div className="tw-figure tw-phase-2" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackeMichal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#27ae60"/>
                        <stop offset="1" stopColor="#145a32"/>
                    </linearGradient>
                    <linearGradient id="hoseMichal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmMichal" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#ff7675"/>
                        <stop offset="1" stopColor="#a93226"/>
                    </radialGradient>
                    <radialGradient id="hautMichal" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#cd853f"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hoseMichal)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hoseMichal)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackeMichal)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="78" width="10" height="8" fill="#145a32" opacity="0.6"/>
                    <rect x="53" y="78" width="10" height="8" fill="#145a32" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="32" y="61" width="36" height="9" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="68" textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="900" fontFamily="Arial Black, sans-serif">MICHAL</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackeMichal)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautMichal)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackeMichal)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautMichal)"/>
                    <g transform="translate(71,100)">
                        <rect x="-3" y="-1" width="20" height="4" fill="#f1c40f" stroke="#b7950b" strokeWidth="0.5"/>
                        <rect x="4" y="0" width="6" height="2.5" fill="#2c3e50"/>
                        <circle cx="7" cy="1.2" r="0.8" fill="#27ae60"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautMichal)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautMichal)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#654321" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmMichal)" stroke="#7b241c" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#ec7063"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#fadbd8" strokeWidth="1.5" fill="none" opacity="0.7"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 3: IURII (signalrot) ---- */
function MAFigurIurii() {
    return (
        <div className="tw-figure tw-phase-3" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackeIurii" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#e74c3c"/>
                        <stop offset="1" stopColor="#922b21"/>
                    </linearGradient>
                    <linearGradient id="hoseIurii" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmIurii" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#ffffff"/>
                        <stop offset="1" stopColor="#bdc3c7"/>
                    </radialGradient>
                    <radialGradient id="hautIurii" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#b9770e"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hoseIurii)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hoseIurii)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackeIurii)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="78" width="10" height="8" fill="#922b21" opacity="0.6"/>
                    <rect x="53" y="78" width="10" height="8" fill="#922b21" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="33" y="85" width="34" height="2" fill="#f1c40f" opacity="0.9"/>
                    <rect x="36" y="61" width="28" height="9" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="68" textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="900" fontFamily="Arial Black, sans-serif">IURII</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackeIurii)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautIurii)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackeIurii)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautIurii)"/>
                    <g transform="translate(71,100)">
                        <rect x="-3" y="-2" width="16" height="8" fill="#2c3e50" stroke="#1a1a1a" strokeWidth="0.5" rx="1"/>
                        <rect x="13" y="0" width="8" height="4" fill="#95a5a6"/>
                        <rect x="21" y="1" width="3" height="2" fill="#7f8c8d"/>
                        <rect x="-3" y="6" width="6" height="4" fill="#1a1a1a"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautIurii)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautIurii)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#654321" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmIurii)" stroke="#7f8c8d" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#ecf0f1"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.9"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 4: PETER (anthrazit/orange) ---- */
function MAFigurPeter() {
    return (
        <div className="tw-figure" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackePeter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#566573"/>
                        <stop offset="1" stopColor="#212f3c"/>
                    </linearGradient>
                    <linearGradient id="hosePeter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmPeter" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#f5b041"/>
                        <stop offset="1" stopColor="#ba4a00"/>
                    </radialGradient>
                    <radialGradient id="hautPeter" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#cd853f"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hosePeter)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hosePeter)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackePeter)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="78" width="10" height="8" fill="#212f3c" opacity="0.6"/>
                    <rect x="53" y="78" width="10" height="8" fill="#212f3c" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="33" y="75" width="34" height="2" fill="#e67e22" opacity="0.95"/>
                    <rect x="33" y="88" width="34" height="2" fill="#e67e22" opacity="0.95"/>
                    <rect x="36" y="61" width="28" height="9" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="68" textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="900" fontFamily="Arial Black, sans-serif">PETER</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackePeter)"/>
                    <rect x="27" y="78" width="9" height="1.5" fill="#e67e22" transform="rotate(82 31 79)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautPeter)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackePeter)"/>
                    <rect x="64" y="78" width="9" height="1.5" fill="#e67e22" transform="rotate(-82 69 79)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautPeter)"/>
                    <g transform="translate(71,100)">
                        <rect x="-5" y="-2" width="16" height="20" fill="#8b4513" stroke="#5d4037" strokeWidth="0.5"/>
                        <rect x="-4" y="0" width="14" height="17" fill="#ffffff"/>
                        <line x1="-2" y1="4" x2="8" y2="4" stroke="#95a5a6" strokeWidth="0.4"/>
                        <line x1="-2" y1="8" x2="8" y2="8" stroke="#95a5a6" strokeWidth="0.4"/>
                        <line x1="-2" y1="12" x2="8" y2="12" stroke="#95a5a6" strokeWidth="0.4"/>
                        <rect x="0" y="-3" width="6" height="2" fill="#c0c0c0"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautPeter)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautPeter)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#654321" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmPeter)" stroke="#873600" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#eb984e"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#fef5e7" strokeWidth="1.5" fill="none" opacity="0.7"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 5: LUCA AM (bordeaux mit AM-Logo) ---- */
function MAFigurLucaAM() {
    return (
        <div className="tw-figure tw-phase-2" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackeLucaAM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#922b21"/>
                        <stop offset="1" stopColor="#4a0e0a"/>
                    </linearGradient>
                    <linearGradient id="hoseLucaAM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmLucaAM" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#5d6d7e"/>
                        <stop offset="1" stopColor="#17202a"/>
                    </radialGradient>
                    <radialGradient id="hautLucaAM" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#b9770e"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hoseLucaAM)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hoseLucaAM)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackeLucaAM)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="82" width="10" height="7" fill="#4a0e0a" opacity="0.6"/>
                    <rect x="53" y="82" width="10" height="7" fill="#4a0e0a" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="32" y="58" width="36" height="13" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.5"/>
                    <text x="50" y="66" textAnchor="middle" fill="#922b21" fontSize="8" fontWeight="900" fontFamily="Arial Black, sans-serif">AM</text>
                    <text x="50" y="70.5" textAnchor="middle" fill="#1a1a1a" fontSize="4" fontWeight="bold" fontFamily="Arial, sans-serif">s.r.o.</text>
                    <rect x="36" y="72" width="28" height="8" fill="#f1c40f" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="78.5" textAnchor="middle" fill="#1a1a1a" fontSize="6.5" fontWeight="900" fontFamily="Arial Black, sans-serif">LUCA</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackeLucaAM)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautLucaAM)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackeLucaAM)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautLucaAM)"/>
                    <g transform="translate(71,100)">
                        <rect x="-10" y="-2" width="20" height="14" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="0.5"/>
                        <rect x="-10" y="-2" width="20" height="3" fill="#ecf0f1"/>
                        <rect x="-9" y="2" width="18" height="1" fill="#85929e"/>
                        <rect x="-9" y="6" width="18" height="1" fill="#85929e"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautLucaAM)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautLucaAM)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#654321" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmLucaAM)" stroke="#0b0b0b" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#34495e"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#95a5a6" strokeWidth="1.5" fill="none" opacity="0.6"/>
                    <text x="50" y="31" textAnchor="middle" fill="#f1c40f" fontSize="4" fontWeight="900" fontFamily="Arial Black, sans-serif">AM</text>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 6: LUCA (oliv-braun) ---- */
function MAFigurLuca2() {
    return (
        <div className="tw-figure" style={{position:'relative', width:'100px', height:'180px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 100 180" width="100" height="180">
                <defs>
                    <linearGradient id="jackeLuca2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#7d6608"/>
                        <stop offset="1" stopColor="#3d3004"/>
                    </linearGradient>
                    <linearGradient id="hoseLuca2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmLuca2" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#5dade2"/>
                        <stop offset="1" stopColor="#1b4f72"/>
                    </radialGradient>
                    <radialGradient id="hautLuca2" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fdebd0"/>
                        <stop offset="1" stopColor="#ca6f1e"/>
                    </radialGradient>
                </defs>
                <g className="tw-leg-l">
                    <path d="M 42,100 Q 40,130 38,160 L 46,160 Q 48,130 48,100 Z" fill="url(#hoseLuca2)"/>
                    <ellipse cx="42" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 52,100 Q 54,130 56,160 L 64,160 Q 62,130 58,100 Z" fill="url(#hoseLuca2)"/>
                    <ellipse cx="58" cy="162" rx="8" ry="4" fill="#1a1a1a"/>
                </g>
                <g>
                    <path d="M 35,55 Q 32,70 33,100 L 67,100 Q 68,70 65,55 Z" fill="url(#jackeLuca2)"/>
                    <line x1="50" y1="58" x2="50" y2="95" stroke="#5d4037" strokeWidth="0.8"/>
                    <rect x="33" y="92" width="34" height="5" fill="#5d4037"/>
                    <rect x="48" y="91" width="4" height="7" fill="#c0c0c0"/>
                    <rect x="37" y="78" width="10" height="8" fill="#3d3004" opacity="0.6"/>
                    <rect x="53" y="78" width="10" height="8" fill="#3d3004" opacity="0.6"/>
                    <rect x="38" y="99" width="3" height="10" fill="#2c3e50"/>
                    <rect x="36" y="107" width="7" height="3" fill="#7f8c8d"/>
                    <rect x="36" y="61" width="28" height="9" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="50" y="68" textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="900" fontFamily="Arial Black, sans-serif">LUCA</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 33,58 Q 28,75 26,95 L 32,96 Q 35,75 38,58 Z" fill="url(#jackeLuca2)"/>
                    <circle cx="29" cy="96" r="5" fill="url(#hautLuca2)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 67,58 Q 72,75 74,95 L 68,96 Q 65,75 62,58 Z" fill="url(#jackeLuca2)"/>
                    <circle cx="71" cy="96" r="5" fill="url(#hautLuca2)"/>
                    <g transform="translate(71,100)">
                        <path d="M -8,0 L -6,14 L 6,14 L 8,0 Z" fill="#34495e" stroke="#1a1a1a" strokeWidth="0.8"/>
                        <ellipse cx="0" cy="0" rx="8" ry="2" fill="#7f8c8d"/>
                        <ellipse cx="0" cy="0" rx="6.5" ry="1.2" fill="#bdc3c7"/>
                        <path d="M -8,0 Q 0,-10 8,0" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
                    </g>
                </g>
                <g>
                    <rect x="45" y="50" width="10" height="8" fill="url(#hautLuca2)"/>
                    <ellipse cx="50" cy="42" rx="12" ry="14" fill="url(#hautLuca2)"/>
                    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#654321" opacity="0.3"/>
                    <circle cx="46" cy="40" r="1" fill="#1a1a1a"/>
                    <circle cx="54" cy="40" r="1" fill="#1a1a1a"/>
                    <path d="M 44,37 Q 46,36 48,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 52,37 Q 54,36 56,37" stroke="#3e2723" strokeWidth="1" fill="none"/>
                    <path d="M 50,42 L 48,46 L 51,46" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                    <path d="M 47,50 Q 50,51 53,50" fill="none" stroke="#6e2c00" strokeWidth="0.8"/>
                    <path d="M 38,34 Q 50,22 62,34 L 62,36 L 38,36 Z" fill="url(#helmLuca2)" stroke="#154360" strokeWidth="0.5"/>
                    <ellipse cx="50" cy="33" rx="12" ry="3" fill="#2e86c1"/>
                    <path d="M 42,30 Q 45,26 50,25" stroke="#d6eaf8" strokeWidth="1.5" fill="none" opacity="0.8"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 7: SILKE (BIG BOSS, Frau, pink) ---- */
function MAFigurSilke() {
    return (
        <div className="tw-figure tw-figure-silke tw-phase-2" style={{position:'relative', width:'90px', height:'170px'}}>
            <div className="tw-shadow"></div>
            <svg viewBox="0 0 90 170" width="90" height="170">
                <defs>
                    <linearGradient id="jackeSilke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#e91e63"/>
                        <stop offset="1" stopColor="#880e4f"/>
                    </linearGradient>
                    <linearGradient id="hoseSilke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#34495e"/>
                        <stop offset="1" stopColor="#1a252f"/>
                    </linearGradient>
                    <radialGradient id="helmSilke" cx="0.3" cy="0.3">
                        <stop offset="0" stopColor="#f8bbd0"/>
                        <stop offset="1" stopColor="#c2185b"/>
                    </radialGradient>
                    <radialGradient id="hautSilke" cx="0.4" cy="0.4">
                        <stop offset="0" stopColor="#fff3e0"/>
                        <stop offset="1" stopColor="#e0a971"/>
                    </radialGradient>
                    <linearGradient id="haareSilke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#d4a017"/>
                        <stop offset="0.5" stopColor="#b7950b"/>
                        <stop offset="1" stopColor="#7d6608"/>
                    </linearGradient>
                    <linearGradient id="schaerpeSilke" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#f1c40f"/>
                        <stop offset="0.5" stopColor="#f39c12"/>
                        <stop offset="1" stopColor="#b7950b"/>
                    </linearGradient>
                </defs>
                {/* SILKE-MAKEOVER 26.04.2026:
                    - Pferdeschwanz (frueherer langer Haar-Path entlang der Beine) entfernt
                    - Statur korpulenter: Jacke breiter (29..61 statt 31..59),
                      Hose ebenfalls breiter, Beine an verbreiterte Hueftpartie angepasst
                    - Frisur: kompakter Bob-Cut (Helm umrahmend, kurz auf Kragenhoehe) */}
                <g className="tw-leg-l">
                    <path d="M 36,98 Q 35,130 34,155 L 42,155 Q 43,130 44,98 Z" fill="url(#hoseSilke)"/>
                    <ellipse cx="38" cy="157" rx="7" ry="3.5" fill="#1a1a1a"/>
                </g>
                <g className="tw-leg-r">
                    <path d="M 46,98 Q 47,130 48,155 L 56,155 Q 55,130 54,98 Z" fill="url(#hoseSilke)"/>
                    <ellipse cx="52" cy="157" rx="7" ry="3.5" fill="#1a1a1a"/>
                </g>
                <g>
                    {/* Korpulentere Jacke: 29..61 mit ausgepraegterer Bauchpartie */}
                    <path d="M 29,55 Q 26,68 27,82 Q 25,92 28,99 L 62,99 Q 65,92 63,82 Q 64,68 61,55 Z" fill="url(#jackeSilke)"/>
                    <line x1="45" y1="58" x2="45" y2="97" stroke="#5d4037" strokeWidth="0.6"/>
                    <rect x="28" y="93" width="34" height="4.5" fill="#5d4037"/>
                    <rect x="43" y="92" width="4" height="6.5" fill="#f1c40f"/>
                    <g>
                        <path d="M 25,56 L 33,55 L 65,96 L 60,101 Z" fill="url(#schaerpeSilke)" stroke="#7d6608" strokeWidth="0.5"/>
                        <path d="M 25,56 L 33,55" stroke="#ffd700" strokeWidth="1"/>
                        <text x="45" y="74" textAnchor="middle" fill="#4a0e0a" fontSize="7" fontWeight="900" fontFamily="Arial Black, sans-serif" transform="rotate(52 45 74)">BIG BOSS</text>
                        <circle cx="60" cy="101" r="2.5" fill="#f1c40f" stroke="#7d6608" strokeWidth="0.3"/>
                        <line x1="60" y1="103" x2="59" y2="107" stroke="#b7950b" strokeWidth="0.5"/>
                        <line x1="61" y1="103" x2="61" y2="107" stroke="#b7950b" strokeWidth="0.5"/>
                        <line x1="62" y1="103" x2="63" y2="107" stroke="#b7950b" strokeWidth="0.5"/>
                    </g>
                    <rect x="28" y="84" width="34" height="8" fill="#ffffff" opacity="0.95" stroke="#1a1a1a" strokeWidth="0.3"/>
                    <text x="45" y="90.5" textAnchor="middle" fill="#1a1a1a" fontSize="6.5" fontWeight="900" fontFamily="Arial Black, sans-serif">SILKE</text>
                </g>
                <g className="tw-arm-l">
                    <path d="M 28,58 Q 23,73 21,92 L 27,93 Q 30,73 32,58 Z" fill="url(#jackeSilke)"/>
                    <circle cx="24" cy="93" r="4.5" fill="url(#hautSilke)"/>
                </g>
                <g className="tw-arm-r">
                    <path d="M 62,58 Q 67,73 69,92 L 63,93 Q 60,73 58,58 Z" fill="url(#jackeSilke)"/>
                    <circle cx="66" cy="93" r="4.5" fill="url(#hautSilke)"/>
                    <g transform="translate(66,97)">
                        <rect x="-6" y="-3" width="16" height="20" fill="#8b4513" stroke="#5d4037" strokeWidth="0.5"/>
                        <rect x="-5" y="-1" width="14" height="17" fill="#ffffff"/>
                        <line x1="-3" y1="3" x2="7" y2="3" stroke="#95a5a6" strokeWidth="0.4"/>
                        <line x1="-3" y1="7" x2="7" y2="7" stroke="#95a5a6" strokeWidth="0.4"/>
                        <line x1="-3" y1="11" x2="7" y2="11" stroke="#95a5a6" strokeWidth="0.4"/>
                        <rect x="-1" y="-4" width="6" height="2" fill="#c0c0c0"/>
                        <rect x="-3" y="12" width="12" height="4.5" fill="none" stroke="#c0392b" strokeWidth="0.7"/>
                        <text x="3" y="15.5" textAnchor="middle" fill="#c0392b" fontSize="3.5" fontWeight="900" fontFamily="Arial Black, sans-serif">BOSS</text>
                    </g>
                </g>
                {/* SCHWEIF ENTFERNT: Frueherer langer Pferdeschwanz wurde geloescht.
                    An seine Stelle tritt unten ein kompakter Bob-Cut, der den Helm umrahmt. */}
                <g>
                    <rect x="41" y="48" width="8" height="7" fill="url(#hautSilke)"/>
                    <ellipse cx="45" cy="40" rx="10" ry="12" fill="url(#hautSilke)"/>
                    {/* Bob-Cut: kurze Haarpartie links + rechts neben dem Gesicht, endet auf Kragen-Hoehe */}
                    <path d="M 33,33 Q 30,42 32,52 Q 33,55 36,55 L 38,55 Q 36,46 38,36 Z" fill="url(#haareSilke)" stroke="#7d6608" strokeWidth="0.3"/>
                    <path d="M 57,33 Q 60,42 58,52 Q 57,55 54,55 L 52,55 Q 54,46 52,36 Z" fill="url(#haareSilke)" stroke="#7d6608" strokeWidth="0.3"/>
                    {/* Stirnpony unter dem Helm */}
                    <path d="M 37,34 Q 45,30 53,34 L 53,37 L 37,37 Z" fill="url(#haareSilke)"/>
                    <circle cx="38" cy="42" r="2.5" fill="#e91e63" opacity="0.25"/>
                    <circle cx="52" cy="42" r="2.5" fill="#e91e63" opacity="0.25"/>
                    <ellipse cx="41" cy="39" rx="1.2" ry="1.4" fill="#1a1a1a"/>
                    <ellipse cx="49" cy="39" rx="1.2" ry="1.4" fill="#1a1a1a"/>
                    <circle cx="41.3" cy="38.5" r="0.4" fill="#ffffff"/>
                    <circle cx="49.3" cy="38.5" r="0.4" fill="#ffffff"/>
                    <line x1="40" y1="37.8" x2="39" y2="36.5" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <line x1="41" y1="37.5" x2="41" y2="36.2" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <line x1="42" y1="37.8" x2="43" y2="36.5" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <line x1="48" y1="37.8" x2="47" y2="36.5" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <line x1="49" y1="37.5" x2="49" y2="36.2" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <line x1="50" y1="37.8" x2="51" y2="36.5" stroke="#1a1a1a" strokeWidth="0.4"/>
                    <path d="M 39,36 Q 41,35.3 43,36" stroke="#7d6608" strokeWidth="0.8" fill="none"/>
                    <path d="M 47,36 Q 49,35.3 51,36" stroke="#7d6608" strokeWidth="0.8" fill="none"/>
                    <path d="M 45,40 L 44,44 L 46,44" fill="none" stroke="#d4a470" strokeWidth="0.5"/>
                    <path d="M 42,48 Q 45,49.5 48,48 Q 45,50 42,48 Z" fill="#c0392b"/>
                    <path d="M 42,48 Q 45,47 48,48" stroke="#922b21" strokeWidth="0.3" fill="none"/>
                    <path d="M 34,32 Q 45,20 56,32 L 56,34 L 34,34 Z" fill="url(#helmSilke)" stroke="#880e4f" strokeWidth="0.5"/>
                    <ellipse cx="45" cy="31" rx="11" ry="2.5" fill="#ec407a"/>
                    <path d="M 37,28 Q 41,24 45,23" stroke="#fce4ec" strokeWidth="1.5" fill="none" opacity="0.8"/>
                    <circle cx="35.5" cy="43" r="0.8" fill="#f1c40f"/>
                    <circle cx="54.5" cy="43" r="0.8" fill="#f1c40f"/>
                </g>
            </svg>
        </div>
    );
}

/* ---- Figur 8: THOMAS — Chef im roten PKW (26.04.2026) ----
   Die Boss-Figur faehrt zwischen den Bauteam-Gruppen mit. Statt zu laufen
   rollt Thomas in einem roten PKW (oben rausguckend) ueber den Bildschirm.
   Eine Sprechblase ueber dem Auto blendet rhythmisch ein/aus. */
function MAFigurThomas() {
    // Wichtig: KEIN tw-figure / tw-leg / tw-arm — Thomas faehrt, er laeuft nicht.
    // Eigene Klasse tw-pkw bekommt im Animation-CSS ein anderes Bewegungsprofil.
    return (
        <div className="tw-pkw-wrap" style={{position:'relative', width:'150px', height:'170px'}}>
            {/* Sprechblase ueber dem Auto — pulsiert via twSpeechBubble */}
            <div className="tw-speech-bubble" style={{
                position:'absolute', top:'2px', left:'45px',
                background:'#ffffff',
                border:'2px solid #1a1a1a',
                borderRadius:'14px',
                padding:'5px 10px',
                fontSize:'11px',
                fontWeight:'900',
                color:'#c0392b',
                fontFamily:'Oswald, Arial Black, sans-serif',
                whiteSpace:'nowrap',
                boxShadow:'2px 2px 6px rgba(0,0,0,0.35)',
                textTransform:'uppercase',
                letterSpacing:'0.5px'
            }}>
                Yallah, Yallah!
                {/* Sprechblasen-Schwanz nach unten */}
                <div style={{
                    position:'absolute', bottom:'-8px', left:'18px',
                    width:0, height:0,
                    borderLeft:'7px solid transparent',
                    borderRight:'7px solid transparent',
                    borderTop:'8px solid #1a1a1a'
                }} />
                <div style={{
                    position:'absolute', bottom:'-5px', left:'19px',
                    width:0, height:0,
                    borderLeft:'6px solid transparent',
                    borderRight:'6px solid transparent',
                    borderTop:'7px solid #ffffff'
                }} />
            </div>

            <div className="tw-pkw" style={{position:'absolute', bottom:'0', left:'0'}}>
                <svg viewBox="0 0 150 130" width="150" height="130">
                    <defs>
                        <linearGradient id="pkwBody" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#e74c3c"/>
                            <stop offset="0.5" stopColor="#c0392b"/>
                            <stop offset="1" stopColor="#7b241c"/>
                        </linearGradient>
                        <linearGradient id="pkwDach" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#a93226"/>
                            <stop offset="1" stopColor="#641e16"/>
                        </linearGradient>
                        <radialGradient id="pkwScheibe" cx="0.3" cy="0.3">
                            <stop offset="0" stopColor="#aed6f1"/>
                            <stop offset="1" stopColor="#5dade2"/>
                        </radialGradient>
                        <radialGradient id="hautThomas" cx="0.4" cy="0.4">
                            <stop offset="0" stopColor="#fdebd0"/>
                            <stop offset="1" stopColor="#dc7633"/>
                        </radialGradient>
                        <radialGradient id="helmThomas" cx="0.3" cy="0.3">
                            <stop offset="0" stopColor="#ffffff"/>
                            <stop offset="1" stopColor="#bdc3c7"/>
                        </radialGradient>
                        <radialGradient id="reifenGrad" cx="0.5" cy="0.5">
                            <stop offset="0" stopColor="#34495e"/>
                            <stop offset="0.7" stopColor="#1a1a1a"/>
                            <stop offset="1" stopColor="#000000"/>
                        </radialGradient>
                    </defs>

                    {/* Schatten unter dem Auto */}
                    <ellipse cx="75" cy="120" rx="60" ry="5" fill="rgba(0,0,0,0.45)" opacity="0.6"/>

                    {/* PKW-Karosserie unten (Body) */}
                    <path d="M 12,95 Q 14,80 22,75 L 50,72 Q 60,55 75,53 L 105,55 Q 118,72 128,80 L 138,82 Q 142,85 142,95 L 142,108 Q 142,112 138,112 L 14,112 Q 10,112 10,108 Z" fill="url(#pkwBody)" stroke="#641e16" strokeWidth="1"/>

                    {/* Dach (Ueber-Karosserie-Linie) */}
                    <path d="M 50,72 Q 60,55 75,53 L 105,55 Q 118,72 118,72" fill="url(#pkwDach)" stroke="#641e16" strokeWidth="0.8"/>

                    {/* Frontscheibe (Fahrerseite) */}
                    <path d="M 53,72 Q 62,60 75,58 L 90,58 L 100,72 Z" fill="url(#pkwScheibe)" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.85"/>
                    {/* Heckscheibe / hinten */}
                    <path d="M 100,72 L 90,58 L 105,60 Q 113,68 116,72 Z" fill="url(#pkwScheibe)" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.7"/>
                    {/* Glanzlicht auf der Scheibe */}
                    <path d="M 60,68 L 68,62" stroke="#ffffff" strokeWidth="1.3" opacity="0.85"/>

                    {/* THOMAS guckt aus dem Cabrio/Schiebedach raus —
                        Kopf+Schultern oberhalb der Scheibe sichtbar */}
                    <g>
                        {/* Schultern in dezentem Boss-Anzug */}
                        <path d="M 62,68 Q 68,62 75,61 L 90,62 Q 95,66 96,72 L 62,72 Z" fill="#2c3e50" stroke="#1a1a1a" strokeWidth="0.4"/>
                        {/* Roter Krawatten-Stub */}
                        <path d="M 77,66 L 80,72 L 79,68 L 81,72 L 80,66 Z" fill="#c0392b"/>
                        {/* Hals */}
                        <rect x="76" y="55" width="6" height="6" fill="url(#hautThomas)"/>
                        {/* Kopf */}
                        <ellipse cx="79" cy="48" rx="9" ry="11" fill="url(#hautThomas)"/>
                        {/* Augen */}
                        <circle cx="76" cy="46" r="0.9" fill="#1a1a1a"/>
                        <circle cx="82" cy="46" r="0.9" fill="#1a1a1a"/>
                        {/* Augenbrauen — entschlossen */}
                        <path d="M 74,43 Q 76,42 78,43" stroke="#3e2723" strokeWidth="0.9" fill="none"/>
                        <path d="M 80,43 Q 82,42 84,43" stroke="#3e2723" strokeWidth="0.9" fill="none"/>
                        {/* Nase */}
                        <path d="M 79,47 L 78,50 L 80,50" fill="none" stroke="#a04000" strokeWidth="0.6"/>
                        {/* Mund — laechelt */}
                        <path d="M 76,53 Q 79,55 82,53" fill="none" stroke="#7b241c" strokeWidth="0.9"/>
                        {/* Weisser Boss-Helm */}
                        <path d="M 70,40 Q 79,30 88,40 L 88,42 L 70,42 Z" fill="url(#helmThomas)" stroke="#7f8c8d" strokeWidth="0.5"/>
                        <ellipse cx="79" cy="39" rx="9" ry="2.5" fill="#ecf0f1"/>
                        {/* Helm-Glanz */}
                        <path d="M 73,36 Q 76,32 79,31" stroke="#ffffff" strokeWidth="1.3" fill="none" opacity="0.85"/>
                        {/* Boss-Schild auf Helm */}
                        <rect x="74" y="36" width="10" height="3" fill="#c0392b" stroke="#7b241c" strokeWidth="0.3"/>
                        <text x="79" y="38.5" textAnchor="middle" fill="#ffffff" fontSize="2.3" fontWeight="900" fontFamily="Arial Black, sans-serif">CHEF</text>
                        {/* Brust-Namensschild entfernt -- THOMAS prangt jetzt gross auf der Karosserie */}
                    </g>

                    {/* Tuergriffe + Seitenlinie */}
                    <line x1="20" y1="92" x2="135" y2="92" stroke="#641e16" strokeWidth="0.6"/>
                    <rect x="42" y="86" width="6" height="2" rx="1" fill="#1a1a1a"/>
                    <rect x="108" y="86" width="6" height="2" rx="1" fill="#1a1a1a"/>

                    {/* Scheinwerfer vorne */}
                    <ellipse cx="135" cy="98" rx="4" ry="3" fill="#f9e79f" stroke="#b7950b" strokeWidth="0.5"/>
                    <ellipse cx="135" cy="98" rx="2" ry="1.5" fill="#fffacd"/>
                    {/* Rueckleuchten hinten */}
                    <ellipse cx="15" cy="98" rx="3" ry="2.5" fill="#922b21" stroke="#641e16" strokeWidth="0.5"/>

                    {/* Stossstange */}
                    <rect x="10" y="105" width="132" height="4" rx="2" fill="#7f8c8d" stroke="#34495e" strokeWidth="0.4"/>

                    {/* === BOSS-ACCESSOIRE auf der Motorhaube (Cartoon, Lego-Stil) === */}
                    {/* 26.04.2026 v3: Deutlich groesser. Beschriftung "KALASCHNIKOW"
                        jetzt direkt auf dem Korpus statt auf separatem Plaettchen.
                        Liegt vorne ueber der Motorhaube (rechts vor der Frontscheibe),
                        kollidiert NICHT mit dem THOMAS-Schriftzug auf der Karosserie. */}
                    <g transform="translate(75, 60)">
                        {/* Halterungs-Riemen unter dem Element (laenger + dicker) */}
                        <rect x="-3" y="14" width="62" height="3" rx="1.2" fill="#3e2723" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <line x1="6" y1="13" x2="6" y2="20" stroke="#1a1a1a" strokeWidth="0.9"/>
                        <line x1="50" y1="13" x2="50" y2="20" stroke="#1a1a1a" strokeWidth="0.9"/>
                        {/* Holz-Schaft (hinten, abgerundet, deutlich groesser) */}
                        <path d="M -2,7 Q -4,14 2,16 L 14,16 L 14,7 Z" fill="#6e2c00" stroke="#3e2723" strokeWidth="0.5"/>
                        {/* Holzmaserung */}
                        <line x1="2" y1="9" x2="12" y2="14" stroke="#3e2723" strokeWidth="0.4" opacity="0.6"/>
                        <line x1="3" y1="11" x2="11" y2="15" stroke="#3e2723" strokeWidth="0.3" opacity="0.5"/>
                        {/* Korpus / Mittelteil — gross genug fuer Aufdruck */}
                        <rect x="14" y="6" width="32" height="10" fill="#2c3e50" stroke="#1a1a1a" strokeWidth="0.5"/>
                        <rect x="15" y="7" width="30" height="2" fill="#34495e"/>
                        {/* KALASCHNIKOW direkt auf den Korpus aufgedruckt */}
                        <text x="30" y="13.5" textAnchor="middle" fill="#f1c40f" fontSize="4" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="0.2">KALASCHNIKOW</text>
                        {/* Charakteristisches gebogenes Magazin nach unten (groesser) */}
                        <path d="M 20,16 Q 19,24 24,28 L 32,28 Q 34,22 32,16 Z" fill="#34495e" stroke="#1a1a1a" strokeWidth="0.5"/>
                        <line x1="22" y1="18" x2="32" y2="18" stroke="#1a1a1a" strokeWidth="0.3" opacity="0.7"/>
                        <line x1="22" y1="21" x2="32" y2="21" stroke="#1a1a1a" strokeWidth="0.3" opacity="0.7"/>
                        <line x1="23" y1="24" x2="31" y2="24" stroke="#1a1a1a" strokeWidth="0.3" opacity="0.7"/>
                        <line x1="24" y1="27" x2="30" y2="27" stroke="#1a1a1a" strokeWidth="0.3" opacity="0.7"/>
                        {/* Lauf (vorne, deutlich laenger) */}
                        <rect x="46" y="9" width="20" height="3" fill="#1a1a1a" stroke="#000000" strokeWidth="0.4"/>
                        {/* Muendungsfeuerschutz */}
                        <rect x="64" y="8" width="3" height="5" fill="#000000" stroke="#1a1a1a" strokeWidth="0.3"/>
                        {/* Gasrohr oberhalb des Laufs */}
                        <rect x="46" y="6.5" width="14" height="2" fill="#1a1a1a" stroke="#000000" strokeWidth="0.3"/>
                        {/* Visier-Kimme oben */}
                        <rect x="22" y="3" width="3" height="3" fill="#1a1a1a"/>
                        {/* Korn vorne */}
                        <rect x="58" y="4.5" width="2" height="2.5" fill="#1a1a1a"/>
                        {/* Pistolengriff hinten unten */}
                        <path d="M 14,16 L 17,22 L 20,22 L 20,16 Z" fill="#3e2723" stroke="#1a1a1a" strokeWidth="0.4"/>
                        {/* Abzug + Abzugsbuegel */}
                        <path d="M 19,16 Q 19,20 23,20 L 23,18 Q 21,18 21,16 Z" fill="none" stroke="#1a1a1a" strokeWidth="0.5"/>
                    </g>

                    {/* Reifen — drehen sich via tw-pkw-wheel */}
                    <g className="tw-pkw-wheel" style={{transformOrigin:'35px 112px'}}>
                        <circle cx="35" cy="112" r="11" fill="url(#reifenGrad)" stroke="#000000" strokeWidth="0.8"/>
                        <circle cx="35" cy="112" r="5" fill="#7f8c8d" stroke="#34495e" strokeWidth="0.5"/>
                        <line x1="35" y1="106" x2="35" y2="118" stroke="#1a1a1a" strokeWidth="0.6"/>
                        <line x1="29" y1="112" x2="41" y2="112" stroke="#1a1a1a" strokeWidth="0.6"/>
                    </g>
                    <g className="tw-pkw-wheel" style={{transformOrigin:'115px 112px'}}>
                        <circle cx="115" cy="112" r="11" fill="url(#reifenGrad)" stroke="#000000" strokeWidth="0.8"/>
                        <circle cx="115" cy="112" r="5" fill="#7f8c8d" stroke="#34495e" strokeWidth="0.5"/>
                        <line x1="115" y1="106" x2="115" y2="118" stroke="#1a1a1a" strokeWidth="0.6"/>
                        <line x1="109" y1="112" x2="121" y2="112" stroke="#1a1a1a" strokeWidth="0.6"/>
                    </g>

                    {/* GROSSER THOMAS-Schriftzug auf der Karosserie-Tuer.
                        26.04.2026 v2: Schild verbreitert auf 88px, Schrift auf 14px erhoeht,
                        Letter-Spacing reduziert damit alle 6 Buchstaben klar ausgeschrieben sind
                        ("T" und "S" wurden vorher abgeschnitten). Mittig zentriert ueber die
                        gesamte Karosseriebreite zwischen den Reifen. */}
                    <rect x="15" y="89" width="88" height="15" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.7" rx="2"/>
                    <text x="59" y="100.5" textAnchor="middle" fill="#c0392b" fontSize="14" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="0.5">THOMAS</text>

                    {/* TW-Logo-Sticker zusaetzlich auf der vorderen Tuer (rechts vom THOMAS-Schriftzug) */}
                    <rect x="118" y="94" width="20" height="9" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.4" rx="1"/>
                    <text x="128" y="101" textAnchor="middle" fill="#c0392b" fontSize="6" fontWeight="900" fontFamily="Arial Black, sans-serif">TW</text>
                </svg>
            </div>
        </div>
    );
}

/* ---- HAUPT-KOMPONENTE: BauteamAnimation mit 3 Gruppen ---- */
function MABauteamAnimation() {
    // Gesamtzyklus 45s, je 15s pro Gruppe
    // Jede Gruppe laeuft von links (-400px) nach rechts (100%) in 15s,
    // dann 30s unsichtbar (waehrend andere Gruppen laufen)
    // HOEHE: 210px statt 200px, bottom:20px statt 72px
    //        → Figuren laufen weiter unten, Koepfe liegen frei ueber dem Sync-Button.
    //        CSS-Klassen tw-fig-1..tw-fig-9 geben jeder Figur individuelle
    //        Bewegungs-Geschwindigkeit und Phase (unterschiedliche Schrittlaenge).
    return (
        <div style={{position:'relative', height:'210px', marginTop:'auto', width:'100%', overflow:'hidden', pointerEvents:'none'}}>
            {/* Fliesenstreifen als Boden */}
            <div style={{position:'absolute', bottom:'20px', left:0, right:0, height:'2px',
                         background:'linear-gradient(90deg, transparent 3%, rgba(149,165,166,0.4) 15%, rgba(149,165,166,0.5) 50%, rgba(149,165,166,0.4) 85%, transparent 97%)'}} />

            {/* Gruppe 1: Ivan, Michal, THOMAS (PKW), Iurii */}
            <div className="tw-group tw-group-1" style={{position:'absolute', bottom:'20px', display:'flex', gap:'22px', alignItems:'flex-end'}}>
                <div className="tw-fig-wrap tw-fig-1"><MAFigurIvan /></div>
                <div className="tw-fig-wrap tw-fig-2"><MAFigurMichal /></div>
                <div className="tw-fig-wrap tw-fig-thomas tw-fig-thomas-1"><MAFigurThomas /></div>
                <div className="tw-fig-wrap tw-fig-3"><MAFigurIurii /></div>
            </div>

            {/* Gruppe 2: Peter, THOMAS (PKW), Luca (AM s.r.o.) */}
            <div className="tw-group tw-group-2" style={{position:'absolute', bottom:'20px', display:'flex', gap:'22px', alignItems:'flex-end'}}>
                <div className="tw-fig-wrap tw-fig-4"><MAFigurPeter /></div>
                <div className="tw-fig-wrap tw-fig-thomas tw-fig-thomas-2"><MAFigurThomas /></div>
                <div className="tw-fig-wrap tw-fig-5"><MAFigurLucaAM /></div>
            </div>

            {/* Gruppe 3: Luca, THOMAS (PKW), Silke (BIG BOSS) */}
            <div className="tw-group tw-group-3" style={{position:'absolute', bottom:'20px', display:'flex', gap:'22px', alignItems:'flex-end'}}>
                <div className="tw-fig-wrap tw-fig-6"><MAFigurLuca2 /></div>
                <div className="tw-fig-wrap tw-fig-thomas tw-fig-thomas-3"><MAFigurThomas /></div>
                <div className="tw-fig-wrap tw-fig-7"><MAFigurSilke /></div>
            </div>

            {/* CSS-Animationen fuer Gruppenwechsel und Gehzyklus */}
            <style dangerouslySetInnerHTML={{__html: `
.tw-figure { animation: twBodyBob 0.5s ease-in-out infinite; }
@keyframes twBodyBob {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-3px); }
    50% { transform: translateY(-1px); }
    75% { transform: translateY(-3px); }
}
.tw-leg-l { animation: twLegLeft 1s ease-in-out infinite; transform-origin: top center; }
.tw-leg-r { animation: twLegRight 1s ease-in-out infinite; transform-origin: top center; }
.tw-arm-l { animation: twArmLeft 1s ease-in-out infinite; transform-origin: top center; }
.tw-arm-r { animation: twArmRight 1s ease-in-out infinite; transform-origin: top center; }
@keyframes twLegLeft {
    0%,100% { transform: rotate(25deg); }
    25%     { transform: rotate(0deg); }
    50%     { transform: rotate(-25deg); }
    75%     { transform: rotate(0deg); }
}
@keyframes twLegRight {
    0%,100% { transform: rotate(-25deg); }
    25%     { transform: rotate(0deg); }
    50%     { transform: rotate(25deg); }
    75%     { transform: rotate(0deg); }
}
@keyframes twArmLeft {
    0%,100% { transform: rotate(-20deg); }
    50%     { transform: rotate(20deg); }
}
@keyframes twArmRight {
    0%,100% { transform: rotate(20deg); }
    50%     { transform: rotate(-20deg); }
}
.tw-phase-2 { animation-delay: -0.25s; }
.tw-phase-3 { animation-delay: -0.5s; }
.tw-phase-2.tw-leg-l, .tw-phase-2 .tw-leg-l, .tw-phase-2 .tw-leg-r, .tw-phase-2 .tw-arm-l, .tw-phase-2 .tw-arm-r { animation-delay: -0.25s; }
.tw-phase-3 .tw-leg-l, .tw-phase-3 .tw-leg-r, .tw-phase-3 .tw-arm-l, .tw-phase-3 .tw-arm-r { animation-delay: -0.5s; }
.tw-shadow {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 14px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%);
    filter: blur(3px);
}

/* ─── Individuelle Geh-Charakteristik pro Figur ───
   Jede Figur bekommt eine andere Geschwindigkeit und Phase,
   sodass sie NICHT im Gleichschritt laufen. Das wird erreicht,
   indem wir die Animationen in den Kind-Elementen der Figur
   auf anderen Speed/Delay-Werten laufen lassen. */
.tw-fig-wrap { display: inline-block; }

/* Ivan — schneller, forsch */
.tw-fig-1 .tw-leg-l, .tw-fig-1 .tw-leg-r,
.tw-fig-1 .tw-arm-l, .tw-fig-1 .tw-arm-r { animation-duration: 0.85s; }
.tw-fig-1 .tw-figure { animation-duration: 0.425s; }

/* Michal — gemaechlich, breitbeinig */
.tw-fig-2 .tw-leg-l, .tw-fig-2 .tw-leg-r,
.tw-fig-2 .tw-arm-l, .tw-fig-2 .tw-arm-r { animation-duration: 1.15s; animation-delay: -0.3s; }
.tw-fig-2 .tw-figure { animation-duration: 0.575s; animation-delay: -0.15s; }

/* Iurii — schlurfender Gang, langsamer Oberkoerper */
.tw-fig-3 .tw-leg-l, .tw-fig-3 .tw-leg-r,
.tw-fig-3 .tw-arm-l, .tw-fig-3 .tw-arm-r { animation-duration: 1.25s; animation-delay: -0.6s; }
.tw-fig-3 .tw-figure { animation-duration: 0.75s; animation-delay: -0.3s; }

/* Peter — zuegig, rhythmisch */
.tw-fig-4 .tw-leg-l, .tw-fig-4 .tw-leg-r,
.tw-fig-4 .tw-arm-l, .tw-fig-4 .tw-arm-r { animation-duration: 0.95s; animation-delay: -0.1s; }
.tw-fig-4 .tw-figure { animation-duration: 0.475s; }

/* Luca (AM) — locker, entspannt */
.tw-fig-5 .tw-leg-l, .tw-fig-5 .tw-leg-r,
.tw-fig-5 .tw-arm-l, .tw-fig-5 .tw-arm-r { animation-duration: 1.05s; animation-delay: -0.4s; }
.tw-fig-5 .tw-figure { animation-duration: 0.525s; animation-delay: -0.2s; }

/* Luca 2 — sehr flott */
.tw-fig-6 .tw-leg-l, .tw-fig-6 .tw-leg-r,
.tw-fig-6 .tw-arm-l, .tw-fig-6 .tw-arm-r { animation-duration: 0.8s; animation-delay: -0.2s; }
.tw-fig-6 .tw-figure { animation-duration: 0.4s; }

/* Silke — elegant, ruhig */
.tw-fig-7 .tw-leg-l, .tw-fig-7 .tw-leg-r,
.tw-fig-7 .tw-arm-l, .tw-fig-7 .tw-arm-r { animation-duration: 1.1s; animation-delay: -0.5s; }
.tw-fig-7 .tw-figure { animation-duration: 0.55s; animation-delay: -0.25s; }

/* ─────────────────────────────────────────────────────────────
   THOMAS-PKW (26.04.2026): Eigene Bewegungs-Charakteristik —
   kein twBodyBob (Laufzyklus), sondern sanftes "Federn" wie ein
   rollendes Auto. Reifen drehen sich. Sprechblase pulsiert.
   ───────────────────────────────────────────────────────────── */
.tw-pkw {
    animation: twPkwBounce 1.4s ease-in-out infinite;
    transform-origin: center bottom;
}
@keyframes twPkwBounce {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25%      { transform: translateY(-1.5px) rotate(-0.4deg); }
    50%      { transform: translateY(0) rotate(0deg); }
    75%      { transform: translateY(-1px) rotate(0.4deg); }
}
.tw-pkw-wheel {
    animation: twWheelSpin 0.6s linear infinite;
}
@keyframes twWheelSpin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
/* Sprechblase blendet rhythmisch ein/aus —
   3.6s Zyklus: 0.0-0.4 Erscheinen, 0.4-2.4 sichtbar, 2.4-2.8 Ausblenden, 2.8-3.6 unsichtbar */
.tw-speech-bubble {
    animation: twSpeechBubble 3.6s ease-in-out infinite;
    transform-origin: bottom left;
}
@keyframes twSpeechBubble {
    0%   { opacity: 0; transform: scale(0.6) translateY(6px); }
    11%  { opacity: 1; transform: scale(1) translateY(0); }
    66%  { opacity: 1; transform: scale(1) translateY(0); }
    78%  { opacity: 0; transform: scale(0.6) translateY(6px); }
    100% { opacity: 0; transform: scale(0.6) translateY(6px); }
}
/* Pro-Gruppe-Phasenversatz, damit Thomas in jeder Gruppe leicht anders schwingt */
.tw-fig-thomas-1 .tw-pkw { animation-duration: 1.4s; animation-delay: -0.2s; }
.tw-fig-thomas-2 .tw-pkw { animation-duration: 1.55s; animation-delay: -0.6s; }
.tw-fig-thomas-3 .tw-pkw { animation-duration: 1.3s; animation-delay: -0.4s; }
.tw-fig-thomas-1 .tw-speech-bubble { animation-delay: 0s; }
.tw-fig-thomas-2 .tw-speech-bubble { animation-delay: -1.2s; }
.tw-fig-thomas-3 .tw-speech-bubble { animation-delay: -2.4s; }

.tw-group {
    left: -400px;
    opacity: 0;
    animation: twGroupWalk 45s linear infinite;
}
.tw-group-1 { animation-delay: 0s; }
.tw-group-2 { animation-delay: 15s; }
.tw-group-3 { animation-delay: 30s; }
@keyframes twGroupWalk {
    0%    { left: -400px; opacity: 1; }
    33.3% { left: 100%; opacity: 1; }
    33.4% { left: 100%; opacity: 0; }
    100%  { left: 100%; opacity: 0; }
}
`}} />
        </div>
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
