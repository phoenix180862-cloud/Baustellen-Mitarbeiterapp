/* ============================================================
   TW Baustellen-App · Firebase-Service (Etappe 3)
   ============================================================
   Vollausbau: Anonymous Auth + Einladungs-System +
   User-Status-Listener.

   Schema (deckt sich mit Master-App):
   - /invitations/{code}/    offen | eingeloest | widerrufen | abgelaufen
   - /users/{uid}/           role, approved, locked, profile
   - /mitarbeiter/{ma-id}/   (Stammdaten, read-only fuer MA)
   - /kalender/{ma-id}/      (Schicht-/Urlaubs-Eintraege)
   - /chats/{ma-id}/         (Messaging)
   - /aktive_baustellen/     (freigegebene Baustellen)
   - /baustellen_planung/    (Gantt-Zeitraeume)
   ============================================================
*/

(function(global){
    'use strict';

    // ============================================================
    // Interner State
    // ============================================================

    let initialized  = false;
    let firebaseApp  = null;
    let db           = null;
    let auth         = null;
    let currentUid   = null;
    let authPromise  = null;

    // ============================================================
    // Init
    // ============================================================

    function init() {
        if (initialized) return Promise.resolve(firebaseApp);

        if (typeof firebase === 'undefined') {
            console.warn('[TWMaFirebase] Firebase-SDK nicht geladen - Stub-Modus aktiv');
            initialized = true;
            return Promise.resolve(null);
        }

        const cfg = getEffectiveConfig();
        if (!cfg) {
            console.warn('[TWMaFirebase] Firebase-Config unvollstaendig (apiKey/projectId fehlen)');
            return Promise.reject(new Error('Firebase-Config fehlt'));
        }

        try {
            firebaseApp = firebase.initializeApp({
                apiKey:            cfg.apiKey,
                authDomain:        cfg.authDomain        || (cfg.projectId + '.firebaseapp.com'),
                databaseURL:       cfg.databaseURL       || ('https://' + cfg.projectId + '-default-rtdb.europe-west1.firebasedatabase.app'),
                projectId:         cfg.projectId,
                storageBucket:     cfg.storageBucket     || (cfg.projectId + '.appspot.com'),
                messagingSenderId: cfg.messagingSenderId || '',
                appId:             cfg.appId             || ''
            });
            db   = firebase.database();
            auth = firebase.auth();
            initialized = true;
            console.log('[TWMaFirebase] initialisiert:', cfg.projectId);

            // Auth-State-Listener: hebe currentUid fort, wenn sich was aendert
            auth.onAuthStateChanged(function(user){
                currentUid = user ? user.uid : null;
                window.dispatchEvent(new CustomEvent('tw-ma-auth-state-changed', {
                    detail: { uid: currentUid }
                }));
            });

            return Promise.resolve(firebaseApp);
        } catch (err) {
            console.error('[TWMaFirebase] Init-Fehler:', err);
            return Promise.reject(err);
        }
    }

    function ensureInit() {
        if (!initialized) return init();
        return Promise.resolve(firebaseApp);
    }

    function isReady() {
        return initialized && db !== null && auth !== null;
    }

    // isConfigReady: prueft, ob eine sinnvolle Firebase-Config vorliegt
    // (entweder in TWMaConfig.FIREBASE_CONFIG oder im localStorage-Override)
    function isConfigReady() {
        const cfg = getEffectiveConfig();
        return !!(cfg && cfg.apiKey && cfg.projectId);
    }

    function getEffectiveConfig() {
        // 1. Override aus localStorage (von Setup-View geschrieben)
        try {
            const stored = localStorage.getItem('tw-ma-firebase-config');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.apiKey && parsed.projectId) return parsed;
            }
        } catch(e) { /* ignore */ }
        // 2. Eingebaute Config aus tw-ma-config.js
        const cfg = global.TWMaConfig && global.TWMaConfig.FIREBASE_CONFIG;
        if (cfg && cfg.apiKey && cfg.projectId) return cfg;
        return null;
    }

    function saveConfig(cfg) {
        if (!cfg || !cfg.apiKey || !cfg.projectId) {
            return Promise.reject(new Error('Config unvollstaendig'));
        }
        // authDomain, databaseURL, storageBucket automatisch ableiten falls nicht gesetzt
        const complete = {
            apiKey:            cfg.apiKey,
            authDomain:        cfg.authDomain        || (cfg.projectId + '.firebaseapp.com'),
            databaseURL:       cfg.databaseURL       || ('https://' + cfg.projectId + '-default-rtdb.europe-west1.firebasedatabase.app'),
            projectId:         cfg.projectId,
            storageBucket:     cfg.storageBucket     || (cfg.projectId + '.appspot.com'),
            messagingSenderId: cfg.messagingSenderId || '',
            appId:             cfg.appId             || ''
        };
        try {
            localStorage.setItem('tw-ma-firebase-config', JSON.stringify(complete));
            // Reset, damit init() beim naechsten Aufruf die neue Config nutzt
            initialized = false;
            firebaseApp = null;
            db   = null;
            auth = null;
            authPromise = null;
            currentUid = null;
            return Promise.resolve(true);
        } catch(e) {
            return Promise.reject(e);
        }
    }

    // ============================================================
    // Anonymous Sign-In (einmalig pro Geraet, UID persistiert)
    // ============================================================

    function signInAnonymous() {
        if (authPromise) return authPromise;
        authPromise = ensureInit().then(function(){
            if (!auth) throw new Error('Firebase Auth nicht bereit');
            // Falls bereits eingeloggt: UID direkt zurueckgeben
            if (auth.currentUser) {
                currentUid = auth.currentUser.uid;
                return auth.currentUser;
            }
            return auth.signInAnonymously().then(function(cred){
                currentUid = cred.user.uid;
                return cred.user;
            });
        });
        return authPromise;
    }

    function getMeineUid() {
        if (currentUid) return currentUid;
        if (auth && auth.currentUser) return auth.currentUser.uid;
        return null;
    }

    function signOut() {
        authPromise = null;
        currentUid  = null;
        if (auth) return auth.signOut();
        return Promise.resolve();
    }

    // ============================================================
    // Connection-Status
    // ============================================================

    function subscribeConnectionStatus(callback) {
        let unsub = function(){};
        ensureInit().then(function(){
            if (!db) { callback(false); return; }
            const ref = db.ref('.info/connected');
            const handler = function(snap){ callback(snap.val() === true); };
            ref.on('value', handler);
            unsub = function(){ ref.off('value', handler); };
        });
        return function(){ unsub(); };
    }

    // ============================================================
    // Einladungs-API
    // ============================================================

    /**
     * Prueft, ob eine Einladung gueltig ist.
     *
     * Rueckgabe-Format:
     *   { ok: true,  code, mitarbeiter, pinMatches }
     *   { ok: false, fehler: 'nicht_gefunden' | 'bereits_eingeloest' | 'widerrufen'
     *                      | 'abgelaufen'    | 'pin_falsch' | 'firebase_fehler' }
     */
    function validiereEinladung(code, pin) {
        if (!code || !pin) return Promise.resolve({ ok:false, fehler:'pin_falsch' });
        return ensureInit().then(function(){
            if (!db) return { ok:false, fehler:'firebase_fehler' };
            const cleanCode = String(code).trim().toUpperCase();
            return db.ref('invitations/' + cleanCode).once('value').then(function(snap){
                const inv = snap.val();
                if (!inv) return { ok:false, fehler:'nicht_gefunden' };
                if (inv.status === 'eingeloest')  return { ok:false, fehler:'bereits_eingeloest' };
                if (inv.status === 'widerrufen')  return { ok:false, fehler:'widerrufen' };
                if (inv.gueltigBis) {
                    const grenz = new Date(inv.gueltigBis).getTime();
                    if (grenz && grenz < Date.now()) {
                        return { ok:false, fehler:'abgelaufen' };
                    }
                }
                if (inv.pin && String(inv.pin) !== String(pin)) {
                    return { ok:false, fehler:'pin_falsch' };
                }
                return { ok:true, code:cleanCode, mitarbeiter: inv.mitarbeiter || '', pinMatches:true };
            }).catch(function(err){
                console.error('[TWMaFirebase] validiereEinladung-Fehler:', err);
                return { ok:false, fehler:'firebase_fehler', raw: err.message };
            });
        });
    }

    /**
     * Einladung einloesen:
     * - Anonymous-Sign-In (falls noch nicht erfolgt) -> UID
     * - /users/{uid}/profile mit Mitarbeiter-Name anlegen
     * - /users/{uid}/approved = false (wartet auf Buero-Freigabe)
     * - /users/{uid}/role = 'mitarbeiter'
     * - /invitations/{code}/status = 'eingeloest'
     * - /invitations/{code}/eingeloestVon = uid
     *
     * Rueckgabe: { uid, mitarbeiterName } bei Erfolg, sonst wirft Exception.
     */
    function loeseEinladungEin(code, mitarbeiterName, geraetName) {
        return ensureInit().then(function(){
            if (!db || !auth) throw new Error('Firebase nicht bereit');
            return signInAnonymous().then(function(user){
                const uid = user.uid;
                const cleanCode = String(code).trim().toUpperCase();
                const jetzt = firebase.database.ServerValue.TIMESTAMP;

                // Gleichzeitig: User anlegen + Einladung markieren
                const updates = {};
                updates['users/' + uid + '/role']     = 'mitarbeiter';
                updates['users/' + uid + '/approved'] = false;
                updates['users/' + uid + '/locked']   = false;
                updates['users/' + uid + '/profile']  = {
                    name: mitarbeiterName,
                    role: 'mitarbeiter',
                    geraet: geraetName || '',
                    erstelltAm: jetzt
                };
                updates['invitations/' + cleanCode + '/status']        = 'eingeloest';
                updates['invitations/' + cleanCode + '/eingeloestVon'] = uid;
                updates['invitations/' + cleanCode + '/eingeloestAm']  = jetzt;
                updates['invitations/' + cleanCode + '/geraetName']    = geraetName || '';

                return db.ref().update(updates).then(function(){
                    return { uid: uid, mitarbeiterName: mitarbeiterName };
                });
            });
        });
    }

    /**
     * Live-Listener auf /users/{uid}/ - Status-Wrapper-API:
     *
     * Callback bekommt: { status: 'wartend'|'approved'|'locked'|'geloescht', daten }
     *   - 'wartend'    User existiert, approved=false, locked=false
     *   - 'approved'   User hat approved=true
     *   - 'locked'     User hat locked=true
     *   - 'geloescht'  User-Knoten ist weg
     */
    function subscribeUserStatus(uid, callback) {
        let unsub = function(){};
        ensureInit().then(function(){
            if (!db || !uid) { callback({ status:'geloescht' }); return; }
            const ref = db.ref('users/' + uid);
            const handler = function(snap){
                const v = snap.val();
                if (!v)                 { callback({ status:'geloescht' }); return; }
                if (v.locked === true)  { callback({ status:'locked',    daten:v }); return; }
                if (v.approved === true){ callback({ status:'approved',  daten:v }); return; }
                callback({ status:'wartend', daten:v });
            };
            ref.on('value', handler);
            unsub = function(){ ref.off('value', handler); };
        }).catch(function(err){
            console.error('[TWMaFirebase] subscribeUserStatus-Fehler:', err);
            callback({ status:'geloescht' });
        });
        return function(){ unsub(); };
    }

    /**
     * Einmalige Pruefung des User-Status (ohne Listener).
     * Gibt denselben Status-Wrapper zurueck.
     */
    function checkUserStatus(uid) {
        return ensureInit().then(function(){
            if (!db || !uid) return { status:'geloescht' };
            return db.ref('users/' + uid).once('value').then(function(snap){
                const v = snap.val();
                if (!v)                 return { status:'geloescht' };
                if (v.locked === true)  return { status:'locked',    daten:v };
                if (v.approved === true)return { status:'approved',  daten:v };
                return { status:'wartend', daten:v };
            });
        }).catch(function(err){
            console.warn('[TWMaFirebase] checkUserStatus-Fehler:', err);
            return { status:'geloescht' };
        });
    }

    /**
     * Komplettes "Einladung einloesen"-Workflow:
     *  1. Einladung validieren (Code existiert, PIN stimmt, Status=offen)
     *  2. Anonymous-Auth → UID
     *  3. /users/{uid} mit profile anlegen (approved=false)
     *  4. /invitations/{code} als eingeloest markieren
     *
     * Ergebnis bei Erfolg: { uid, mitarbeiterName, code }
     *
     * Bei Fehler: throws Error mit einem dieser Codes als message:
     *   'invitation-not-found' | 'invitation-wrong-pin'
     *   'invitation-already-used' | 'invitation-revoked' | 'invitation-expired'
     *   'invitation-race-lost' | 'network-error' | 'firebase-error'
     */
    function redeemInvitation(code, pin, geraetNameOpt) {
        return validiereEinladung(code, pin).then(function(res){
            if (!res.ok) {
                const fehlerMap = {
                    'nicht_gefunden':      'invitation-not-found',
                    'bereits_eingeloest':  'invitation-already-used',
                    'widerrufen':          'invitation-revoked',
                    'abgelaufen':          'invitation-expired',
                    'pin_falsch':          'invitation-wrong-pin',
                    'firebase_fehler':     'network-error'
                };
                const errCode = fehlerMap[res.fehler] || 'firebase-error';
                throw new Error(errCode);
            }
            const mitarbeiterName = res.mitarbeiter;
            const geraetName = (geraetNameOpt && geraetNameOpt.trim())
                || (navigator.userAgent.substring(0, 80));
            return loeseEinladungEin(res.code, mitarbeiterName, geraetName).then(function(ergebnis){
                return {
                    uid: ergebnis.uid,
                    mitarbeiterName: ergebnis.mitarbeiterName,
                    code: res.code
                };
            }).catch(function(err){
                console.error('[TWMaFirebase] redeemInvitation-einloesen-Fehler:', err);
                // Race-Condition: zwei Geraete gleichzeitig?
                if (err && err.message && err.message.indexOf('PERMISSION_DENIED') >= 0) {
                    throw new Error('invitation-race-lost');
                }
                throw new Error('firebase-error');
            });
        });
    }

    /**
     * Heartbeat setzen, damit Buero sieht, dass das Geraet online ist.
     * Wird periodisch (z.B. alle 60s) aus der App aufgerufen.
     */
    function sendeHeartbeat() {
        const uid = getMeineUid();
        if (!db || !uid) return Promise.resolve();
        return db.ref('users/' + uid + '/heartbeat').set(
            firebase.database.ServerValue.TIMESTAMP
        ).catch(function(err){
            console.warn('[TWMaFirebase] Heartbeat-Fehler:', err);
        });
    }

    // ============================================================
    // Baustellen-Daten (Etappe 4b - Vollausbau)
    // ============================================================

    /**
     * Filtert die Rohdaten aus /aktive_baustellen/ nach den Baustellen,
     * die fuer die gegebene User-UID freigegeben sind, und sortiert sie
     * nach letzter_push absteigend (beendete Baustellen ans Ende).
     */
    function filtereUndSortiereBaustellen(raw, uid) {
        const result = [];
        Object.keys(raw).forEach(function(id){
            const b = raw[id] || {};
            const freigaben = b.freigegebene_geraete || {};
            if (uid && freigaben[uid] === true) {
                result.push(Object.assign({ id: id }, b));
            }
        });
        result.sort(function(a, b){
            // Beendete ans Ende
            const aBeendet = a.status === 'beendet';
            const bBeendet = b.status === 'beendet';
            if (aBeendet !== bBeendet) return aBeendet ? 1 : -1;
            // Dann nach letzter_push absteigend
            return (Number(b.letzter_push) || 0) - (Number(a.letzter_push) || 0);
        });
        return result;
    }

    /**
     * Einmalige Abfrage der fuer dieses Geraet freigegebenen Baustellen.
     * Benoetigt einen eingeloggten User (anonymous Auth).
     */
    function ladeAktiveBaustellen() {
        return ensureInit().then(function(){
            if (!db) return [];
            const uid = getMeineUid();
            if (!uid) {
                // Noch nicht eingeloggt - leere Liste statt Fehler
                console.warn('[TWMaFirebase] ladeAktiveBaustellen: keine UID, gebe [] zurueck');
                return [];
            }
            return db.ref('aktive_baustellen').once('value').then(function(snap){
                const val = snap.val() || {};
                return filtereUndSortiereBaustellen(val, uid);
            });
        });
    }

    /**
     * Live-Listener auf /aktive_baustellen/.
     * Callback wird bei jeder Aenderung mit der gefilterten + sortierten Liste aufgerufen.
     * Gibt eine Unsubscribe-Funktion zurueck.
     */
    function subscribeAktiveBaustellen(callback) {
        let unsub = function(){};
        ensureInit().then(function(){
            if (!db) { callback([]); return; }
            const uid = getMeineUid();
            if (!uid) { callback([]); return; }
            const ref = db.ref('aktive_baustellen');
            const handler = function(snap){
                const val = snap.val() || {};
                callback(filtereUndSortiereBaustellen(val, uid));
            };
            ref.on('value', handler);
            unsub = function(){ ref.off('value', handler); };
        }).catch(function(err){
            console.warn('[TWMaFirebase] subscribeAktiveBaustellen-Fehler:', err);
            callback([]);
        });
        return function(){ unsub(); };
    }

    /**
     * Einzelne Baustelle nachladen - fuer Refresh auf Detail-Seite.
     * Gibt null zurueck, wenn die Baustelle fuer diesen User nicht freigegeben ist.
     */
    function ladeBaustelle(baustelleId) {
        return ensureInit().then(function(){
            if (!db || !baustelleId) return null;
            const uid = getMeineUid();
            if (!uid) return null;
            return db.ref('aktive_baustellen/' + baustelleId).once('value').then(function(snap){
                const v = snap.val();
                if (!v) return null;
                const freigaben = v.freigegebene_geraete || {};
                if (freigaben[uid] !== true) return null;
                return Object.assign({ id: baustelleId }, v);
            });
        });
    }

    // ============================================================
    // ETAPPE 5 — NACHRICHTEN-MODUL (Kalender + Chat)
    // ============================================================
    // Alle Methoden unten erwarten, dass Auth + Init bereits gelaufen sind.
    // Sie nutzen die Firebase-User-UID als ma_id (Mitarbeiter-Identity).
    // Falls das Buero spaeter Slug-IDs vergibt (z.B. "ivan-petrov"),
    // liest getMeineMaId() erst /users/{uid}/ma_id und faellt auf uid zurueck.

    let _cachedMaId = null;

    /**
     * Liefert die Mitarbeiter-ID des eingeloggten Geraets.
     * Bevorzugt /users/{uid}/ma_id (Slug), faellt auf uid zurueck.
     * Caching: einmal aufgeloest, wird der Wert behalten.
     */
    function getMeineMaId() {
        return ensureInit().then(function(){
            if (_cachedMaId) return _cachedMaId;
            const uid = getMeineUid();
            if (!uid || !db) return null;
            return db.ref('users/' + uid + '/ma_id').once('value').then(function(snap){
                const slug = snap.val();
                _cachedMaId = (typeof slug === 'string' && slug.length > 0) ? slug : uid;
                return _cachedMaId;
            }).catch(function(){
                _cachedMaId = uid;
                return _cachedMaId;
            });
        });
    }

    /**
     * Laedt die Stammdaten des eingeloggten Mitarbeiters (einmalig).
     * Erwartet Objekt unter /mitarbeiter/{ma-id}/ ODER /users/{uid}/.
     * Fehlt der Knoten, wird ein Default-Objekt geliefert — App bleibt lauffaehig.
     */
    function ladeMeinenMitarbeiter() {
        return getMeineMaId().then(function(maId){
            if (!maId || !db) return null;
            const uid = getMeineUid();
            // Primaer-Quelle: /mitarbeiter/{ma-id}/
            return db.ref('mitarbeiter/' + maId).once('value').then(function(snap){
                if (snap.exists()) {
                    return Object.assign({ ma_id: maId }, snap.val());
                }
                // Fallback: /users/{uid}/ (aus Etappe 3 Auth-Flow)
                return db.ref('users/' + uid).once('value').then(function(usnap){
                    const u = usnap.val() || {};
                    return {
                        ma_id:    maId,
                        name:     u.name || u.mitarbeiter_name || 'Mitarbeiter',
                        sprache:  u.sprache || 'de',
                        rolle:    u.rolle  || '',
                        status:   u.status || 'aktiv'
                    };
                });
            });
        });
    }

    /**
     * Live-Listener auf Stammdaten-Aenderungen (z.B. Sprachwechsel durch Buero).
     * cb(mitarbeiter|null), returns unsubscribe-Funktion.
     */
    function subscribeMeinMitarbeiter(cb) {
        let unsubRef = null;
        getMeineMaId().then(function(maId){
            if (!maId || !db) { cb(null); return; }
            const ref = db.ref('mitarbeiter/' + maId);
            const handler = function(snap){
                const v = snap.val();
                cb(v ? Object.assign({ ma_id: maId }, v) : null);
            };
            ref.on('value', handler);
            unsubRef = function(){ ref.off('value', handler); };
        });
        return function(){ if (unsubRef) unsubRef(); };
    }

    // ----- Kalender -----

    /**
     * Live-Listener auf alle Tages-Eintraege eines Jahres fuer einen MA.
     * cb({ "2026-05-12": { status, stunden, baustelle_id, ... }, ... })
     */
    function subscribeKalenderJahr(maId, jahr, cb) {
        let unsubRef = null;
        ensureInit().then(function(){
            if (!db || !maId || !jahr) { cb({}); return; }
            const ref = db.ref('kalender/' + maId + '/' + jahr);
            const handler = function(snap){
                cb(snap.val() || {});
            };
            ref.on('value', handler);
            unsubRef = function(){ ref.off('value', handler); };
        });
        return function(){ if (unsubRef) unsubRef(); };
    }

    /**
     * Schreibt einen Tages-Eintrag.
     * datum: "2026-05-12" (ISO-Format, die ersten 4 Zeichen sind das Jahr)
     * data: { status, stunden?, baustelle_id?, sonderheiten?, audio_pfad? }
     * Setzt automatisch eingetragen_von='ma' und eingetragen_am/geaendert_am.
     */
    function schreibeKalenderEintrag(maId, datum, data) {
        return ensureInit().then(function(){
            if (!db || !maId || !datum) throw new Error('kalender: missing args');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error('kalender: datum muss ISO sein');
            const jahr = datum.substring(0, 4);
            const ref = db.ref('kalender/' + maId + '/' + jahr + '/' + datum);
            const jetzt = Date.now();
            return ref.once('value').then(function(snap){
                const alt = snap.val() || {};
                const neu = Object.assign({}, alt, data, {
                    eingetragen_von: 'ma',
                    geaendert_am:    jetzt,
                    eingetragen_am:  alt.eingetragen_am || jetzt
                });
                return ref.set(neu);
            });
        });
    }

    /**
     * Loescht einen Tages-Eintrag komplett.
     */
    function loescheKalenderEintrag(maId, datum) {
        return ensureInit().then(function(){
            if (!db || !maId || !datum) throw new Error('kalender: missing args');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error('kalender: datum muss ISO sein');
            const jahr = datum.substring(0, 4);
            return db.ref('kalender/' + maId + '/' + jahr + '/' + datum).remove();
        });
    }

    // ----- Baustellen-Planung (Read-Only fuer MA, Buero schreibt) -----

    /**
     * Live-Listener auf alle Baustellen-Planungen (fuer Balken im Kalender).
     * cb(array von { baustelle_id, zeitraum_id, von, bis, farbe, beschreibung, mitarbeiter })
     * Die MA-App filtert dann client-seitig auf Zeitraeume, in denen sich der eigene
     * ma_id unter .mitarbeiter befindet.
     */
    function subscribeBaustellenPlanungen(cb) {
        let unsubRef = null;
        ensureInit().then(function(){
            if (!db) { cb([]); return; }
            const ref = db.ref('baustellen_planung');
            const handler = function(snap){
                const v = snap.val() || {};
                const out = [];
                Object.keys(v).forEach(function(bid){
                    const zeitraeume = v[bid] || {};
                    Object.keys(zeitraeume).forEach(function(zid){
                        const z = zeitraeume[zid] || {};
                        out.push(Object.assign({ baustelle_id: bid, zeitraum_id: zid }, z));
                    });
                });
                cb(out);
            };
            ref.on('value', handler);
            unsubRef = function(){ ref.off('value', handler); };
        });
        return function(){ if (unsubRef) unsubRef(); };
    }

    /**
     * Filtert die Planungen auf Zeitraeume, die den angegebenen MA betreffen.
     * Hilfsfunktion fuer die Kalender-UI.
     */
    function filterePlanungenFuerMa(planungen, maId) {
        if (!Array.isArray(planungen) || !maId) return [];
        return planungen.filter(function(p){
            return p && p.mitarbeiter && p.mitarbeiter[maId] === true;
        });
    }

    // ----- Chat -----

    /**
     * Live-Listener auf den Chat-Thread zwischen Buero und dem MA.
     * cb(array von Nachrichten, chronologisch sortiert).
     * Jede Nachricht: { id, von, absender_name, text_original, sprache_original,
     *                   text_uebersetzt: { de, en, ... }, timestamp, gelesen, dringend }
     */
    function subscribeChat(maId, cb) {
        let unsubRef = null;
        ensureInit().then(function(){
            if (!db || !maId) { cb([]); return; }
            const ref = db.ref('chats/' + maId).orderByChild('timestamp');
            const handler = function(snap){
                const v = snap.val() || {};
                const arr = [];
                Object.keys(v).forEach(function(nid){
                    const n = v[nid];
                    if (!n || typeof n !== 'object') return;
                    // "angelegt" etc. sind Meta-Felder, keine Nachrichten
                    if (typeof n.timestamp !== 'number') return;
                    arr.push(Object.assign({ id: nid }, n));
                });
                arr.sort(function(a, b){ return (a.timestamp||0) - (b.timestamp||0); });
                cb(arr);
            };
            ref.on('value', handler);
            unsubRef = function(){ ref.off('value', handler); };
        });
        return function(){ if (unsubRef) unsubRef(); };
    }

    /**
     * Sendet eine Nachricht vom MA ans Buero.
     * text:   Original-Text in MA-Sprache.
     * sprache_original: ISO-Code der Absender-Sprache ("de"|"en"|"ru"|...).
     * absender_name: Anzeigename (kommt aus Stammdaten).
     * Optional dringend=true — aktuell auf MA-Seite ohne besondere Bedeutung,
     *                          das Flag wird vom Buero beim Senden genutzt.
     * Die Uebersetzung uebernimmt die Cloud Function im Hintergrund.
     */
    function sendeChatNachricht(maId, absenderName, text, spracheOriginal, dringend) {
        return ensureInit().then(function(){
            if (!db || !maId || !text) throw new Error('chat: missing args');
            const ref = db.ref('chats/' + maId).push();
            return ref.set({
                von:              'ma',
                absender_name:    absenderName || 'Mitarbeiter',
                text_original:    String(text).slice(0, 4000),
                sprache_original: spracheOriginal || 'de',
                text_uebersetzt:  null, // wird von Cloud Function gefuellt
                timestamp:        Date.now(),
                gelesen:          false,
                dringend:         dringend === true
            }).then(function(){ return ref.key; });
        });
    }

    /**
     * Markiert eine einzelne Nachricht als gelesen (MA liest Buero-Nachricht).
     */
    function markiereNachrichtGelesen(maId, nachrichtId) {
        return ensureInit().then(function(){
            if (!db || !maId || !nachrichtId) return;
            return db.ref('chats/' + maId + '/' + nachrichtId).update({
                gelesen:    true,
                gelesen_am: Date.now()
            });
        });
    }

    /**
     * Zaehlt ungelesene Buero-Nachrichten (fuer Badge auf Startseite / Tab).
     * Einmaliger Read, nicht abonniert — fuer Abonnement siehe subscribeChat + Client-Zaehlung.
     */
    function zaehleUngeleseneBueroNachrichten(maId) {
        return ensureInit().then(function(){
            if (!db || !maId) return 0;
            return db.ref('chats/' + maId).once('value').then(function(snap){
                const v = snap.val() || {};
                let n = 0;
                Object.keys(v).forEach(function(nid){
                    const m = v[nid];
                    if (m && m.von === 'buero' && m.gelesen !== true && typeof m.timestamp === 'number') {
                        n++;
                    }
                });
                return n;
            });
        });
    }

    // ----- FCM / Push -----

    /**
     * Speichert den FCM-Token des Geraets unter /geraete/{uuid}/fcm_token.
     * Wird von der Baustein-6-Registrierung aufgerufen.
     */
    function speichereFcmToken(token) {
        return ensureInit().then(function(){
            if (!db || !token) return;
            const uid = getMeineUid();
            if (!uid) return;
            return db.ref('geraete/' + uid).update({
                fcm_token:              String(token),
                fcm_token_aktualisiert: Date.now()
            });
        });
    }

    /**
     * Initialisiert FCM und fordert (falls noch nicht entschieden) die Push-Erlaubnis an.
     * Registriert den Background-Service-Worker und holt sich den FCM-Token.
     * vapidKey: Web-Push-Public-Key aus Firebase Console > Cloud Messaging.
     * Ohne vapidKey wird FCM NICHT initialisiert (Warnung in Konsole).
     * Returns Promise mit { status: 'granted'|'denied'|'default'|'unsupported', token?: string }.
     */
    function initFcm(vapidKey) {
        return new Promise(function(resolve){
            // Vorbedingungen pruefen
            if (typeof firebase === 'undefined' || !firebase.messaging) {
                resolve({ status: 'unsupported', reason: 'firebase-messaging-nicht-geladen' });
                return;
            }
            if (!('Notification' in window)) {
                resolve({ status: 'unsupported', reason: 'notification-api-fehlt' });
                return;
            }
            if (!('serviceWorker' in navigator)) {
                resolve({ status: 'unsupported', reason: 'service-worker-fehlt' });
                return;
            }
            if (!vapidKey) {
                console.warn('[TWMaFirebase] FCM nicht initialisiert: vapidKey fehlt');
                resolve({ status: 'unsupported', reason: 'vapid-key-fehlt' });
                return;
            }

            // Aktueller Permission-Status
            const aktPerm = Notification.permission;
            if (aktPerm === 'denied') {
                resolve({ status: 'denied' });
                return;
            }

            function nachErlaubnisRegistrieren() {
                // Background-Service-Worker fuer FCM registrieren (separate Datei!)
                navigator.serviceWorker.register('firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
                    .then(function(reg){
                        try {
                            const messaging = firebase.messaging();
                            return messaging.getToken({
                                vapidKey: vapidKey,
                                serviceWorkerRegistration: reg
                            }).then(function(token){
                                if (!token) {
                                    resolve({ status: 'denied', reason: 'kein-token' });
                                    return;
                                }
                                // Token in Firebase speichern
                                return speichereFcmToken(token).then(function(){
                                    console.log('[TWMaFirebase] FCM-Token registriert (' + token.slice(0, 10) + '...)');
                                    resolve({ status: 'granted', token: token });
                                });
                            });
                        } catch(e) {
                            console.error('[TWMaFirebase] messaging() fehlgeschlagen:', e);
                            resolve({ status: 'unsupported', reason: 'messaging-init-fail' });
                        }
                    })
                    .catch(function(err){
                        console.error('[TWMaFirebase] SW-Register fehlgeschlagen:', err);
                        resolve({ status: 'unsupported', reason: 'sw-register-fail' });
                    });
            }

            if (aktPerm === 'granted') {
                nachErlaubnisRegistrieren();
                return;
            }

            // 'default' - User muss zustimmen
            Notification.requestPermission().then(function(perm){
                if (perm === 'granted') {
                    nachErlaubnisRegistrieren();
                } else {
                    resolve({ status: perm }); // 'denied' oder 'default'
                }
            });
        });
    }

    /**
     * Registriert onMessage-Handler fuer Foreground-Nachrichten.
     * Wird aufgerufen, wenn die App offen ist und eine Push-Nachricht ankommt.
     * Returns unsubscribe-Funktion (oder no-op wenn FCM nicht verfuegbar).
     */
    function subscribeFcmForeground(callback) {
        if (typeof firebase === 'undefined' || !firebase.messaging) {
            return function(){};
        }
        try {
            const messaging = firebase.messaging();
            return messaging.onMessage(function(payload){
                try { callback(payload); } catch(e) { console.error('[FCM] Handler-Fehler:', e); }
            });
        } catch(e) {
            return function(){};
        }
    }

    // ============================================================
    // Export
    // ============================================================

    global.TWMaFirebase = {
        // Init & Status
        init:                       init,
        ensureInit:                 ensureInit,
        isReady:                    isReady,
        isConfigReady:              isConfigReady,
        saveConfig:                 saveConfig,
        subscribeConnectionStatus:  subscribeConnectionStatus,

        // Auth
        signInAnonymous:            signInAnonymous,
        getMeineUid:                getMeineUid,
        signOut:                    signOut,

        // Einladungen
        validiereEinladung:         validiereEinladung,
        loeseEinladungEin:          loeseEinladungEin,
        redeemInvitation:           redeemInvitation,

        // User-Status
        subscribeUserStatus:        subscribeUserStatus,
        checkUserStatus:            checkUserStatus,
        sendeHeartbeat:             sendeHeartbeat,

        // Baustellen (Read-Only)
        ladeAktiveBaustellen:       ladeAktiveBaustellen,
        subscribeAktiveBaustellen:  subscribeAktiveBaustellen,
        ladeBaustelle:              ladeBaustelle,

        // Etappe 5 — Mitarbeiter-Identity
        getMeineMaId:               getMeineMaId,
        ladeMeinenMitarbeiter:      ladeMeinenMitarbeiter,
        subscribeMeinMitarbeiter:   subscribeMeinMitarbeiter,

        // Etappe 5 — Kalender
        subscribeKalenderJahr:      subscribeKalenderJahr,
        schreibeKalenderEintrag:    schreibeKalenderEintrag,
        loescheKalenderEintrag:     loescheKalenderEintrag,

        // Etappe 5 — Baustellen-Planung (Balken im Kalender)
        subscribeBaustellenPlanungen: subscribeBaustellenPlanungen,
        filterePlanungenFuerMa:       filterePlanungenFuerMa,

        // Etappe 5 — Chat
        subscribeChat:              subscribeChat,
        sendeChatNachricht:         sendeChatNachricht,
        markiereNachrichtGelesen:   markiereNachrichtGelesen,
        zaehleUngeleseneBueroNachrichten: zaehleUngeleseneBueroNachrichten,

        // Etappe 5 — FCM
        speichereFcmToken:          speichereFcmToken,
        initFcm:                    initFcm,
        subscribeFcmForeground:     subscribeFcmForeground
    };

    console.log('[TWMaFirebase] Etappe-5-Vollausbau (Kalender + Chat + FCM) geladen.');

})(window);
