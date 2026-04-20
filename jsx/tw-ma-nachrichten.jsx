// ============================================================
// TW Baustellen-App - Modul: Nachrichten (Etappe 4a)
// ============================================================
// Container-Komponente fuer den Nachrichten-Bereich.
//
// Interne Navigation:
//   kacheln  - 2 Sub-Kacheln (Kalender, Chat)
//   kalender - 3-Jahres-Kalender + Tages-Modal (Etappe 5)
//   chat     - 1:1-Chat mit Buero (Etappe 5)
//
// Etappe 4a (jetzt): nur kacheln + Stubs. Volle Kalender/Chat in Etappe 5.
// ============================================================

function MANachrichtenModul({ wechseleZuTab }) {
    const lang = useSprache();
    const [view, setView] = useState('kacheln');

    function zurueckZuStart()   { wechseleZuTab('start'); }
    function zurueckZuKacheln() { setView('kacheln'); }

    if (view === 'kalender') {
        return <MANachrichtenKalenderStub onZurueck={zurueckZuKacheln}/>;
    }
    if (view === 'chat') {
        return <MANachrichtenChatStub onZurueck={zurueckZuKacheln}/>;
    }

    return (
        <div className="ma-nac-container" style={naContainerStyle}>
            <MASubHeader
                titel={t('nachrichten.titel')}
                onZurueck={zurueckZuStart}/>

            <div style={{padding:'16px', maxWidth:620, margin:'0 auto', width:'100%'}}>
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    <MANachrichtenKachel
                        icon="kalender"
                        farbe="#F57C00"
                        titel={t('nachrichten.kalender.titel')}
                        text={t('nachrichten.kalender.text')}
                        onClick={function(){ setView('kalender'); }}
                    />
                    <MANachrichtenKachel
                        icon="sprechblase"
                        farbe="#43A047"
                        titel={t('nachrichten.chat.titel')}
                        text={t('nachrichten.chat.text')}
                        onClick={function(){ setView('chat'); }}
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Sub-Kachel
// ============================================================

function MANachrichtenKachel({ icon, farbe, titel, text, onClick }) {
    const [pressed, setPressed] = useState(false);
    return (
        <button
            onClick={onClick}
            onPointerDown={function(){ setPressed(true); }}
            onPointerUp={function(){ setPressed(false); }}
            onPointerLeave={function(){ setPressed(false); }}
            style={{
                display:'flex', alignItems:'center', gap:16,
                padding:'18px 20px',
                background:'#fff',
                border:'1px solid #E0E0E0',
                borderLeftWidth:6, borderLeftStyle:'solid', borderLeftColor:farbe,
                borderRadius:14,
                boxShadow: pressed
                    ? '0 2px 8px rgba(0,0,0,0.08)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                cursor:'pointer',
                transform: pressed ? 'translateY(1px)' : 'translateY(0)',
                transition:'all 0.12s ease-out',
                minHeight:72,
                textAlign:'left',
                width:'100%'
            }}>
            <div style={{
                width:52, height:52, borderRadius:'50%',
                background:'linear-gradient(135deg, '+farbe+'18, '+farbe+'32)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
                color:farbe
            }}>
                <MAIcon name={icon} size={28}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
                <div style={{
                    fontFamily:'var(--font-headline, Oswald)',
                    fontSize:'1.15rem', fontWeight:600,
                    color:'#212121', marginBottom:2
                }}>
                    {titel}
                </div>
                <div style={{fontSize:'0.85rem', color:'#666', lineHeight:1.3}}>
                    {text}
                </div>
            </div>
            <div style={{color:'#999', fontSize:'1.4rem', flexShrink:0}}>\u203A</div>
        </button>
    );
}

// ============================================================
// Stubs fuer Etappe 5 (Kalender / Chat)
// ============================================================

function MANachrichtenKalenderStub({ onZurueck }) {
    return (
        <div className="ma-nac-container" style={naContainerStyle}>
            <MASubHeader titel={t('nachrichten.kalender.titel')} onZurueck={onZurueck}/>
            <div style={naStubBoxStyle}>
                <div style={{fontSize:'3rem', opacity:0.4, marginBottom:12}}>{'\u{1F4C5}'}</div>
                <h3 style={{fontFamily:'var(--font-headline, Oswald)', color:'#666', margin:'0 0 8px'}}>
                    {t('nachrichten.kalender.titel')}
                </h3>
                <div style={{color:'#888', fontSize:'0.9rem', lineHeight:1.5}}>
                    {t('common.demnaechst')}
                </div>
            </div>
        </div>
    );
}

function MANachrichtenChatStub({ onZurueck }) {
    return (
        <div className="ma-nac-container" style={naContainerStyle}>
            <MASubHeader titel={t('nachrichten.chat.titel')} onZurueck={onZurueck}/>
            <div style={naStubBoxStyle}>
                <div style={{fontSize:'3rem', opacity:0.4, marginBottom:12}}>{'\u{1F4AC}'}</div>
                <h3 style={{fontFamily:'var(--font-headline, Oswald)', color:'#666', margin:'0 0 8px'}}>
                    {t('nachrichten.chat.titel')}
                </h3>
                <div style={{color:'#888', fontSize:'0.9rem', lineHeight:1.5}}>
                    {t('common.demnaechst')}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Shared Styles
// ============================================================

const naContainerStyle = {
    minHeight:      'calc(100vh - var(--header-h, 64px))',
    background:     'var(--bg-secondary, #F4F6F8)',
    display:        'flex', flexDirection:'column',
    animation:      'ma-fadeIn 0.3s ease-out'
};

const naStubBoxStyle = {
    padding:'32px 16px', maxWidth:480,
    margin:'40px auto 0 auto', textAlign:'center'
};
