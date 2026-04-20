// ============================================================
// TW Baustellen-App - Startseite
// ============================================================
// Visuelle Komposition der Startseite gemaess Master-Dokument
// Kapitel 4 (Startseite). Reihenfolge:
//   1. Header-Block (Logo + Adresse + Untertitel "BAUSTELLEN APP")
//   2. Uhr-Block (Premium-Look)
//   3. Sprach-Auswahl-Pill
//   4. BauteamAnimation (hochgesetzt, ohne Scrollen sichtbar)
//   5. Status-Indikator (online / letzter Sync / neue Nachrichten)
//   6. Version im Footer (klein)
// ============================================================

function MAStartseite({ wechseleZuTab }) {
    const lang = useSprache();
    const [sprachModalOffen, setSprachModalOffen] = useState(false);

    return (
        <div style={{
            padding:'16px 16px 40px 16px',
            display:'flex',
            flexDirection:'column',
            gap:20,
            maxWidth:620,
            margin:'0 auto',
            width:'100%',
            animation:'ma-fadeIn 0.35s ease-out'
        }}>
            {/* === 1. Header-Block === */}
            <div style={{
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:10,
                padding:'12px 8px 4px 8px'
            }}>
                <MAFirmenLogo size="large"/>

                <div style={{
                    fontFamily:'var(--font-body)',
                    fontSize:'0.95rem',
                    color:'var(--text-secondary)',
                    textAlign:'center',
                    marginTop:6
                }}>
                    {window.TWMaConfig.FIRMEN_DATEN.adresse}
                </div>

                <div style={{
                    marginTop:4,
                    fontSize:'0.85rem',
                    fontWeight:700,
                    color:'var(--accent-blue)',
                    letterSpacing:'3px',
                    textTransform:'uppercase',
                    fontFamily:'var(--font-headline)'
                }}>
                    {t('start.untertitel')}
                </div>
            </div>

            {/* === 2. Uhr-Block === */}
            <MAUhrBlock/>

            {/* === 3. Sprach-Auswahl === */}
            <div style={{textAlign:'center'}}>
                <MASprachPill onClick={function(){ setSprachModalOffen(true); }}/>
            </div>

            {/* === 4. BauteamAnimation (hochgesetzt) === */}
            <MABauteamAnimation/>

            {/* === 5. Zwei Ordner-Kacheln (Etappe 4a - 2-Ordner-Modell) === */}
            <MAOrdnerKacheln wechseleZuTab={wechseleZuTab}/>

            {/* === 6. Status-Indikator === */}
            <MAStatusIndikator
                onNachrichtenClick={function(){ wechseleZuTab('nachrichten'); }}
            />

            {/* === 7. Versions-Footer === */}
            <div style={{
                textAlign:'center',
                fontSize:'0.75rem',
                color:'var(--text-muted)',
                marginTop:8,
                opacity:0.7
            }}>
                v{window.TWMaConfig.APP_VERSION}
            </div>

            {/* Sprach-Modal */}
            <MASprachModal
                offen={sprachModalOffen}
                onClose={function(){ setSprachModalOffen(false); }}
            />
        </div>
    );
}

// ============================================================
// MAOrdnerKacheln - die zwei grossen Ordner-Kacheln
// (Etappe 4a: 2-Ordner-Modell lt. Skill 4.1)
// ============================================================

function MAOrdnerKacheln({ wechseleZuTab }) {
    const lang = useSprache();
    return (
        <div style={{
            display:'flex',
            flexDirection:'column',
            gap:14,
            margin:'8px 0 4px 0'
        }}>
            <MAOrdnerKachel
                icon="helm"
                farbe="#1E88E5"
                titel={t('home.ordner.baustellen.titel')}
                text={t('home.ordner.baustellen.text')}
                onClick={function(){ wechseleZuTab('baustellen'); }}
            />
            <MAOrdnerKachel
                icon="sprechblase"
                farbe="#43A047"
                titel={t('home.ordner.nachrichten.titel')}
                text={t('home.ordner.nachrichten.text')}
                onClick={function(){ wechseleZuTab('nachrichten'); }}
            />
        </div>
    );
}

function MAOrdnerKachel({ icon, farbe, titel, text, onClick }) {
    const [pressed, setPressed] = useState(false);
    return (
        <button
            onClick={onClick}
            onPointerDown={function(){ setPressed(true); }}
            onPointerUp={function(){ setPressed(false); }}
            onPointerLeave={function(){ setPressed(false); }}
            style={{
                display:'flex',
                alignItems:'center',
                gap:16,
                padding:'18px 20px',
                background:'#fff',
                border:'1px solid #E0E0E0',
                borderLeftWidth:6,
                borderLeftStyle:'solid',
                borderLeftColor:farbe,
                borderRadius:'var(--radius-lg, 14px)',
                boxShadow: pressed
                    ? '0 2px 8px rgba(0,0,0,0.08)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                cursor:'pointer',
                transform: pressed ? 'translateY(1px)' : 'translateY(0)',
                transition:'all 0.12s ease-out',
                width:'100%',
                minHeight:72,
                textAlign:'left'
            }}>
            <div style={{
                width:52, height:52, borderRadius:'50%',
                background:'linear-gradient(135deg, '+farbe+'18, '+farbe+'32)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0
            }}>
                <div style={{color:farbe}}>
                    <MAIcon name={icon} size={28}/>
                </div>
            </div>
            <div style={{flex:1, minWidth:0}}>
                <div style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'1.15rem',
                    fontWeight:600,
                    color:'var(--text-primary, #212121)',
                    marginBottom:2
                }}>
                    {titel}
                </div>
                <div style={{
                    fontSize:'0.85rem',
                    color:'var(--text-secondary, #666)',
                    lineHeight:1.3
                }}>
                    {text}
                </div>
            </div>
            <div style={{
                color:'var(--text-secondary, #999)',
                fontSize:'1.4rem',
                flexShrink:0
            }}>
                \u203A
            </div>
        </button>
    );
}
