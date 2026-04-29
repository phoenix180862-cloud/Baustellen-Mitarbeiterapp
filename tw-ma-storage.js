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
    const DB_VERSION = 2;
    // v1 -> v2 (28.04.2026, Etappe 6 / B6.1):
    //   Neuer Store 'raeume' fuer Raum-Verwaltung pro Baustelle.
    //   Bestehende Stores werden NICHT migriert, alte Daten bleiben.

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
                // v2 (28.04.2026): raeume-Store fuer Etappe 6 (Modul Fotos)
                if (!db.objectStoreNames.contains('raeume')) {
                    const rstore = db.createObjectStore('raeume', { keyPath: 'id' });
                    rstore.createIndex('baustelle_id', 'baustelle_id', { unique: false });
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
    // Raeume-Store (Etappe 6 / B6.1)
    // ============================================================
    // Raeume gehoeren zu einer Baustelle, werden lokal gepflegt.
    // Sync zu Drive in Etappe 6 / B6.5 (zusammen mit Fotos).

    function saveRaum(raum) {
        if (!raum || !raum.id) return Promise.reject(new Error('Raum braucht id'));
        if (!raum.baustelle_id) return Promise.reject(new Error('Raum braucht baustelle_id'));
        return withStore('raeume', 'readwrite', function(store, resolve){
            const eintrag = Object.assign({}, raum, { geaendert_am: Date.now() });
            const req = store.put(eintrag);
            req.onsuccess = function(){ resolve(eintrag); };
        });
    }

    function listRaeume(baustelleId) {
        return withStore('raeume', 'readonly', function(store, resolve){
            const idx = store.index('baustelle_id');
            const req = idx.getAll(baustelleId);
            req.onsuccess = function(){ resolve(req.result || []); };
        });
    }

    function getRaum(id) {
        return withStore('raeume', 'readonly', function(store, resolve){
            const req = store.get(id);
            req.onsuccess = function(){ resolve(req.result || null); };
        });
    }

    function deleteRaum(id) {
        return withStore('raeume', 'readwrite', function(store, resolve){
            const req = store.delete(id);
            req.onsuccess = function(){ resolve(true); };
        });
    }

    // ============================================================
    // Foto-Anzahl pro Phase pro Raum
    // ============================================================

    function zaehleFotos(raumId) {
        return withStore('fotos', 'readonly', function(store, resolve){
            const req = store.getAll();
            req.onsuccess = function(){
                const alle = req.result || [];
                const result = { rohzustand: 0, vorarbeiten: 0, fertigstellung: 0 };
                alle.forEach(function(f){
                    if (f.raum_id === raumId && f.phase && result[f.phase] !== undefined) {
                        result[f.phase]++;
                    }
                });
                resolve(result);
            };
        });
    }

    // ============================================================
    // Fotos-Store (Etappe 6 / B6.2)
    // ============================================================
    // Datenstruktur (gemaess Master-Dokument 8.8):
    //   {
    //     id, baustelle_id, raum_id, phase, wand_id,
    //     foto_dataurl,          (komprimiert, JPEG q=0.85, max 1920px)
    //     thumbnail_dataurl,     (kleiner, fuer Wand-Kachel-Vorschau)
    //     notiz_original: {sprache, text},   (B6.4)
    //     notiz_deutsch,                     (B6.4)
    //     drawings: [],                      (B6.3)
    //     crop_rect: null,                   (B6.3)
    //     aufgenommen_am, aufgenommen_von,
    //     sync_status: 'pending' | 'uploaded' | 'fehler'
    //   }

    function saveFoto(foto) {
        if (!foto || !foto.id) return Promise.reject(new Error('Foto braucht id'));
        return withStore('fotos', 'readwrite', function(store, resolve){
            const eintrag = Object.assign({}, foto, { geaendert_am: Date.now() });
            const req = store.put(eintrag);
            req.onsuccess = function(){ resolve(eintrag); };
        });
    }

    function getFoto(id) {
        return withStore('fotos', 'readonly', function(store, resolve){
            const req = store.get(id);
            req.onsuccess = function(){ resolve(req.result || null); };
        });
    }

    function deleteFoto(id) {
        return withStore('fotos', 'readwrite', function(store, resolve){
            const req = store.delete(id);
            req.onsuccess = function(){ resolve(true); };
        });
    }

    // listFotos: nach raum_id (+ optional phase) gefiltert
    function listFotos(raumId, phase) {
        return withStore('fotos', 'readonly', function(store, resolve){
            const req = store.getAll();
            req.onsuccess = function(){
                const alle = req.result || [];
                const gefiltert = alle.filter(function(f){
                    if (f.raum_id !== raumId) return false;
                    if (phase && f.phase !== phase) return false;
                    return true;
                });
                resolve(gefiltert);
            };
        });
    }

    // ============================================================
    // Foto-Komprimierung (Canvas-basiert)
    // ============================================================
    // 1:1-Aequivalent zu Master-App TWStorage.compressFileToDataUrl.
    // Skaliert die laengere Seite auf maxSize, JPEG-Quality wie angegeben.
    //
    // Rueckgabe: Promise<{ dataUrl, breite, hoehe, originalGroesse, neueGroesse }>

    function compressFileToDataUrl(file, maxSize, quality) {
        if (!file) return Promise.reject(new Error('Keine Datei'));
        const max = (typeof maxSize === 'number' && maxSize > 0) ? maxSize : 1920;
        const q   = (typeof quality === 'number' && quality > 0 && quality <= 1) ? quality : 0.85;
        const originalGroesse = file.size || 0;

        return new Promise(function(resolve, reject){
            // 1. File als DataURL einlesen
            const reader = new FileReader();
            reader.onerror = function(){ reject(new Error('Datei konnte nicht gelesen werden')); };
            reader.onload = function(ev){
                // 2. In Image laden
                const img = new Image();
                img.onerror = function(){ reject(new Error('Bild konnte nicht dekodiert werden')); };
                img.onload = function(){
                    try {
                        // 3. Zielgroesse berechnen
                        let zielBreite  = img.width;
                        let zielHoehe   = img.height;
                        const laengsteSeite = Math.max(zielBreite, zielHoehe);
                        if (laengsteSeite > max) {
                            const skala = max / laengsteSeite;
                            zielBreite  = Math.round(zielBreite  * skala);
                            zielHoehe   = Math.round(zielHoehe   * skala);
                        }

                        // 4. Canvas erstellen + zeichnen
                        const canvas = document.createElement('canvas');
                        canvas.width  = zielBreite;
                        canvas.height = zielHoehe;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, zielBreite, zielHoehe);

                        // 5. JPEG mit Quality exportieren
                        const dataUrl = canvas.toDataURL('image/jpeg', q);
                        const neueGroesse = Math.round(dataUrl.length * 0.75); // base64 -> bytes approx

                        // Cleanup
                        canvas.width = 0; canvas.height = 0;

                        resolve({
                            dataUrl: dataUrl,
                            breite: zielBreite,
                            hoehe:  zielHoehe,
                            originalGroesse: originalGroesse,
                            neueGroesse: neueGroesse
                        });
                    } catch (err) {
                        reject(err);
                    }
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Thumbnail aus DataURL erzeugen (kleiner, fuer Kachel-Vorschau)
    function erzeugeThumbnail(dataUrl, maxSize) {
        const max = (typeof maxSize === 'number' && maxSize > 0) ? maxSize : 200;
        return new Promise(function(resolve, reject){
            const img = new Image();
            img.onerror = function(){ reject(new Error('Thumbnail-Erzeugung fehlgeschlagen')); };
            img.onload = function(){
                try {
                    let b = img.width, h = img.height;
                    const ls = Math.max(b, h);
                    if (ls > max) { const s = max/ls; b = Math.round(b*s); h = Math.round(h*s); }
                    const c = document.createElement('canvas');
                    c.width = b; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, b, h);
                    const thumb = c.toDataURL('image/jpeg', 0.7);
                    c.width = 0; c.height = 0;
                    resolve(thumb);
                } catch(e){ reject(e); }
            };
            img.src = dataUrl;
        });
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
        peekSyncQueue:          peekSyncQueue,
        // Etappe 6 / B6.1 - Raeume + Foto-Anzahl
        saveRaum:               saveRaum,
        listRaeume:             listRaeume,
        getRaum:                getRaum,
        deleteRaum:             deleteRaum,
        zaehleFotos:            zaehleFotos,
        // Etappe 6 / B6.2 - Fotos + Komprimierung
        saveFoto:               saveFoto,
        getFoto:                getFoto,
        deleteFoto:             deleteFoto,
        listFotos:              listFotos,
        compressFileToDataUrl:  compressFileToDataUrl,
        erzeugeThumbnail:       erzeugeThumbnail
    };

    console.log('[TWMaStorage] Stub geladen — IndexedDB wird on-demand geoeffnet.');

})(window);
