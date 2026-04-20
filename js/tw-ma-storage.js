/* ============================================================
   TW Baustellen-App · IndexedDB-Storage (Wrapper)
   ============================================================
   Stub-Implementation fuer Etappe 1.
   Vollausbau in Etappe 3 (Geraete-Onboarding) und folgenden.

   Geplante Stores:
   - wip        (Work-in-Progress-Entwuerfe wie Stundenzettel)
   - fotos      (Baustellen-Fotos bis Sync)
   - sync_queue (Out-Queue fuer Offline-Aktionen)
   - settings   (PIN-Hash, Sprach-Wahl, etc.)
   - baustellen_cache  (letzter bekannter Stand)
   ============================================================
*/

(function(global){
    'use strict';

    const DB_NAME = 'tw-ma-db';
    const DB_VERSION = 1;

    let dbPromise = null;

    // ============================================================
    // Datenbank oeffnen / upgraden
    // ============================================================

    function openDb() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise(function(resolve, reject){
            if (!('indexedDB' in global)) {
                reject(new Error('IndexedDB nicht verfuegbar in diesem Browser'));
                return;
            }
            const req = global.indexedDB.open(DB_NAME, DB_VERSION);
            req.onerror   = function(){ reject(req.error); };
            req.onsuccess = function(){ resolve(req.result); };
            req.onupgradeneeded = function(e){
                const db = e.target.result;
                if (!db.objectStoreNames.contains('wip')) {
                    db.createObjectStore('wip', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('fotos')) {
                    const store = db.createObjectStore('fotos', { keyPath: 'id' });
                    store.createIndex('baustelle_id', 'baustelle_id', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('baustellen_cache')) {
                    db.createObjectStore('baustellen_cache', { keyPath: 'id' });
                }
            };
        });
        return dbPromise;
    }

    // ============================================================
    // Transaktions-Helper
    // ============================================================

    function withStore(storeName, mode, callback) {
        return openDb().then(function(db){
            return new Promise(function(resolve, reject){
                const tx = db.transaction(storeName, mode);
                tx.onerror    = function(){ reject(tx.error); };
                tx.onabort    = function(){ reject(tx.error || new Error('Transaktion abgebrochen')); };
                tx.oncomplete = function(){}; // resolve faellt in callback
                const store = tx.objectStore(storeName);
                callback(store, resolve, reject);
            });
        });
    }

    // ============================================================
    // WIP (Work-in-Progress) - fuer Stunden-Entwuerfe etc.
    // ============================================================

    function saveWip(id, daten) {
        return withStore('wip', 'readwrite', function(store, resolve){
            const eintrag = Object.assign({}, daten, { id: id, geaendert_am: Date.now() });
            const req = store.put(eintrag);
            req.onsuccess = function(){ resolve(eintrag); };
        });
    }

    function loadWip(id) {
        return withStore('wip', 'readonly', function(store, resolve){
            const req = store.get(id);
            req.onsuccess = function(){ resolve(req.result || null); };
        });
    }

    function deleteWip(id) {
        return withStore('wip', 'readwrite', function(store, resolve){
            const req = store.delete(id);
            req.onsuccess = function(){ resolve(true); };
        });
    }

    function listWips() {
        return withStore('wip', 'readonly', function(store, resolve){
            const req = store.getAll();
            req.onsuccess = function(){ resolve(req.result || []); };
        });
    }

    // ============================================================
    // Settings-Store (key-value, z.B. PIN-Hash, gewaehlte Sprache)
    // ============================================================

    function setSetting(key, value) {
        return withStore('settings', 'readwrite', function(store, resolve){
            const req = store.put({ key: key, value: value, geaendert_am: Date.now() });
            req.onsuccess = function(){ resolve(true); };
        });
    }

    function getSetting(key) {
        return withStore('settings', 'readonly', function(store, resolve){
            const req = store.get(key);
            req.onsuccess = function(){
                const r = req.result;
                resolve(r ? r.value : null);
            };
        });
    }

    function deleteSetting(key) {
        return withStore('settings', 'readwrite', function(store, resolve){
            const req = store.delete(key);
            req.onsuccess = function(){ resolve(true); };
        });
    }

    function clearAllSettings() {
        return withStore('settings', 'readwrite', function(store, resolve){
            const req = store.clear();
            req.onsuccess = function(){ resolve(true); };
        });
    }

    // ============================================================
    // SHA-256 Hashing (fuer PIN-Sicherung)
    // ============================================================
    // Hash = SHA-256(pin + ':' + salt).
    // Salt ist pro Geraet die UID, sodass derselbe PIN auf zwei
    // Geraeten unterschiedliche Hashes liefert (kein Reverse-Tabellen-
    // Angriff machbar).

    function sha256Hex(str) {
        if (!global.crypto || !global.crypto.subtle) {
            return Promise.reject(new Error('WebCrypto nicht verfuegbar'));
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(String(str));
        return global.crypto.subtle.digest('SHA-256', data).then(function(buf){
            const bytes = new Uint8Array(buf);
            let hex = '';
            for (let i=0; i<bytes.length; i++) {
                hex += bytes[i].toString(16).padStart(2, '0');
            }
            return hex;
        });
    }

    function pinZuHash(pin, salt) {
        return sha256Hex(String(pin) + ':' + String(salt || 'tw-ma'));
    }

    // ============================================================
    // Onboarding-Persistierung (High-Level, nutzt settings-Store)
    // ============================================================

    function speicherOnboarding(daten) {
        // daten = { uid, pinHash, mitarbeiterName, geraeteName, onboardingAbgeschlossen }
        return setSetting('onboarding', Object.assign({}, daten, {
            gespeichertAm: Date.now()
        }));
    }

    function ladeOnboarding() {
        return getSetting('onboarding');
    }

    function loescheOnboarding() {
        return deleteSetting('onboarding');
    }

    function pinVersucheErhoehen() {
        return getSetting('pin_versuche').then(function(v){
            const neu = (v || 0) + 1;
            return setSetting('pin_versuche', neu).then(function(){ return neu; });
        });
    }

    function pinVersucheResetten() {
        return setSetting('pin_versuche', 0);
    }

    function getPinVersuche() {
        return getSetting('pin_versuche').then(function(v){ return v || 0; });
    }

    // ============================================================
    // Sync-Queue-Stub (Vollausbau Etappe 5+)
    // ============================================================

    function enqueueSync(task) {
        return withStore('sync_queue', 'readwrite', function(store, resolve){
            const eintrag = Object.assign({}, task, { erstellt_am: Date.now() });
            const req = store.add(eintrag);
            req.onsuccess = function(){ resolve(req.result); };
        });
    }

    function peekSyncQueue(limit) {
        if (typeof limit !== 'number') limit = 50;
        return withStore('sync_queue', 'readonly', function(store, resolve){
            const req = store.getAll(null, limit);
            req.onsuccess = function(){ resolve(req.result || []); };
        });
    }

    // ============================================================
    // Export
    // ============================================================

    global.TWMaStorage = {
        openDb:                 openDb,
        saveWip:                saveWip,
        loadWip:                loadWip,
        deleteWip:              deleteWip,
        listWips:               listWips,
        setSetting:             setSetting,
        getSetting:             getSetting,
        deleteSetting:          deleteSetting,
        clearAllSettings:       clearAllSettings,
        sha256Hex:              sha256Hex,
        pinZuHash:              pinZuHash,
        speicherOnboarding:     speicherOnboarding,
        ladeOnboarding:         ladeOnboarding,
        loescheOnboarding:      loescheOnboarding,
        pinVersucheErhoehen:    pinVersucheErhoehen,
        pinVersucheResetten:    pinVersucheResetten,
        getPinVersuche:         getPinVersuche,
        enqueueSync:            enqueueSync,
        peekSyncQueue:          peekSyncQueue
    };

    console.log('[TWMaStorage] Stub geladen — IndexedDB wird on-demand geoeffnet.');

})(window);
