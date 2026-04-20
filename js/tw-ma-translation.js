/* ============================================================
   TW Baustellen-App · Translation-Service (Gemini-Wrapper)
   ============================================================
   Stub fuer Etappe 1.
   Vollausbau in Etappe 7 (Nachrichten-Modul mit Live-Uebersetzung).

   - Gemini Flash als Uebersetzungs-Backend
   - API-Key verschluesselt aus tw-ma-config.js
   - In-Memory-Cache mit LRU (max. TRANSLATION_CONFIG.cacheSize)
   - Fallback: Text im Original durchreichen bei API-Fehler
   ============================================================
*/

(function(global){
    'use strict';

    const cache = new Map();
    const MAX = 500;

    function cacheKey(text, srcLang, tgtLang) {
        return srcLang+'|'+tgtLang+'|'+text;
    }

    function putCache(k, v) {
        if (cache.size >= MAX) {
            // FIFO: ersten Eintrag rauswerfen
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(k, v);
    }

    // ============================================================
    // Stub: gibt im Moment Original zurueck.
    // Echtes Gemini-Call in Etappe 7.
    // ============================================================

    function uebersetzeText(text, srcLang, tgtLang) {
        if (!text) return Promise.resolve('');
        if (srcLang === tgtLang) return Promise.resolve(text);

        const k = cacheKey(text, srcLang, tgtLang);
        if (cache.has(k)) return Promise.resolve(cache.get(k));

        // Stub: einfach Original zurueck, mit Hinweis-Log
        console.debug('[TWMaTranslation] (Stub) '+srcLang+'→'+tgtLang+':', text);
        putCache(k, text);
        return Promise.resolve(text);
    }

    function uebersetzeInAlleSprachen(text, srcLang) {
        const langs = (global.TWMaConfig && global.TWMaConfig.SUPPORTED_LANGUAGES) || [];
        const ergebnis = {};
        const promises = langs.map(function(l){
            if (l.code === srcLang) { ergebnis[l.code] = text; return Promise.resolve(); }
            return uebersetzeText(text, srcLang, l.code).then(function(t){ ergebnis[l.code] = t; });
        });
        return Promise.all(promises).then(function(){ return ergebnis; });
    }

    function clearCache() {
        cache.clear();
    }

    global.TWMaTranslation = {
        uebersetzeText:            uebersetzeText,
        uebersetzeInAlleSprachen:  uebersetzeInAlleSprachen,
        clearCache:                clearCache,
        isReady: function(){ return false; }  /* wird in Etappe 7 true */
    };

    console.log('[TWMaTranslation] Stub geladen - Vollausbau in Etappe 7.');

})(window);
