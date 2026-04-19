/* ════════════════════════════════════════════════════════════════════
 * TW Baustellen-App — AUTH-MODUL (tw-ma-auth.js)
 *
 * Zweck:  Login-Flow Code+PIN gegen Master-App-Schema (invitations/ + users/)
 *
 * Schema-Konventionen (gespiegelt mit tw-business-suite/tw-infrastructure.js):
 *
 *   invitations/{code} = {
 *       code, mitarbeiter, pin,
 *       erstelltAm, gueltigBis,
 *       status: 'offen' | 'eingeloest' | 'abgelaufen' | 'widerrufen',
 *       eingeloestVon: <uid>, eingeloestAm: <ts>, geraetName: <string>
 *   }
 *
 *   users/{uid} = {
 *       role: 'mitarbeiter',          // Admin schreibt Master-App selbst
 *       approved: false,              // wird von Thomas auf true gesetzt
 *       locked: false,                // Sperre/Wipe durch Master-App
 *       language: 'de',
 *       lastLogin: <ts>,
 *       profile: {
 *           name, geraeteTyp, codeUsed
 *       }
 *   }
 *
 * Login-Flow (Etappe 3 neu):
 *   1. App pruefe LocalStorage 'tw-ma-uid' und 'tw-ma-status'
 *      - 'aktiv'      -> direkt durchstarten (kein PIN-Login mehr noetig
 *                         weil Anonymous-Auth-Token persistent ist)
 *      - 'wartet'     -> Wartebildschirm, Listener auf approved
 *      - sonst        -> Code-Eingabe-Screen
 *   2. Code+PIN-Eingabe -> einloggen()
 *      - liest invitations/{code}
 *      - prueft pin, status==offen, gueltigBis nicht ueberschritten
 *      - bei Match: signInAnonymously -> uid bekommen
 *      - schreibt users/{uid}/profile + role + language + approved=false
 *      - markiert invitations/{code} als eingeloest
 *      - speichert uid + status='wartet' in LocalStorage
 *   3. horcheAufApproved() pollt users/{uid}/approved
 *      - approved=true -> Status auf 'aktiv', App entsperren
 *      - locked=true   -> Wipe ausloesen
 *
 * Annahmen (V1, mit Thomas abgestimmt):
 *   - PIN-Vergleich Klartext (Master-App speichert auch Klartext)
 *   - Anonymous-Auth-Token persistiert ueber Browser-Sessions (Firebase-Default)
 *   - Kein zusaetzliches Profil-Eingabe-Formular (Name kommt aus Einladung)
 *   - Alter geraete/-Ast wird ignoriert, nicht migriert
 * ════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ── LocalStorage-Keys (neue Generation, alte werden NICHT geloescht) ──
    var LS_UID    = 'tw-ma-uid';        // Firebase Anonymous Auth UID
    var LS_STATUS = 'tw-ma-status';     // 'wartet' | 'aktiv'
    var LS_NAME   = 'tw-ma-name';       // Mitarbeiter-Name (aus Einladung)
    var LS_LANG   = 'tw-ma-language';   // gewaehlte Sprache

    // ── Status-Konstanten ──
    var STATUS_OFFEN      = 'offen';
    var STATUS_EINGELOEST = 'eingeloest';
    var STATUS_ABGELAUFEN = 'abgelaufen';
    var STATUS_WIDERRUFEN = 'widerrufen';

    // ── Fehlerklassen fuer praezisere UI-Reaktionen ──
    function AuthError(code, message) {
        this.name = 'AuthError';
        this.code = code;
        this.message = message;
    }
    AuthError.prototype = Object.create(Error.prototype);

    // Fehler-Codes die der UI-Layer interpretiert:
    var ERR_CODE_NOT_FOUND   = 'CODE_NOT_FOUND';
    var ERR_PIN_FALSE        = 'PIN_FALSE';
    var ERR_INVITE_EXPIRED   = 'INVITE_EXPIRED';
    var ERR_INVITE_USED      = 'INVITE_USED';
    var ERR_INVITE_REVOKED   = 'INVITE_REVOKED';
    var ERR_FIREBASE_DOWN    = 'FIREBASE_DOWN';

    /**
     * Pruefe Code+PIN gegen Firebase und logge ein.
     * Wirft AuthError bei jedem Misserfolg.
     *
     * @param {string} code  6-stelliger Einladungs-Code (Grossschreibung egal)
     * @param {string} pin   4-stellige PIN aus der Master-App
     * @param {string} lang  aktuelle UI-Sprache fuer users/{uid}/language
     * @returns {Promise<{uid, name, status}>}
     */
    async function einloggen(code, pin, lang) {
        if (!window.firebase || !firebase.database || !firebase.auth) {
            throw new AuthError(ERR_FIREBASE_DOWN, 'Firebase nicht geladen');
        }

        // Normalisierung: Code uppercase, ohne Leerzeichen
        var codeNorm = String(code || '').trim().toUpperCase();
        var pinNorm  = String(pin || '').trim();

        if (codeNorm.length !== 6) {
            throw new AuthError(ERR_CODE_NOT_FOUND, 'Code muss 6 Zeichen haben');
        }

        var db = firebase.database();
        var snap = await db.ref('invitations/' + codeNorm).once('value');
        var invite = snap.val();

        if (!invite) {
            throw new AuthError(ERR_CODE_NOT_FOUND, 'Code unbekannt');
        }
        if (invite.status === STATUS_WIDERRUFEN) {
            throw new AuthError(ERR_INVITE_REVOKED, 'Einladung wurde widerrufen');
        }
        if (invite.status === STATUS_EINGELOEST) {
            // Einmal-Einladungen — kein Doppelnutzen
            throw new AuthError(ERR_INVITE_USED, 'Einladung wurde bereits verwendet');
        }
        if (invite.gueltigBis && Date.now() > new Date(invite.gueltigBis).getTime()) {
            throw new AuthError(ERR_INVITE_EXPIRED, 'Einladung ist abgelaufen');
        }
        if (String(invite.pin || '') !== pinNorm) {
            throw new AuthError(ERR_PIN_FALSE, 'PIN falsch');
        }

        // ── Anonymous-Auth ── (gibt uns eine stabile UID, persistiert im Browser)
        var cred = await firebase.auth().signInAnonymously();
        var uid = cred.user.uid;

        // ── users/{uid} initialisieren ──
        // role: mitarbeiter, approved: false (Thomas muss freigeben),
        // profile.name kommt direkt aus der Einladung
        var nun = Date.now();
        var profil = {
            name: invite.mitarbeiter || 'Mitarbeiter',
            geraeteTyp: erkenneGeraet(),
            codeUsed: codeNorm
        };
        await db.ref('users/' + uid).set({
            role: 'mitarbeiter',
            approved: false,
            locked: false,
            language: lang || 'de',
            lastLogin: nun,
            profile: profil
        });

        // ── invitations/{code} als eingeloest markieren ──
        await db.ref('invitations/' + codeNorm).update({
            status: STATUS_EINGELOEST,
            eingeloestVon: uid,
            eingeloestAm: nun,
            geraetName: profil.geraeteTyp
        });

        // ── Lokal persistieren ──
        localStorage.setItem(LS_UID, uid);
        localStorage.setItem(LS_STATUS, 'wartet');
        localStorage.setItem(LS_NAME, profil.name);
        localStorage.setItem(LS_LANG, lang || 'de');

        return { uid: uid, name: profil.name, status: 'wartet' };
    }

    /**
     * Lade gespeicherten Auth-Stand aus LocalStorage.
     * Liefert null, wenn nichts gespeichert ist (-> Code-Eingabe noetig).
     */
    function ladeGespeichertenStand() {
        var uid = localStorage.getItem(LS_UID);
        if (!uid) return null;
        return {
            uid: uid,
            status: localStorage.getItem(LS_STATUS) || 'wartet',
            name:   localStorage.getItem(LS_NAME) || 'Mitarbeiter',
            lang:   localStorage.getItem(LS_LANG) || 'de'
        };
    }

    /**
     * Horche live auf users/{uid} und reagiere auf approved/locked.
     * @param {string}   uid          UID des aktuellen Geraets
     * @param {function} onApproved   ()=>void, wird aufgerufen wenn approved=true
     * @param {function} onLocked     (grund)=>void, wird aufgerufen wenn locked=true
     * @param {function} onError      (err)=>void
     * @returns {function} Unsubscribe-Funktion
     */
    function horcheAufApproved(uid, onApproved, onLocked, onError) {
        if (!window.firebase || !uid) return function(){};
        var ref = firebase.database().ref('users/' + uid);
        var handler = function(snap) {
            var d = snap.val();
            if (!d) {
                // Eintrag wurde von Thomas geloescht -> wie locked behandeln
                onLocked && onLocked('entfernt');
                return;
            }
            if (d.locked === true) {
                onLocked && onLocked('gesperrt');
                return;
            }
            if (d.approved === true) {
                localStorage.setItem(LS_STATUS, 'aktiv');
                onApproved && onApproved(d);
            }
        };
        ref.on('value', handler, function(err){ onError && onError(err); });
        return function() { ref.off('value', handler); };
    }

    /**
     * Vollstaendiger Logout / Wipe.
     * Loescht LocalStorage + (best-effort) signOut.
     */
    async function logoutLokal() {
        try { if (firebase.auth().currentUser) await firebase.auth().signOut(); } catch(e){}
        localStorage.removeItem(LS_UID);
        localStorage.removeItem(LS_STATUS);
        localStorage.removeItem(LS_NAME);
        localStorage.removeItem(LS_LANG);
        // Alte Etappe-3-Keys mit aufraeumen, falls noch vorhanden
        localStorage.removeItem('tw-ma-geraete-id');
        localStorage.removeItem('tw-ma-code');
        localStorage.removeItem('tw-ma-pin-hash');
        localStorage.removeItem('tw-ma-pin-versuche');
    }

    /**
     * Bei Wipe durch Thomas: lastLogin notieren, dann Lokal-Wipe.
     * Master-App reagiert auf locked=true, daher kein gesonderter Status-Schreibvorgang.
     */
    async function wipeNachAnordnung() {
        await logoutLokal();
    }

    // ── Hilfs-Heuristik fuer geraeteTyp (nur kosmetisch fuers Buero) ──
    function erkenneGeraet() {
        var ua = navigator.userAgent || '';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Android/i.test(ua))           return 'Android';
        if (/Windows/i.test(ua))           return 'Windows';
        if (/Mac OS X/i.test(ua))          return 'Mac';
        return 'Unbekannt';
    }

    // ── Public API ──
    window.TWMAAuth = {
        einloggen: einloggen,
        ladeGespeichertenStand: ladeGespeichertenStand,
        horcheAufApproved: horcheAufApproved,
        logoutLokal: logoutLokal,
        wipeNachAnordnung: wipeNachAnordnung,
        AuthError: AuthError,
        ERR: {
            CODE_NOT_FOUND: ERR_CODE_NOT_FOUND,
            PIN_FALSE:      ERR_PIN_FALSE,
            INVITE_EXPIRED: ERR_INVITE_EXPIRED,
            INVITE_USED:    ERR_INVITE_USED,
            INVITE_REVOKED: ERR_INVITE_REVOKED,
            FIREBASE_DOWN:  ERR_FIREBASE_DOWN
        }
    };
})();
