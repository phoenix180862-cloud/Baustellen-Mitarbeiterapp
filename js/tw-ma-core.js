/* ============================================================
   TW Baustellen-App · Core-Utilities
   ============================================================
   - Logger
   - Device-ID (UUID)
   - Datums- und Zeit-Helper
   - Offline-Erkennung
   ============================================================
*/

(function(global){
    'use strict';

    // ============================================================
    // Logger
    // ============================================================

    const LOG_LEVEL = { DEBUG:0, INFO:1, WARN:2, ERROR:3 };
    let currentLevel = LOG_LEVEL.DEBUG;

    function log(level, tag) {
        if (LOG_LEVEL[level] < currentLevel) return function(){};
        const args = Array.prototype.slice.call(arguments, 2);
        const fn = {
            DEBUG: console.debug ? console.debug.bind(console) : console.log.bind(console),
            INFO:  console.info  ? console.info.bind(console)  : console.log.bind(console),
            WARN:  console.warn.bind(console),
            ERROR: console.error.bind(console)
        }[level];
        fn('['+tag+']', ...args);
    }

    const Logger = {
        setLevel: function(l){ if (LOG_LEVEL[l] !== undefined) currentLevel = LOG_LEVEL[l]; },
        debug: function(tag){ log('DEBUG', tag, ...Array.prototype.slice.call(arguments,1)); },
        info:  function(tag){ log('INFO',  tag, ...Array.prototype.slice.call(arguments,1)); },
        warn:  function(tag){ log('WARN',  tag, ...Array.prototype.slice.call(arguments,1)); },
        error: function(tag){ log('ERROR', tag, ...Array.prototype.slice.call(arguments,1)); }
    };

    // ============================================================
    // Device-ID (UUID v4)
    // ============================================================

    const DEVICE_ID_KEY = 'tw-ma-device-id';

    function generateUuid() {
        // RFC 4122 v4, crypto.randomUUID falls verfuegbar
        if (crypto && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        // Fallback fuer aeltere Browser
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
            const r = Math.random()*16|0;
            const v = c === 'x' ? r : (r&0x3)|0x8;
            return v.toString(16);
        });
    }

    function getDeviceId() {
        let id = localStorage.getItem(DEVICE_ID_KEY);
        if (!id) {
            id = generateUuid();
            localStorage.setItem(DEVICE_ID_KEY, id);
            Logger.info('Core', 'Neue Geraete-ID generiert:', id);
        }
        return id;
    }

    // ============================================================
    // Datums-Helper
    // ============================================================

    function datumZuIsoString(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth()+1).padStart(2,'0');
        const d = String(date.getDate()).padStart(2,'0');
        return y+'-'+m+'-'+d;
    }

    function istWochenende(date) {
        const d = date.getDay();
        return d === 0 || d === 6;
    }

    function istHeute(date) {
        const heute = new Date();
        return datumZuIsoString(date) === datumZuIsoString(heute);
    }

    function formatTagesUeberschrift(date) {
        // Verwendet aktuelle UI-Sprache
        const wochentage = ['tag.sonntag','tag.montag','tag.dienstag','tag.mittwoch','tag.donnerstag','tag.freitag','tag.samstag'];
        const t = global.TWMaConfig && global.TWMaConfig.t ? global.TWMaConfig.t : function(k){return k;};
        const wtLabel = t(wochentage[date.getDay()]);
        const monLabel = t('monat.'+(date.getMonth()+1));
        return wtLabel+', '+date.getDate()+'. '+monLabel+' '+date.getFullYear();
    }

    // ============================================================
    // Offline-Erkennung
    // ============================================================

    function istOnline() {
        return navigator.onLine === true;
    }

    function registriereOnlineOfflineHandler(onOnline, onOffline) {
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return function(){
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }

    // ============================================================
    // Debounce / Throttle Helper
    // ============================================================

    function debounce(fn, wait) {
        let timer = null;
        return function() {
            const args = arguments, ctx = this;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function(){ fn.apply(ctx, args); }, wait);
        };
    }

    function throttle(fn, wait) {
        let last = 0;
        return function() {
            const now = Date.now();
            if (now - last >= wait) { last = now; fn.apply(this, arguments); }
        };
    }

    // ============================================================
    // Export
    // ============================================================

    global.TWMaCore = {
        Logger:                        Logger,
        generateUuid:                  generateUuid,
        getDeviceId:                   getDeviceId,
        datumZuIsoString:              datumZuIsoString,
        istWochenende:                 istWochenende,
        istHeute:                      istHeute,
        formatTagesUeberschrift:       formatTagesUeberschrift,
        istOnline:                     istOnline,
        registriereOnlineOfflineHandler: registriereOnlineOfflineHandler,
        debounce:                      debounce,
        throttle:                      throttle
    };

    Logger.info('Core', 'TWMaCore geladen, Device-ID:', getDeviceId());

})(window);
